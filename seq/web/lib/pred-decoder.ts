"use client";

import * as tf from "@tensorflow/tfjs";
import type { SeqPrediction } from "./sequence-runtime";

export type DecoderMetadata = {
  window: number;
  featDim: number;
  nClasses: number;
  nActions: number;
  actions: string[];
  emitIndex: number;
  emitThreshold: number;
  minGapMs: number;
  sameLabelCooldownMs: number;
  labels: string[];
};

const DECODER_DIR = "/models/decoder";

export async function loadPredDecoder(): Promise<{
  model: tf.LayersModel;
  meta: DecoderMetadata;
} | null> {
  try {
    await tf.ready();
    const metaRes = await fetch(`${DECODER_DIR}/metadata.json`, {
      cache: "no-store",
    });
    if (!metaRes.ok) return null;
    const meta = (await metaRes.json()) as DecoderMetadata;
    const model = await tf.loadLayersModel(`${DECODER_DIR}/model.json`);
    return { model, meta };
  } catch (e) {
    console.warn("[decoder] load failed", e);
    return null;
  }
}

/**
 * Stage-2: pred stream → emit/silence/hold.
 * Stage-1-ийн бүх softmax + conf/margin/motion-ийг цонхоор уншина.
 */
export class PredStreamDecoder {
  private model: tf.LayersModel;
  private meta: DecoderMetadata;
  private readonly W: number;
  private readonly featDim: number;
  private buffer: Float32Array[] = [];
  private lastEmitAt = 0;
  private lastLabel: string | null = null;
  private suppressUntil = 0;

  constructor(model: tf.LayersModel, meta: DecoderMetadata) {
    this.model = model;
    this.meta = meta;
    this.W = meta.window;
    this.featDim = meta.featDim;
  }

  reset(): void {
    this.buffer = [];
    this.lastEmitAt = 0;
    this.lastLabel = null;
    this.suppressUntil = 0;
  }

  private _stepVector(pred: SeqPrediction): Float32Array | null {
    if (!pred.probs || pred.probs.length !== this.meta.nClasses) return null;
    const out = new Float32Array(this.featDim);
    out.set(pred.probs);
    out[this.meta.nClasses] = pred.confidence;
    out[this.meta.nClasses + 1] = pred.margin;
    out[this.meta.nClasses + 2] = pred.handMotion;
    return out;
  }

  push(pred: SeqPrediction | null, now: number = performance.now()): string | null {
    if (!pred) return null;
    const step = this._stepVector(pred);
    if (!step) return null;

    this.buffer.push(step);
    if (this.buffer.length > this.W) this.buffer.shift();
    if (this.buffer.length < this.W) return null;

    if (now - this.lastEmitAt < this.meta.minGapMs) return null;
    if (pred.label === "neutral" || pred.isNeutral) return null;

    const flat = new Float32Array(this.W * this.featDim);
    for (let i = 0; i < this.W; i++) {
      flat.set(this.buffer[i], i * this.featDim);
    }

    const actionProbs = tf.tidy(() => {
      const input = tf.tensor3d(flat, [1, this.W, this.featDim]);
      const out = this.model.predict(input) as tf.Tensor;
      return out.dataSync() as Float32Array;
    });

    const emitP = actionProbs[this.meta.emitIndex] ?? 0;
    if (emitP < this.meta.emitThreshold) return null;

    const label = pred.label;
    if (label === this.lastLabel && now < this.suppressUntil) return null;

    this.lastEmitAt = now;
    this.lastLabel = label;
    this.suppressUntil = now + this.meta.sameLabelCooldownMs;
    return label;
  }

  warmup(): void {
    if (this.buffer.length < this.W) {
      const zero = new Float32Array(this.featDim);
      while (this.buffer.length < this.W) this.buffer.push(zero.slice());
    }
    const flat = new Float32Array(this.W * this.featDim);
    tf.tidy(() => {
      const input = tf.tensor3d(flat, [1, this.W, this.featDim]);
      this.model.predict(input);
    });
  }
}
