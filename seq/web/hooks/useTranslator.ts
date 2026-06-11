"use client";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSignDetection } from "@/hooks/useSignDetection";
import { appendDetectedWord, shouldAcceptWord } from "@/lib/caption-utils";

export function useTranslator() {
  const { settings, updateSettings, pushHistory, toast } = useApp();
  const { speak, speaking } = useTextToSpeech();
  const [running, setRunning] = useState(false);
  const [detected, setDetected] = useState("");
  const [volume, setVolume] = useState(0.8);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const lastWordRef = useRef<{ word: string; at: number } | null>(null);

  useEffect(() => {
    if (localStorage.getItem("sb-translator-onboarding") !== "1") setShowOnboarding(true);
  }, []);

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem("sb-translator-onboarding", "1");
    setShowOnboarding(false);
  }, []);

  const onWord = useCallback(
    (word: string) => {
      const now = Date.now();
      if (!shouldAcceptWord(word, lastWordRef.current, now)) return;
      lastWordRef.current = { word, at: now };
      setDetected((prev) => appendDetectedWord(prev, word));
      pushHistory("sign", word);
      if (settings.autoSpeak) {
        speak(word, { ...settings, volume }).then((ok) => {
          if (!ok) toast("warn", "Дуу тоглуулахад алдаа гарлаа", "speaker-wave");
        });
      }
    },
    [speak, settings, volume, pushHistory, toast],
  );

  const { modelReady, modelError, modelLoading, livePred, startLoad, handleLandmarks, reset } =
    useSignDetection(onWord);

  const statusText = useMemo(() => {
    if (running && modelReady && livePred)
      return `${livePred.label} · ${(livePred.confidence * 100).toFixed(0)}%`;
    if (running) return modelLoading ? "Ачааллаж байна…" : "Хүлээж байна…";
    return "Камер ачааллаж байна…";
  }, [running, modelReady, modelLoading, livePred]);

  const placeholder = running
    ? modelLoading
      ? "Ачааллаж байна…"
      : "Хүлээж байна…"
    : "Бичвэр энд харагдана...";

  const clearAll = useCallback(() => {
    setDetected("");
    lastWordRef.current = null;
    reset();
  }, [reset]);

  const toggle = useCallback(
    () => setRunning((r) => { if (!r) clearAll(); return !r; }),
    [clearAll],
  );

  useEffect(() => { if (running) startLoad(); }, [running, startLoad]);
  useEffect(() => () => setRunning(false), []);

  const handleSpeak = useCallback(() => {
    if (detected) speak(detected, { ...settings, volume });
  }, [detected, speak, settings, volume]);

  return {
    running, detected, volume, setVolume, speaking,
    settings, updateSettings, showOnboarding, dismissOnboarding,
    modelReady, modelError, modelLoading, livePred,
    startLoad, handleLandmarks, statusText, placeholder,
    toggle, clearAll, handleSpeak,
  };
}
