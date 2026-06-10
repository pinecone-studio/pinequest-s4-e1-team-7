"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSignDetection } from "@/hooks/useSignDetection";
import { CameraView } from "@/components/CameraView";
import { TranslatorCard } from "./TranslatorCard";
import { TranslatorSettings } from "./TranslatorSettings";
import { TranslatorConversation } from "./TranslatorConversation";
import { TranslatorControlBar } from "./TranslatorControlBar";
import { OnboardingSheet } from "./OnboardingSheet";
import { ChevronLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { appendDetectedWord, shouldAcceptWord } from "@/lib/caption-utils";

export function Translator() {
  const router = useRouter();
  const { settings, updateSettings, pushHistory } = useApp();
  const { speak } = useTextToSpeech();
  const [running, setRunning] = useState(false);
  const [detected, setDetected] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sb-translator-onboarding") !== "1") {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem("sb-translator-onboarding", "1");
    setShowOnboarding(false);
  }, []);
  const lastWordRef = useRef<{ word: string; at: number } | null>(null);

  const onWord = useCallback(
    (word: string) => {
      const now = Date.now();
      if (!shouldAcceptWord(word, lastWordRef.current, now)) return;
      lastWordRef.current = { word, at: now };
      setDetected((prev) => appendDetectedWord(prev, word));
      pushHistory("sign", word);
      if (settings.autoSpeak) {
        speak(word, { ...settings, volume });
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 2200);
      }
    },
    [speak, settings, volume, pushHistory],
  );

  const {
    modelReady,
    modelError,
    modelLoading,
    livePred,
    startLoad,
    handleLandmarks,
    reset,
  } = useSignDetection(onWord);

  const statusText = useMemo(() => {
    if (running && modelReady && livePred) {
      return `${livePred.label} · ${(livePred.confidence * 100).toFixed(0)}%`;
    }
    if (running) return modelLoading ? "Ачааллаж байна…" : "Хүлээж байна…";
    if (modelReady) return "Хөрвүүлэхэд бэлэн тул эхлүүлнэ үү.";
    return "Камер ачааллаж байна…";
  }, [running, modelReady, modelLoading, livePred]);

  const placeholder = running
    ? modelReady
      ? "Хүлээж байна…"
      : modelLoading
        ? "Ачааллаж байна…"
        : "Хүлээж байна…"
    : "Бичвэр энд харагдана...";

  const clearAll = useCallback(() => {
    setDetected("");
    lastWordRef.current = null;
    reset();
  }, [reset]);

  const toggle = () =>
    setRunning((r) => {
      const next = !r;
      if (next) clearAll();
      return next;
    });

  useEffect(() => {
    if (running) startLoad();
  }, [running, startLoad]);

  useEffect(() => {
    return () => setRunning(false);
  }, []);

  const handleSpeak = () => {
    if (!detected) return;
    speak(detected, { ...settings, volume });
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 2200);
  };

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-0 lg:max-w-none lg:px-10 lg:pb-4 xl:px-16">
        {/* Header */}
        <div className="flex items-center pb-2 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-c)",
            }}
          >
            <ChevronLeftIcon
              className="h-5 w-5"
              style={{ color: "var(--text)" }}
            />
          </button>
          <h1
            className="flex-1 text-center text-[17px] font-bold md:text-[20px]"
            style={{ color: "var(--text)" }}
          >
            Дохионы хэл
          </h1>
          {/* Settings gear — mobile only; desktop has no settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Тохиргоо"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70 lg:hidden"
            style={{
              background: showSettings ? "var(--olive)" : "var(--surface)",
              border: `1px solid ${showSettings ? "var(--olive)" : "var(--border-c)"}`,
            }}
          >
            <Cog6ToothIcon
              className="h-5 w-5"
              style={{ color: showSettings ? "#0d1e35" : "var(--text)" }}
            />
          </button>
          <div className="hidden h-10 w-10 lg:block" />
        </div>

        {/* Main: mobile = багана, desktop = 2 багана + доод control */}
        <div className="flex flex-1 min-h-0 flex-col gap-4 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:gap-5">
          {/* 1. Camera — нэг instance */}
          <section
            className="overflow-hidden rounded-[22px] lg:col-start-1 lg:flex lg:min-h-[440px] lg:flex-col lg:row-start-1"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-c)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="relative h-[220px] w-full bg-black sm:h-[260px] lg:h-auto lg:min-h-0 lg:flex-1">
              <CameraView
                width={640}
                height={480}
                fullscreen
                mirrorPreview
                mirrorDetect
                inferenceActive={running && modelReady}
                onLandmarks={handleLandmarks}
                onMediaPipeReady={startLoad}
                showPreview
              />

              <div className="absolute left-3 top-3 z-10 hidden items-center gap-2 lg:flex">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: running ? "var(--olive)" : "#888" }}
                  />
                  Камер {running ? "Идэвхтэй" : "Идэвхгүй"}
                </span>
                {running && livePred && (
                  <span
                    className="rounded-full px-3 py-1 font-mono text-[11px] text-white/85"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    {(livePred.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {(modelError || modelLoading) && (
                <div className="pointer-events-none absolute inset-x-3 top-3 z-10 lg:top-12">
                  <p
                    className="rounded-lg px-3 py-2 text-center text-xs"
                    style={{
                      background: modelError
                        ? "rgba(245,158,11,0.9)"
                        : "rgba(0,0,0,0.65)",
                      color: modelError ? "#1a1a1a" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {modelError ?? "Ачааллаж байна…"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
              <p
                className="min-w-0 flex-1 truncate text-[12px] font-medium"
                style={{ color: "var(--text-3)" }}
              >
                {statusText}
              </p>
              <button
                type="button"
                onClick={toggle}
                disabled={!modelReady && !running}
                aria-label={running ? "Зогсоох" : "Эхлүүлэх"}
                className="flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
                style={{
                  background: running ? "var(--surface-2)" : "var(--olive)",
                  color: running ? "var(--text)" : "#0d1e35",
                  border: running ? "1px solid var(--border-c)" : "none",
                }}
              >
                {running ? (
                  <>
                    <StopIcon className="h-4 w-4" />
                    Зогсоох
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Эхлүүлэх
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 2. Desktop: conversation panel */}
          <div className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:col-start-2 lg:row-start-1 lg:flex">
            <TranslatorConversation
              detected={detected}
              running={running}
              modelReady={modelReady}
              livePred={livePred}
              placeholder={placeholder}
              speaking={speaking}
              volume={volume}
              onSpeak={handleSpeak}
              onVolumeChange={setVolume}
              onReset={clearAll}
            />
          </div>

          {/* Mobile: settings + card */}
          {showSettings && (
            <div className="lg:hidden">
              <TranslatorSettings
                settings={settings}
                onUpdate={updateSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}
          <div className="flex flex-1 flex-col lg:hidden">
            <TranslatorCard
              detected={detected}
              running={running}
              modelLoading={modelLoading}
              speaking={speaking}
              volume={volume}
              onSpeak={handleSpeak}
              onVolumeChange={setVolume}
            />
          </div>

          {/* 3. Desktop: доод control bar */}
          <div className="hidden lg:col-span-2 lg:row-start-2 lg:block">
            <TranslatorControlBar
              running={running}
              modelReady={modelReady}
              gender={settings.gender}
              onToggle={toggle}
              onGenderChange={(g) => updateSettings({ gender: g })}
            />
          </div>
        </div>

        {showOnboarding && (
          <OnboardingSheet onDismiss={() => setShowOnboarding(false)} />
        )}
      </div>
    </div>
  );
}
