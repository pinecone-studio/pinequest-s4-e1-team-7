"use client";

import * as tf from "@tensorflow/tfjs";
import {
  FEATURE_DIM,
  LEFT_PRESENT_IDX,
  N_COORDS,
  N_HAND,
  N_POSE,
  RIGHT_PRESENT_IDX,
  hasPose,
  isTwoHandMode,
  frameIsTwoHand,
  normalizeFrame,
  packRawVector,
  PACK_MIRROR_DETECT,
} from "./landmarks";
import type { AllLandmarks } from "./mediapipe";

export type SeqMetadata = {
  labels: string[];
  neutralLabel: string;
  seqLen: number;
  featureDim: number;
  liveWindow: number;
  liveStride: number;
  minLiveConfidence?: number;
  minStreak?: number;
  streakMinAvgConf?: number;
  earlyExitConfidence?: number;
  postEmitBlockMs?: number;
  gapBetweenWordsMs?: number;
  sameLabelCooldownMs?: number;
  staticSameLabelCooldownMs?: number;
  oneHandWordSameLabelCooldownMs?: number;
  /** ≥ this confidence → streak/gap алгасаж шууд emit. */
  instantEmitConfidence?: number;
  instantPostEmitBlockMs?: number;
  instantSameLabelCooldownMs?: number;
  /** Static single-letter signs — stricter conf/margin, faster streak when sure. */
  staticMinConfidence?: number;
  staticMinMargin?: number;
  staticStreakMinAvgConf?: number;
  staticEarlyExitConfidence?: number;
  staticMinStreak?: number;
  staticHoldMinMotion?: number;
  staticMaxMotion?: number;
  staticAnyLetterCooldownMs?: number;
  staticPostEmitBlockMs?: number;
  staticInstantEmitConfidence?: number;
  staticInstantPostEmitBlockMs?: number;
  staticInstantSameLabelCooldownMs?: number;
  staticResetClearFrac?: number;
  staticLiveInferFrames?: number;
  idleMaxMotion?: number;
  oneHandWordMinConfidence?: number;
  oneHandWordMinMargin?: number;
  oneHandWordMinStreak?: number;
  oneHandWordStreakMinAvgConf?: number;
  oneHandWordMinMotion?: number;
  oneHandWordAnyCooldownMs?: number;
  oneHandWordEarlyExitConfidence?: number;
  fragileOneHandLabels?: string[];
  fragileExtraConf?: number;
  fragileExtraMargin?: number;
  motionMinMargin?: number;
  /** Per label: 0=neutral/any, 1=one-hand only, 2=two-hand only (see hand_modes.json). */
  handModes?: number[];
  twoHandMinConfidence?: number;
  twoHandMinMargin?: number;
  twoHandMinStreak?: number;
  twoHandStreakMinAvgConf?: number;
  twoHandEarlyExitConfidence?: number;
  twoHandPostEmitBlockMs?: number;
  twoHandGapMs?: number;
  twoHandSameLabelCooldownMs?: number;
  twoHandWindowFrac?: number;
  twoHandMotionMin?: number;
};

export type SeqPrediction = {
  label: string;
  confidence: number;
  /** top1 − top2 softmax probability */
  margin: number;
  isNeutral: boolean;
  /** Current frame has both hands detected. */
  bothHands: boolean;
  /** Avg hand landmark motion in the sliding window. */
  handMotion: number;
};

/** Single Cyrillic/Latin letter (А, В, …) — not words like "би". */
export function isStaticSign(label: string, neutralLabel = "neutral"): boolean {
  if (label === neutralLabel) return false;
  const s = label.trim().replace(/_/g, " ");
  return s.length === 1 && /^[\p{L}]$/u.test(s);
}

/** Static letters are suppressed when both hands are visible (2-hand = motion/word). */
export function isPredictionVisible(
  pred: SeqPrediction,
  neutralLabel = "neutral"
): boolean {
  if (pred.isNeutral) return false;
  if (isStaticSign(pred.label, neutralLabel) && pred.bothHands) return false;
  return true;
}

