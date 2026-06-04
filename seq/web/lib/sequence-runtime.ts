"use client";

import * as tf from "@tensorflow/tfjs";
import {
  FEATURE_DIM,
  LEFT_PRESENT_IDX,
  hasPose,
  normalizeFrame,
  packTrainingParityFrame,
} from "./landmarks";
import type { AllLandmarks } from "./mediapipe";

export type SeqMetadata = {
  labels: string[];
  neutralLabel: string;
  seqLen: number;
  featureDim: number;
  liveWindow: number;
  liveStride: number;
  stableMs?: number;
  gapBetweenWordsMs?: number;
  releaseMs?: number;
  minLiveConfidence?: number;
};

export type SeqPrediction = {
  label: string;
  confidence: number;
  isNeutral: boolean;
};

const MODEL_DIR = "/models/seq";

let tfReady: Promise<void> | null = null;

/** WebGL → WASM → CPU priority. WASM is often faster than WebGL for small TCN. */
export function ensureTfBackend(): Promise<void> {
  if (!tfReady) {
    tfReady = (async () => {
      const backends = ["webgl", "wasm", "cpu"];
      for (const b of backends) {
        try {
          await tf.setBackend(b);
          await tf.ready();
          console.info(`[TF] backend: ${b}`);
          return;
        } catch {
          // try next
        }
      }
    })();
  }
  return tfReady;
}

export async function loadSequenceModel(): Promise<{
  model: tf.LayersModel;
  meta: SeqMetadata;
} | null> {
  try {
    await ensureTfBackend();
    const metaRes = await fetch(`${MODEL_DIR}/metadata.json`, {
      cache: "no-store",
    });
    if (!metaRes.ok) {
      console.warn(`metadata fetch failed: ${metaRes.status}`);
      return null;
    }
    const meta = (await metaRes.json()) as SeqMetadata;
    if (meta.featureDim !== FEATURE_DIM) {
      console.error(
        `Feature mismatch: model=${meta.featureDim} client=${FEATURE_DIM}. ` +
          "landmarks.ts ба config.py-г тааруулна уу."
      );
    }
    const model = await tf.loadLayersModel(`${MODEL_DIR}/model.json`);
    return { model, meta };
  } catch (e) {
    console.warn("sequence model load failed", e);
    return null;
  }
}

export type ModelLoadError =
  | "missing_files"
  | "load_failed"
  | "feature_mismatch";

/** Like loadSequenceModel but returns why loading failed (for UI messages). */
export async function loadSequenceModelWithReason(): Promise<
  | { ok: true; model: tf.LayersModel; meta: SeqMetadata }
  | { ok: false; reason: ModelLoadError; detail?: string }
> {
  await ensureTfBackend();
  const metaRes = await fetch(`${MODEL_DIR}/metadata.json`, {
    cache: "no-store",
  });
  if (!metaRes.ok) {
    return {
      ok: false,
      reason: "missing_files",
      detail: `metadata.json HTTP ${metaRes.status}`,
    };
  }
  const meta = (await metaRes.json()) as SeqMetadata;
  if (meta.featureDim !== FEATURE_DIM) {
    return { ok: false, reason: "feature_mismatch" };
  }
  try {
    const model = await tf.loadLayersModel(`${MODEL_DIR}/model.json`);
    const recognizer = new SequenceRecognizer(model, meta);
    recognizer.warmup();
    return { ok: true, model, meta };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.warn("sequence model load failed", e);
    return { ok: false, reason: "load_failed", detail };
  }
}

export function emitterOptionsFromMeta(
  meta: SeqMetadata
): SeqEmitterOptions {
  return {
    minConfidence:       meta.minLiveConfidence ?? 0.74,
    minStreak:           5,
    streakMinAvgConf:    0.78,
    earlyExitConfidence: 0.96,
    postEmitBlockMs:     450,
    gapBetweenWordsMs:   meta.gapBetweenWordsMs ?? 550,
    sameLabelCooldownMs: 1000,
  };
}

/**
 * Sliding-window recognizer. Push one detection per frame; every `stride`
 * frames it runs the model over the most recent `seqLen` frames.
 */
export class SequenceRecognizer {
  private model: tf.LayersModel;
  private meta: SeqMetadata;
  private readonly T: number;
  private readonly frames: Float32Array[];
  private readonly flat: Float32Array;
  private readonly scratch = new Float32Array(FEATURE_DIM);
  private writePos = 0;
  private count = 0;
  private sinceInfer = 0;

