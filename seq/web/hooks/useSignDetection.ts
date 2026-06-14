"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AllLandmarks } from "@/lib/mediapipe";
import * as sequenceRuntime from "@/lib/sequence-runtime";
import type { SequenceEmitter, SequenceRecognizer, SeqMetadata } from "@/lib/sequence-runtime";

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
  const metaRef = useRef<SeqMetadata | null>(null);
  const livePredRef = useRef<LivePred | null>(null);
  const lastLiveUiAtRef = useRef(0);
  const modelLoadStartedRef = useRef(false);
  const loadGenRef = useRef(0);
  const modelErrorRef = useRef(modelError);
  modelErrorRef.current = modelError;

  const resetSession = useCallback(() => {
    recognizerRef.current = null;
    emitterRef.current = null;
    livePredRef.current = null;
    lastLiveUiAtRef.current = 0;
    metaRef.current = null;
    modelLoadStartedRef.current = false;
    loadGenRef.current += 1;
    setModelReady(false);
    setModelLoading(false);
    setModelError("");
    setLivePred(null);
  }, []);

  const startLoad = useCallback(() => {
    if (modelLoadStartedRef.current && !modelErrorRef.current) return;
    modelLoadStartedRef.current = true;
    setModelError("");
    setModelLoading(true);

    const gen = loadGenRef.current;
    let cancelled = false;
    const loadTimeout = setTimeout(() => {
      if (cancelled || gen !== loadGenRef.current) return;
      setModelError(
        "Загвар ачаалах удаан байна. Хуудсыг refresh хийж, browser console (F12) шалгана уу."
      );
      setModelLoading(false);
      modelLoadStartedRef.current = false;
    }, 45_000);

    void (async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled || gen !== loadGenRef.current) return;

      const result = await sequenceRuntime.loadSequenceModelWithReason();
      if (cancelled || gen !== loadGenRef.current) return;
      clearTimeout(loadTimeout);
      setModelLoading(false);

      if (!result.ok) {
        modelLoadStartedRef.current = false;
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

      recognizerRef.current = new sequenceRuntime.SequenceRecognizer(
        result.model,
        result.meta
      );
      metaRef.current = result.meta;
      emitterRef.current = new sequenceRuntime.SequenceEmitter(
        sequenceRuntime.emitterOptionsFromMeta(result.meta)
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

  useEffect(() => () => resetSession(), [resetSession]);

  const handleLandmarks = useCallback(
    (lm: AllLandmarks) => {
      const rec = recognizerRef.current;
      const emitter = emitterRef.current;
      if (!rec || !emitter) return;

      const pred = rec.push(lm);
      const word = pred ? emitter.push(pred) : null;

      const now = performance.now();
      if (
        pred &&
        sequenceRuntime.isPredictionVisible(
          pred,
          metaRef.current?.neutralLabel,
          metaRef.current?.handSideModes,
          metaRef.current?.labels,
        ) &&
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

      if (sequenceRuntime.isStaticSign(word)) rec.resetAfterStaticEmit();
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
    resetSession,
  };
}