/** 1-hand motion/word sign (би, сурагч, …) — not a single letter. */
export function isOneHandWord(
  label: string,
  handMode: number,
  neutralLabel = "neutral"
): boolean {
  return (
    handMode === 1 &&
    label !== neutralLabel &&
    !isStaticSign(label, neutralLabel)
  );
}

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
    neutralLabel:        meta.neutralLabel,
    labels:              meta.labels,
    handModes:           meta.handModes,
    minConfidence:       meta.minLiveConfidence ?? 0.68,
    minStreak:           meta.minStreak ?? 3,
    streakMinAvgConf:    meta.streakMinAvgConf ?? 0.72,
    earlyExitConfidence: meta.earlyExitConfidence ?? 0.88,
    postEmitBlockMs:     meta.postEmitBlockMs ?? 80,
    gapBetweenWordsMs:   meta.gapBetweenWordsMs ?? 80,
    sameLabelCooldownMs: meta.sameLabelCooldownMs ?? 1500,
    staticSameLabelCooldownMs: meta.staticSameLabelCooldownMs ?? 1800,
    oneHandWordSameLabelCooldownMs: meta.oneHandWordSameLabelCooldownMs ?? 2000,
    instantEmitConfidence: meta.instantEmitConfidence ?? 0.95,
    instantPostEmitBlockMs: meta.instantPostEmitBlockMs ?? 50,
    instantSameLabelCooldownMs: meta.instantSameLabelCooldownMs ?? 120,
    staticMinConfidence: meta.staticMinConfidence ?? 0.78,
    staticMinMargin:     meta.staticMinMargin ?? 0.16,
    staticStreakMinAvgConf: meta.staticStreakMinAvgConf ?? 0.76,
    staticEarlyExitConfidence: meta.staticEarlyExitConfidence ?? 0.85,
    staticMinStreak:     meta.staticMinStreak ?? 1,
    staticHoldMinMotion: meta.staticHoldMinMotion ?? 0.0005,
    staticMaxMotion:     meta.staticMaxMotion ?? 0.0045,
    staticAnyLetterCooldownMs: meta.staticAnyLetterCooldownMs ?? 0,
    staticPostEmitBlockMs: meta.staticPostEmitBlockMs ?? 12,
    staticInstantEmitConfidence: meta.staticInstantEmitConfidence ?? 0.85,
    staticInstantPostEmitBlockMs: meta.staticInstantPostEmitBlockMs ?? 8,
    staticInstantSameLabelCooldownMs: meta.staticInstantSameLabelCooldownMs ?? 1800,
    staticResetClearFrac: meta.staticResetClearFrac ?? 0.55,
    staticLiveInferFrames: meta.staticLiveInferFrames ?? 6,
    idleMaxMotion:       meta.idleMaxMotion ?? 0.002,
    oneHandWordMinConfidence: meta.oneHandWordMinConfidence ?? 0.78,
    oneHandWordMinMargin: meta.oneHandWordMinMargin ?? 0.16,
    oneHandWordMinStreak: meta.oneHandWordMinStreak ?? 5,
    oneHandWordStreakMinAvgConf: meta.oneHandWordStreakMinAvgConf ?? 0.80,
    oneHandWordMinMotion: meta.oneHandWordMinMotion ?? 0.0042,
    oneHandWordAnyCooldownMs: meta.oneHandWordAnyCooldownMs ?? 220,
    oneHandWordEarlyExitConfidence: meta.oneHandWordEarlyExitConfidence ?? 0.95,
    fragileOneHandLabels: meta.fragileOneHandLabels ?? ["миний", "Ганхөлөг"],
    fragileExtraConf:    meta.fragileExtraConf ?? 0.06,
    fragileExtraMargin:  meta.fragileExtraMargin ?? 0.08,
    motionMinMargin:     meta.motionMinMargin ?? 0.16,
    twoHandMinConfidence: meta.twoHandMinConfidence ?? 0.74,
    twoHandMinMargin:     meta.twoHandMinMargin ?? 0.10,
    twoHandMinStreak:     meta.twoHandMinStreak ?? 3,
    twoHandStreakMinAvgConf: meta.twoHandStreakMinAvgConf ?? 0.78,
    twoHandEarlyExitConfidence: meta.twoHandEarlyExitConfidence ?? 0.90,
    twoHandPostEmitBlockMs: meta.twoHandPostEmitBlockMs ?? 120,
    twoHandGapMs:         meta.twoHandGapMs ?? 150,
    twoHandSameLabelCooldownMs: meta.twoHandSameLabelCooldownMs ?? 500,
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
      this.frames[i].fill(0);
    }
    this.count = this.T;
    this.writePos = 0;
    this.sinceInfer = 0;
  }

  /**
   * Үсэг emit дараа — бүх buffer биш, хамгийн хуучин хэсгийг л цэвэрлэнэ.
   * Дараагийн үсэг ~2× хурдан танигдана.
   */
  resetAfterStaticEmit(clearFrac?: number): void {
    const frac = clearFrac ?? this.meta.staticResetClearFrac ?? 0.55;
    const clearCount = Math.max(4, Math.floor(this.T * frac));
    for (let k = 0; k < clearCount; k++) {
      const idx = (this.writePos + k) % this.T;
      this.frames[idx].fill(0);
    }
    this.sinceInfer = 0;
  }

  /** TF compile + buffer бэлэн. */
  warmup(): void {
    this.resetWithNeutral();
    this.infer(false);
  }

  /** Returns a prediction only on stride frames once the window is full. */
  /** Push raw landmarks — both hands, same layout as record.py (cv2.flip + detect). */
  push(lm: AllLandmarks): SeqPrediction | null {
    if (!hasPose(lm)) return null;
    const raw = packRawVector(lm, PACK_MIRROR_DETECT);
    if (raw[LEFT_PRESENT_IDX] === 0 && raw[RIGHT_PRESENT_IDX] === 0) {
      return null;
    }

    this.frames[this.writePos].set(raw);
    this.writePos = (this.writePos + 1) % this.T;
    this.count = Math.min(this.count + 1, this.T);

    this.sinceInfer += 1;
    if (this.count < this.T) return null;
    if (this.sinceInfer < this.meta.liveStride) return null;
    this.sinceInfer = 0;

    const mpHands = lm.hand?.landmarks?.length ?? 0;
    if (mpHands < 2) {
      const motion = this._windowHandMotion();
      return { ...this.infer(false), bothHands: false, handMotion: motion };
    }

    const motion = this._windowHandMotion();
    const frac = this._windowTwoHandFraction();
    const needFrac = this.meta.twoHandWindowFrac ?? 0.5;
    const bothHands = isTwoHandMode(lm, raw) && frac >= needFrac;
    return { ...this.infer(bothHands), bothHands, handMotion: motion };
  }

  private _latestFrame(): Float32Array {
    if (this.count === 0) return this.frames[0];
    return this.frames[(this.writePos - 1 + this.T) % this.T];
  }

  private _handPresentInFrame(f: Float32Array): boolean {
    return f[LEFT_PRESENT_IDX] > 0 || f[RIGHT_PRESENT_IDX] > 0;
  }

  /** Avg raw hand landmark motion per frame in the sliding window. */
  private _windowHandMotion(): number {
    const n = Math.min(this.count, this.T);
    if (n < 2) return 0;
    const start = this.count < this.T ? 0 : this.writePos;
    const hand0 = N_POSE * N_COORDS;
    const hand1 = hand0 + 2 * N_HAND * N_COORDS;
    let total = 0;
    let pairs = 0;
    for (let t = 1; t < n; t++) {
      const i0 = this.count < this.T ? t - 1 : (start + t - 1) % this.T;
      const i1 = this.count < this.T ? t : (start + t) % this.T;
      const f0 = this.frames[i0];
      const f1 = this.frames[i1];
      for (let i = hand0; i < hand1; i += N_COORDS) {
        const active =
          f0[i] !== 0 || f0[i + 1] !== 0 || f1[i] !== 0 || f1[i + 1] !== 0;
        if (!active) continue;
        total += Math.hypot(f1[i] - f0[i], f1[i + 1] - f0[i + 1]);
        pairs++;
      }
    }
    return pairs > 0 ? total / pairs : 0;
  }

  private _neutralPred(): Omit<SeqPrediction, "bothHands"> {
    return {
      label: this.meta.neutralLabel,
      confidence: 0,
      margin: 0,
      isNeutral: true,
    };
  }

  /** Share of buffered frames with two real hand blocks. */
  private _windowTwoHandFraction(): number {
    const n = Math.min(this.count, this.T);
    if (n === 0) return 0;
    const start = this.count < this.T ? 0 : this.writePos;
    let both = 0;
    for (let t = 0; t < n; t++) {
      const idx = this.count < this.T ? t : (start + t) % this.T;
      if (frameIsTwoHand(this.frames[idx])) both++;
    }
    return both / n;
  }

  /** Mask softmax: зөвхөн одоогийн гарын тоонд тохирох class-ууд үлдэнэ. */
  private _maskProbs(probs: Float32Array, bothHands: boolean): Float32Array {
    const modes = this.meta.handModes;
    if (!modes || modes.length !== probs.length) return probs;

    const want = bothHands ? 2 : 1;
    const out = new Float32Array(probs.length);
    let sum = 0;
    for (let i = 0; i < probs.length; i++) {
      const m = modes[i];
      const ok = m === 0 || m === want;
      out[i] = ok ? probs[i] : 0;
      sum += out[i];
    }

    // 1-гар: зөвхөн hand-mode mask (motion split хассан — renormalize буруу class-ийг өсгөдөг байсан)
    if (sum <= 1e-8) {
      const ni = this.meta.labels.indexOf(this.meta.neutralLabel);
      out.fill(0);
      if (ni >= 0) out[ni] = 1;
      return out;
    }
    for (let i = 0; i < out.length; i++) out[i] /= sum;
    return out;
  }

  private infer(bothHands: boolean): Omit<SeqPrediction, "bothHands"> {
    const motion = this._windowHandMotion();

    if (!bothHands) {
      const idleMax = this.meta.idleMaxMotion ?? 0.002;
      if (
        motion < idleMax &&
        !this._handPresentInFrame(this._latestFrame())
      ) {
        return this._neutralPred();
      }
    }

    if (bothHands) {
      const motionMin = this.meta.twoHandMotionMin ?? 0.0035;
      if (motion < motionMin) {
        return this._neutralPred();
      }
    }

    const T = this.T;
    const start = this.count < T ? 0 : this.writePos;

    for (let t = 0; t < T; t++) {
      const idx = this.count < T ? t : (start + t) % T;
      normalizeFrame(this.frames[idx], this.scratch);
      this.flat.set(this.scratch, t * FEATURE_DIM);
    }

    const rawProbs = tf.tidy(() => {
      const input = tf.tensor3d(this.flat, [1, T, FEATURE_DIM]);
      const out = this.model.predict(input) as tf.Tensor;
      return out.dataSync() as Float32Array;
    });
    const probs = this._maskProbs(rawProbs, bothHands);

    let bestId = 0;
    let best = -1;
    let second = -1;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > best) {
        second = best;
        best = probs[i];
        bestId = i;
      } else if (probs[i] > second) {
        second = probs[i];
      }
    }
    const label = this.meta.labels[bestId] ?? this.meta.neutralLabel;
    return {
      label,
      confidence: best,
      margin: best - Math.max(second, 0),
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
// seqLen=20, stride=1, 16fps → inference ~62ms/frame
//   streak=3 → ~186ms хүлээх
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
  staticSameLabelCooldownMs?: number;
  oneHandWordSameLabelCooldownMs?: number;
  instantEmitConfidence?: number;
  instantPostEmitBlockMs?: number;
  instantSameLabelCooldownMs?: number;
  staticMinConfidence?: number;
  staticMinMargin?: number;
  staticStreakMinAvgConf?: number;
  staticEarlyExitConfidence?: number;
  staticMinStreak?: number;
  staticHoldMinMotion?: number;
  staticMaxMotion?: number;
  staticAnyLetterCooldownMs?: number;
  staticPostEmitBlockMs?: number;
  staticInstantEmitConfidence?: number;
  staticInstantPostEmitBlockMs?: number;
  staticInstantSameLabelCooldownMs?: number;
  staticResetClearFrac?: number;
  staticLiveInferFrames?: number;
  idleMaxMotion?: number;
  oneHandWordMinConfidence?: number;
  oneHandWordMinMargin?: number;
  oneHandWordMinStreak?: number;
  oneHandWordStreakMinAvgConf?: number;
  oneHandWordMinMotion?: number;
  oneHandWordAnyCooldownMs?: number;
  oneHandWordEarlyExitConfidence?: number;
  fragileOneHandLabels?: string[];
  fragileExtraConf?: number;
  fragileExtraMargin?: number;
  motionMinMargin?: number;
  neutralLabel?: string;
  labels?: string[];
  handModes?: number[];
  twoHandMinConfidence?: number;
  twoHandMinMargin?: number;
  twoHandMinStreak?: number;
  twoHandStreakMinAvgConf?: number;
  twoHandEarlyExitConfidence?: number;
  twoHandPostEmitBlockMs?: number;
  twoHandGapMs?: number;
  twoHandSameLabelCooldownMs?: number;
};