  constructor(model: tf.LayersModel, meta: SeqMetadata) {
    this.model = model;
    this.meta = meta;
    this.T = meta.seqLen;
    this.frames = Array.from(
      { length: this.T },
      () => new Float32Array(FEATURE_DIM)
    );
    this.flat = new Float32Array(this.T * FEATURE_DIM);
  }

  get labels(): string[] {
    return this.meta.labels;
  }

  reset(): void {
    this.writePos = 0;
    this.count = 0;
    this.sinceInfer = 0;
  }

  /**
   * Emit дараа дуудна. Buffer-ийг бүрэн neutral (all-zero) frame-ээр дүүргэнэ.
   * Шинэ дохионы frame-үүд neutral frame-ийг дарж орж ирдэг тул модель нь
   * 12 frame биш ~6 frame-ийн дараа шинэ дохиог таних боломжтой болно.
   */
  resetWithNeutral(): void {
    for (let i = 0; i < this.T; i++) {
      this.frames[i].fill(0); // all-zero = no pose, no hands
    }
    this.count = this.T;     // buffer full → inference нэн даруй эхэлнэ
    this.writePos = 0;
    this.sinceInfer = 0;
  }

  /** One dry run to compile TF kernels before live use. */
  warmup(): void {
    this.resetWithNeutral();
    this.infer();
  }

  /** Returns a prediction only on stride frames once the window is full. */
  push(lm: AllLandmarks): SeqPrediction | null {
    if (!hasPose(lm)) return null;
    const raw = packTrainingParityFrame(lm);
    if (!raw) return null;

    this.frames[this.writePos].set(raw);
    this.writePos = (this.writePos + 1) % this.T;
    this.count = Math.min(this.count + 1, this.T);

    this.sinceInfer += 1;
    if (this.count < this.T) return null;
    if (this.sinceInfer < this.meta.liveStride) return null;
    this.sinceInfer = 0;

    return this.infer();
  }

  private infer(): SeqPrediction {
    const T = this.T;
    const start =
      this.count < T ? 0 : this.writePos;

    for (let t = 0; t < T; t++) {
      const idx = this.count < T ? t : (start + t) % T;
      normalizeFrame(this.frames[idx], this.scratch);
      this.flat.set(this.scratch, t * FEATURE_DIM);
    }

    const probs = tf.tidy(() => {
      const input = tf.tensor3d(this.flat, [1, T, FEATURE_DIM]);
      const out = this.model.predict(input) as tf.Tensor;
      return out.dataSync() as Float32Array;
    });

    let bestId = 0;
    let best = -1;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > best) {
        best = probs[i];
        bestId = i;
      }
    }
    const label = this.meta.labels[bestId] ?? this.meta.neutralLabel;
    return {
      label,
      confidence: best,
      isNeutral: label === this.meta.neutralLabel,
    };
  }

}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2: Streak-based Noise Filter
//
// Зарчим: нэг label N дараалсан frame-д байвал emit.
//   - Нэг ч буруу frame streak-ийг ТЭГЛЭНЭ → noise бараг нэвтрэхгүй
//   - Instant emit: нэг frame-д ≥ earlyConf → streak хүлээлгүй шууд emit
//
// seqLen=20, stride=1, 30fps → inference ~33ms/frame
//   streak=5 → ~165ms хүлээх (өмнөх 2–5 сектэй харьцуулахад маш хурдан)
//   noise burst (1-2 frame) → streak reset → emit болохгүй
// ─────────────────────────────────────────────────────────────────────────────

export type SeqEmitterOptions = {
  /** Prediction-ийг тооцох доод confidence. Үүнээс доош → streak reset. */
  minConfidence?: number;
  /**
   * Дараалан хэдэн prediction нэг label байвал emit хийх.
   * 4 = ~267ms at 15fps/stride=1.
   */
  minStreak?: number;
  /**
   * Streak prediction-уудын дундаж confidence-ийн доод хязгаар.
   */
  streakMinAvgConf?: number;
  /** Нэг frame-д энэ confidence-ийг давбал streak хүлээлгүй шууд emit. */
  earlyExitConfidence?: number;
  /**
   * Emit хийснээс хойш prediction-уудыг БҮРЭН хориглох хугацаа (ms).
   * Гарын шилжилтийн noise-ийг энд устгана. gapBetweenWordsMs-ээс бага байх.
   */
  postEmitBlockMs?: number;
  /** Emit хийснээс хойш дараагийн emit-ийг хориглох нийт цаг (ms). */
  gapBetweenWordsMs?: number;
  /** Яг ижил label-ийг дахин emit хийхгүй байх хугацаа (ms). */
  sameLabelCooldownMs?: number;
};

