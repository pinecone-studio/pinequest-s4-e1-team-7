"use client";

import { useCallback, useRef, useState } from "react";
import type { AllLandmarks } from "@/lib/mediapipe";
import type { SequenceEmitter, SequenceRecognizer } from "@/lib/sequence-runtime";

export type LivePred = {
  label: string;
  confidence: number;
  candidateShare: number;
  locked: boolean;
};

export function useSignDetection(onWord: (word: string) => void) {
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const [livePred, setLivePred] = useState<LivePred | null>(null);

  const recognizerRef = useRef<SequenceRecognizer | null>(null);
  const emitterRef = useRef<SequenceEmitter | null>(null);
  const runtimeRef = useRef<typeof import("@/lib/sequence-runtime") | null>(null);
  const livePredRef = useRef<LivePred | null>(null);
  const lastLiveUiAtRef = useRef(0);
  const modelLoadStartedRef = useRef(false);

  const startLoad = useCallback(() => {
    if (modelLoadStartedRef.current) return;
    modelLoadStartedRef.current = true;
    setModelLoading(true);

    let cancelled = false;
    const loadTimeout = setTimeout(() => {
      if (cancelled) return;
      setModelError(
        "Загвар ачаалах удаан байна. Хуудсыг refresh хийж, browser console (F12) шалгана уу."
      );
      setModelLoading(false);
    }, 45_000);

    void (async () => {
      await new Promise((r) => setTimeout(r, 100));
      const runtime = await import("@/lib/sequence-runtime");
      runtimeRef.current = runtime;
      const result = await runtime.loadSequenceModelWithReason();
      if (cancelled) return;
      clearTimeout(loadTimeout);
      setModelLoading(false);

      if (!result.ok) {
        if (result.reason === "missing_files") {
          setModelError(
            "Загварын файл олдсонгүй. seq/training дотор: python3 train.py"
          );
        } else if (result.reason === "feature_mismatch") {
          setModelError(
            "Feature тоо зөрсөн. landmarks.ts ба training/config.py-г тааруулна уу."
          );
        } else {
          setModelError("Загвар ачаалахад алдаа. cd seq/training && python3 export_model.py");
          if (result.detail) console.error(result.detail);
        }
        return;
      }

      recognizerRef.current = new runtime.SequenceRecognizer(result.model, result.meta);
      emitterRef.current = new runtime.SequenceEmitter(
        runtime.emitterOptionsFromMeta(result.meta)
      );
      console.info("[seq] model ready → detect эхэлж байна");
      setModelReady(true);

      const warmup = () => recognizerRef.current?.warmup();
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(warmup, { timeout: 3000 });
      } else {
        setTimeout(warmup, 800);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
    };
  }, []);

  const handleLandmarks = useCallback(
    (lm: AllLandmarks) => {
      const rec = recognizerRef.current;
      const emitter = emitterRef.current;
      const runtime = runtimeRef.current;
      if (!rec || !emitter || !runtime) return;

      const pred = rec.push(lm);
      const word = pred ? emitter.push(pred) : null;

      const now = performance.now();
      if (
        pred &&
        runtime.isPredictionVisible(pred) &&
        now - lastLiveUiAtRef.current >= 350
      ) {
        const st = emitter.getStatus(now);
        const next: LivePred = {
          label: pred.label,
          confidence: pred.confidence,
          candidateShare: st.candidateShare,
          locked: st.locked,
        };
        const prev = livePredRef.current;
        if (
          !prev ||
          prev.label !== next.label ||
          Math.abs(prev.confidence - next.confidence) > 0.04 ||
          prev.locked !== next.locked
        ) {
          lastLiveUiAtRef.current = now;
          livePredRef.current = next;
          setLivePred(next);
        }
      }

      if (!word) return;

      if (runtime.isStaticSign(word)) rec.resetAfterStaticEmit();
      else rec.resetAfterWordEmit();

      onWord(word);
    },
    [onWord]
  );

  const reset = useCallback(() => {
    setLivePred(null);
    livePredRef.current = null;
    recognizerRef.current?.resetWithNeutral();
    emitterRef.current?.reset();
  }, []);

  return {
    modelReady,
    modelError,
    modelLoading,
    livePred,
    startLoad,
    handleLandmarks,
    reset,
  };
}