type LabelBar = {
  minConfidence: number;
  minMargin: number;
  minStreak: number;
  streakMinAvgConf: number;
  earlyExitConfidence: number;
};

const DEFAULTS: Required<SeqEmitterOptions> = {
  neutralLabel:        "neutral",
  minConfidence:       0.68,
  minStreak:           3,
  streakMinAvgConf:    0.72,
  earlyExitConfidence: 0.88,
  postEmitBlockMs:     80,
  gapBetweenWordsMs:   80,
  sameLabelCooldownMs: 1500,
  staticSameLabelCooldownMs: 1800,
  oneHandWordSameLabelCooldownMs: 2000,
  instantEmitConfidence: 0.95,
  instantPostEmitBlockMs: 50,
  instantSameLabelCooldownMs: 1500,
  staticMinConfidence: 0.78,
  staticMinMargin:     0.16,
  staticStreakMinAvgConf: 0.76,
  staticEarlyExitConfidence: 0.85,
  staticMinStreak:     1,
  staticHoldMinMotion: 0.0005,
  staticMaxMotion:     0.0045,
  staticAnyLetterCooldownMs: 0,
  staticPostEmitBlockMs: 12,
  staticInstantEmitConfidence: 0.85,
  staticInstantPostEmitBlockMs: 8,
  staticInstantSameLabelCooldownMs: 1800,
  staticResetClearFrac: 0.55,
  staticLiveInferFrames: 6,
  idleMaxMotion:       0.002,
  oneHandWordMinConfidence: 0.78,
  oneHandWordMinMargin: 0.16,
  oneHandWordMinStreak: 5,
  oneHandWordStreakMinAvgConf: 0.80,
  oneHandWordMinMotion: 0.0042,
  oneHandWordAnyCooldownMs: 220,
  oneHandWordEarlyExitConfidence: 0.95,
  fragileOneHandLabels: ["миний", "Ганхөлөг"],
  fragileExtraConf:    0.06,
  fragileExtraMargin:  0.08,
  motionMinMargin:     0.16,
  twoHandMinConfidence: 0.74,
  twoHandMinMargin:     0.10,
  twoHandMinStreak:     3,
  twoHandStreakMinAvgConf: 0.78,
  twoHandEarlyExitConfidence: 0.90,
  twoHandPostEmitBlockMs: 120,
  twoHandGapMs:         150,
  twoHandSameLabelCooldownMs: 2500,
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
  private streakMarginSum = 0;
  private lastEmitAt = 0;
  private lastEmittedLabel: string | null = null;
  private lastEmitWasTwoHand = false;
  private lastEmitWasStatic = false;
  private suppressUntil = 0;
  private staticAnyLetterUntil = 0;
  private oneHandWordAnyUntil = 0;
  private fragileSet: Set<string>;

  constructor(options?: SeqEmitterOptions) {
    this.opts = { ...DEFAULTS, ...options };
    if (options?.fragileOneHandLabels) {
      this.fragileSet = new Set(options.fragileOneHandLabels);
    } else {
      this.fragileSet = new Set(DEFAULTS.fragileOneHandLabels);
    }
  }

  private _isFragile(label: string): boolean {
    return this.fragileSet.has(label);
  }

  private _handModeFor(label: string): number {
    const labels = this.opts.labels;
    const modes = this.opts.handModes;
    if (!labels?.length || !modes?.length) return 1;
    const i = labels.indexOf(label);
    if (i < 0) return 1;
    return modes[i] ?? 1;
  }

  private _bar(label: string): LabelBar {
    if (isStaticSign(label, this.opts.neutralLabel)) {
      return {
        minConfidence: this.opts.staticMinConfidence,
        minMargin: this.opts.staticMinMargin,
        minStreak: this.opts.staticMinStreak,
        streakMinAvgConf: this.opts.staticStreakMinAvgConf,
        earlyExitConfidence: this.opts.staticEarlyExitConfidence,
      };
    }
    if (this._handModeFor(label) === 2) {
      return {
        minConfidence: this.opts.twoHandMinConfidence,
        minMargin: this.opts.twoHandMinMargin,
        minStreak: this.opts.twoHandMinStreak,
        streakMinAvgConf: this.opts.twoHandStreakMinAvgConf,
        earlyExitConfidence: this.opts.twoHandEarlyExitConfidence,
      };
    }
    if (isOneHandWord(label, 1, this.opts.neutralLabel)) {
      return {
        minConfidence: this.opts.oneHandWordMinConfidence,
        minMargin: this.opts.oneHandWordMinMargin,
        minStreak: this.opts.oneHandWordMinStreak,
        streakMinAvgConf: this.opts.oneHandWordStreakMinAvgConf,
        earlyExitConfidence: this.opts.oneHandWordEarlyExitConfidence,
      };
    }
    return {
      minConfidence: this.opts.minConfidence,
      minMargin: this.opts.motionMinMargin,
      minStreak: this.opts.minStreak,
      streakMinAvgConf: this.opts.streakMinAvgConf,
      earlyExitConfidence: this.opts.earlyExitConfidence,
    };
  }

  private _sameLabelCooldownMs(label: string): number {
    if (isStaticSign(label, this.opts.neutralLabel)) {
      return this.opts.staticSameLabelCooldownMs;
    }
    if (this._handModeFor(label) === 2) {
      return this.opts.twoHandSameLabelCooldownMs;
    }
    if (isOneHandWord(label, 1, this.opts.neutralLabel)) {
      return this.opts.oneHandWordSameLabelCooldownMs;
    }
    return this.opts.sameLabelCooldownMs;
  }

  private _isSameLabelBlocked(label: string, now: number): boolean {
    return label === this.lastEmittedLabel && now < this.suppressUntil;
  }

  private _instantThreshold(label: string): number {
    if (isStaticSign(label, this.opts.neutralLabel)) {
      return this.opts.staticInstantEmitConfidence;
    }
    return this.opts.instantEmitConfidence;
  }

  private _instantBlockMs(label: string): number {
    if (isStaticSign(label, this.opts.neutralLabel)) {
      return this.opts.staticInstantPostEmitBlockMs;
    }
    return this.opts.instantPostEmitBlockMs;
  }

  private _gapMs(label: string): number {
    if (isStaticSign(label, this.opts.neutralLabel)) {
      return this.opts.staticPostEmitBlockMs;
    }
    return this._handModeFor(label) === 2
      ? this.opts.twoHandGapMs
      : this.opts.gapBetweenWordsMs;
  }

  private _passesBar(pred: SeqPrediction, bar: LabelBar): boolean {
    if (
      isStaticSign(pred.label, this.opts.neutralLabel) &&
      pred.bothHands
    ) {
      return false;
    }
    if (isStaticSign(pred.label, this.opts.neutralLabel)) {
      if (pred.handMotion > this.opts.staticMaxMotion) return false;
    }
    if (
      isOneHandWord(
        pred.label,
        this._handModeFor(pred.label),
        this.opts.neutralLabel
      )
    ) {
      if (pred.handMotion < this.opts.oneHandWordMinMotion) return false;
    }

    let minConf = bar.minConfidence;
    let minMargin = bar.minMargin;
    if (this._isFragile(pred.label)) {
      minConf += this.opts.fragileExtraConf;
      minMargin += this.opts.fragileExtraMargin;
    }

    return (
      !pred.isNeutral &&
      pred.confidence >= minConf &&
      pred.margin >= minMargin
    );
  }

  getStatus(now: number = performance.now()): SeqEmitterStatus {
    const locked = now - this.lastEmitAt < this.opts.gapBetweenWordsMs;
    const bar = this.streakLabel ? this._bar(this.streakLabel) : null;
    const need = bar?.minStreak ?? this.opts.minStreak;
    const share = this.streakLabel
      ? Math.min(1, this.streakCount / need)
      : 0;
    return { candidate: this.streakLabel, candidateShare: share, locked };
  }

  push(pred: SeqPrediction | null, now: number = performance.now()): string | null {
    if (!pred) {
      this._resetStreak();
      return null;
    }

    const bar = this._bar(pred.label);
    if (!this._passesBar(pred, bar)) {
      this._resetStreak();
      return null;
    }

    if (this._isSameLabelBlocked(pred.label, now)) {
      this._resetStreak();
      return null;
    }

    const sinceEmit = now - this.lastEmitAt;
    const instantConf = this._instantThreshold(pred.label);
    const instantBlock = this._instantBlockMs(pred.label);

    // Instant — үсэг 90%+, бусад 95%+: streak/gap алгасаж шууд emit
    if (
      pred.confidence >= instantConf &&
      pred.margin >= bar.minMargin &&
      sinceEmit >= instantBlock
    ) {
      this._resetStreak();
      return this._emit(pred.label, now, { instant: true });
    }

    const blockMs = this.lastEmitWasTwoHand
      ? this.opts.twoHandPostEmitBlockMs
      : this.lastEmitWasStatic
        ? this.opts.staticPostEmitBlockMs
        : this.opts.postEmitBlockMs;

    if (sinceEmit < blockMs) {
      this._resetStreak();
      return null;
    }

    if (
      isStaticSign(pred.label, this.opts.neutralLabel) &&
      this.opts.staticAnyLetterCooldownMs > 0 &&
      now < this.staticAnyLetterUntil
    ) {
      this._resetStreak();
      return null;
    }

    if (
      isOneHandWord(
        pred.label,
        this._handModeFor(pred.label),
        this.opts.neutralLabel
      ) &&
      now < this.oneHandWordAnyUntil
    ) {
      this._resetStreak();
      return null;
    }

    const gapMs = this._gapMs(pred.label);
    const fullyUnlocked = sinceEmit >= gapMs;
    const isStatic = isStaticSign(pred.label, this.opts.neutralLabel);
    const earlyStreak = isStatic ? 1 : this._handModeFor(pred.label) === 2 ? 3 : 2;

    // 88–95% — streak богино early exit
    if (
      fullyUnlocked &&
      pred.confidence >= bar.earlyExitConfidence &&
      pred.margin >= bar.minMargin + 0.04 &&
      pred.label === this.streakLabel &&
      this.streakCount >= earlyStreak
    ) {
      this._resetStreak();
      return this._emit(pred.label, now);
    }

    if (pred.label === this.streakLabel) {
      this.streakCount++;
      this.streakConfSum += pred.confidence;
      this.streakMarginSum += pred.margin;
    } else {
      this.streakLabel = pred.label;
      this.streakCount = 1;
      this.streakConfSum = pred.confidence;
      this.streakMarginSum = pred.margin;
    }

    if (!fullyUnlocked) return null;

    const emitBar = this._bar(this.streakLabel!);
    if (this.streakCount < emitBar.minStreak) return null;

    const avgConf = this.streakConfSum / this.streakCount;
    const avgMargin = this.streakMarginSum / this.streakCount;
    if (avgConf < emitBar.streakMinAvgConf) return null;
    if (avgMargin < emitBar.minMargin) return null;

    const label = this.streakLabel!;

    this._resetStreak();
    return this._emit(label, now);
  }

  reset(): void {
    this._resetStreak();
    this.lastEmitAt = 0;
    this.lastEmittedLabel = null;
    this.lastEmitWasTwoHand = false;
    this.lastEmitWasStatic = false;
    this.suppressUntil = 0;
    this.staticAnyLetterUntil = 0;
    this.oneHandWordAnyUntil = 0;
  }

  private _resetStreak(): void {
    this.streakLabel = null;
    this.streakCount = 0;
    this.streakConfSum = 0;
    this.streakMarginSum = 0;
  }

  private _emit(
    label: string,
    now: number,
    opts?: { instant?: boolean }
  ): string {
    const twoHand = this._handModeFor(label) === 2;
    const isStatic = isStaticSign(label, this.opts.neutralLabel);
    const isWord = isOneHandWord(
      label,
      this._handModeFor(label),
      this.opts.neutralLabel
    );
    this.lastEmitAt = now;
    this.lastEmittedLabel = label;
    this.lastEmitWasTwoHand = twoHand;
    this.lastEmitWasStatic = isStatic;

    this.suppressUntil = now + this._sameLabelCooldownMs(label);

    if (opts?.instant) {
      if (isStatic && this.opts.staticAnyLetterCooldownMs > 0) {
        this.staticAnyLetterUntil =
          now + this.opts.staticAnyLetterCooldownMs;
      }
      if (isWord) {
        this.oneHandWordAnyUntil = now + this.opts.oneHandWordAnyCooldownMs;
      }
    } else {
      if (isStatic && this.opts.staticAnyLetterCooldownMs > 0) {
        this.staticAnyLetterUntil =
          now + this.opts.staticAnyLetterCooldownMs;
      }
      if (isWord) {
        this.oneHandWordAnyUntil =
          now + this.opts.oneHandWordAnyCooldownMs;
      }
    }
    return label;
  }
}