const DEFAULTS: Required<SeqEmitterOptions> = {
  minConfidence:       0.74,
  minStreak:           5,        // 5 × 67ms ≈ 335ms — transition rarely lasts this long
  streakMinAvgConf:    0.78,
  earlyExitConfidence: 0.96,     // instant emit шаардлага маш өндөр болгов
  postEmitBlockMs:     450,      // гарын шилжилт + буулгах хугацааг хамарна
  gapBetweenWordsMs:   550,
  sameLabelCooldownMs: 1000,
};

export type SeqEmitterStatus = {
  candidate: string | null;
  /** Streak явц: 0.0–1.0 (streakCount / minStreak). */
  candidateShare: number;
  locked: boolean;
};

export class SequenceEmitter {
  private opts: Required<SeqEmitterOptions>;
  private streakLabel: string | null = null;
  private streakCount = 0;
  private streakConfSum = 0;
  private lastEmitAt = 0;
  private lastEmittedLabel: string | null = null;
  private suppressUntil = 0;

  constructor(options?: SeqEmitterOptions) {
    this.opts = { ...DEFAULTS, ...options };
  }

  reset(): void {
    this._resetStreak();
    this.lastEmitAt = 0;
    this.lastEmittedLabel = null;
    this.suppressUntil = 0;
  }

  getStatus(now: number = performance.now()): SeqEmitterStatus {
    const locked = now - this.lastEmitAt < this.opts.gapBetweenWordsMs;
    const share = this.streakLabel
      ? Math.min(1, this.streakCount / this.opts.minStreak)
      : 0;
    return { candidate: this.streakLabel, candidateShare: share, locked };
  }

  push(pred: SeqPrediction | null, now: number = performance.now()): string | null {
    const sinceEmit = now - this.lastEmitAt;

    // ── 1. Post-emit hard block: гарын шилжилт дуустал бүгдийг хориглоно ──
    //    "like" зэрэг transition noise энд шүүгдэнэ.
    if (sinceEmit < this.opts.postEmitBlockMs) {
      this._resetStreak();
      return null;
    }

    // ── 2. Weak / neutral → streak тэглэнэ ────────────────────────────────
    if (!pred || pred.isNeutral || pred.confidence < this.opts.minConfidence) {
      this._resetStreak();
      return null;
    }

    // ── 3. Нийт gap шалгах (postEmitBlock → streak хуримтлах цаг) ─────────
    const fullyUnlocked = sinceEmit >= this.opts.gapBetweenWordsMs;

    // ── 4. Instant emit: streak ≥ 2 ба маш өндөр confidence ──────────────
    // Нэг л frame-д шийдэхгүй — дор хаяж 2 дараалсан frame шаардана.
    // Энэ нь transition-ийн нэг frame spike-ийг instant emit-ээс хамгаална.
    if (
      fullyUnlocked &&
      pred.confidence >= this.opts.earlyExitConfidence &&
      pred.label === this.streakLabel &&
      this.streakCount >= 2 &&
      !(pred.label === this.lastEmittedLabel && now < this.suppressUntil)
    ) {
      this._resetStreak();
      return this._emit(pred.label, now);
    }

    // ── 5. Streak tracking: нэг ч буруу frame → streak тэглэнэ ───────────
    if (pred.label === this.streakLabel) {
      this.streakCount++;
      this.streakConfSum += pred.confidence;
    } else {
      this.streakLabel = pred.label;
      this.streakCount = 1;
      this.streakConfSum = pred.confidence;
    }

    // ── 6. Streak хангагдсан уу? ───────────────────────────────────────────
    if (!fullyUnlocked) return null;
    if (this.streakCount < this.opts.minStreak) return null;

    const avgConf = this.streakConfSum / this.streakCount;
    if (avgConf < this.opts.streakMinAvgConf) return null;

    const label = this.streakLabel!;
    if (label === this.lastEmittedLabel && now < this.suppressUntil) return null;

    this._resetStreak();
    return this._emit(label, now);
  }

  private _resetStreak(): void {
    this.streakLabel = null;
    this.streakCount = 0;
    this.streakConfSum = 0;
  }

  private _emit(label: string, now: number): string {
    this.lastEmitAt = now;
    this.lastEmittedLabel = label;
    this.suppressUntil = now + this.opts.sameLabelCooldownMs;
    return label;
  }
}
