"use client";
import { useCallback, useRef, useState } from "react";
import type { AllLandmarks } from "@/lib/mediapipe";
import type { SequenceEmitter, SequenceRecognizer } from "@/lib/sequence-runtime";

export function useSignDetection(onWord: (word: string) => void) {
  const [modelReady, setModelReady] = useState(false);
  const recognizerRef = useRef<SequenceRecognizer | null>(null);
  const emitterRef = useRef<SequenceEmitter | null>(null);
  const runtimeRef = useRef<typeof import("@/lib/sequence-runtime") | null>(null);
  const startedRef = useRef(false);

  const startLoad = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      const runtime = await import("@/lib/sequence-runtime");
      runtimeRef.current = runtime;
      const result = await runtime.loadSequenceModelWithReason();
      if (!result.ok) return;
      recognizerRef.current = new runtime.SequenceRecognizer(result.model, result.meta);
      emitterRef.current = new runtime.SequenceEmitter(runtime.emitterOptionsFromMeta(result.meta));
      setModelReady(true);
    })();
  }, []);

  const handleLandmarks = useCallback((lm: AllLandmarks) => {
    const rec = recognizerRef.current;
    const emitter = emitterRef.current;
    const runtime = runtimeRef.current;
    if (!rec || !emitter || !runtime) return;
    const pred = rec.push(lm);
    const word = emitter.push(pred);
    if (!word) return;
    if (runtime.isStaticSign(word)) rec.resetAfterStaticEmit();
    else rec.resetWithNeutral();
    onWord(word);
  }, [onWord]);

  const reset = useCallback(() => {
    recognizerRef.current?.resetWithNeutral();
    emitterRef.current?.reset();
  }, []);

  return { modelReady, startLoad, handleLandmarks, reset };
}
