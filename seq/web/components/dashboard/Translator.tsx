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
import { ChevronLeftIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import {
  appendDetectedWord,
  shouldAcceptWord,
} from "@/lib/caption-utils";

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
    [speak, settings, volume, pushHistory]
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
    if (running) return modelLoading ? "Загвар ачаалж байна…" : "Дохио хүлээж байна…";
    if (modelReady) return "Бэлэн — эхлүүлэх товч дарна уу";
    return "Камер ачаалж байна…";
  }, [running, modelReady, modelLoading, livePred]);

  const placeholder = running
    ? modelReady
      ? "Дохио хүлээж байна…"
      : modelLoading
        ? "Модел ачааллаж байна…"
        : "Дохио хүлээж байна…"
    : "Дохио танихын тулд эхлүүлнэ үү";

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
    <section className="db-section relative mt-4 w-full pb-8">
      {/* Header */}
      <div
        className="mb-4 flex items-center px-1 pt-2 lg:rounded-[20px] lg:border lg:px-5 lg:py-4"
        style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
      >
        <button
          type="button"
          onClick={() => {
            clearAll();
            router.back();
          }}
          aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
        </button>
        <div className="flex-1 text-center lg:text-left lg:pl-4">
          <h1 className="text-[17px] font-bold lg:text-[22px]" style={{ color: "var(--text)" }}>
            Дохионы хэл
          </h1>
          <p className="hidden text-[13px] lg:block" style={{ color: "var(--text-3)" }}>
            Дохионы хэлийг бодит цагт монгол текст болгоно
          </p>
          <div className="mt-0.5 flex items-center justify-center gap-1.5 lg:hidden">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: running ? "var(--olive)" : "var(--text-3)" }}
            />
            <span
              className="text-[11px] font-semibold"
              style={{ color: running ? "var(--olive)" : "var(--text-3)" }}
            >
              {running ? "Шууд таних" : "Зогссон"}
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-c)",
              color: "var(--text)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: running ? "#e53535" : "var(--text-3)" }}
            />
            {running ? "Дохио таних" : "Зогссон"}
          </span>
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            aria-label="Заавар"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" style={{ color: "var(--text-3)" }} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowOnboarding(true)}
          aria-label="Заавар"
          className="mr-1 flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" style={{ color: "var(--text-3)" }} />
        </button>
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Тохиргоо"
          className="flex h-10 w-10 items-center justify-center rounded-full lg:ml-0"
          style={{
            background: showSettings ? "var(--olive)" : "var(--surface)",
            border: `1px solid ${showSettings ? "var(--olive)" : "var(--border-c)"}`,
          }}
        >
          <Cog6ToothIcon className="h-5 w-5" style={{ color: showSettings ? "#0d1e35" : "var(--text)" }} />
        </button>
      </div>

      {/* Main: mobile = багана, desktop = 2 багана + доод control */}
      <div className="flex w-full flex-col gap-5 lg:grid lg:grid-cols-2 lg:grid-rows-[minmax(520px,1fr)_auto] lg:gap-6">
        {/* 1. Camera — нэг instance */}
        <section
          className="overflow-hidden rounded-[24px] lg:row-start-1 lg:col-start-1 lg:flex lg:min-h-[500px] lg:flex-col"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="relative h-[280px] w-full bg-black sm:h-[320px] lg:h-auto lg:min-h-0 lg:flex-1">
            <CameraView
              width={640}
              height={480}
              fullscreen
              manualStart
              active={running}
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
                Камер {running ? "идэвхтэй" : "бэлэн"}
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

            {!running && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/55 p-6">
                <p className="max-w-xs text-center text-[15px] font-medium leading-relaxed text-white/85">
                  Камерын зөвшөөрөл өгсний дараа дохио бодит цагт танигдана
                </p>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Эхлүүлэх"
                  className="flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[16px] font-bold transition-all active:scale-[0.97]"
                  style={{
                    background: "var(--olive)",
                    color: "#0d1e35",
                    boxShadow: "0 4px 24px rgba(245,197,24,0.4)",
                  }}
                >
                  <PlayIcon className="h-5 w-5" />
                  Эхлүүлэх
                </button>
              </div>
            )}

            {(modelError || modelLoading) && running && (
              <div className="pointer-events-none absolute inset-x-3 top-3 z-10 lg:top-12">
                <p
                  className="rounded-lg px-3 py-2 text-center text-xs"
                  style={{
                    background: modelError ? "rgba(245,158,11,0.9)" : "rgba(0,0,0,0.65)",
                    color: modelError ? "#1a1a1a" : "rgba(255,255,255,0.9)",
                  }}
                >
                  {modelError ?? "Загвар ачаалж байна…"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
            <p className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: "var(--text-3)" }}>
              {statusText}
            </p>
            <button
              type="button"
              onClick={toggle}
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
        <div className="hidden flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:flex">
          <TranslatorConversation
            detected={detected}
            running={running}
            modelReady={modelReady}
            livePred={livePred}
            placeholder={placeholder}
            textScale={settings.textScale}
          />
          {showSettings && (
            <TranslatorSettings
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
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
        <div className="lg:hidden">
          <TranslatorCard
            detected={detected}
            running={running}
            modelReady={modelReady}
            modelLoading={modelLoading}
            livePred={livePred}
            speaking={speaking}
            volume={volume}
            textScale={settings.textScale}
            onSpeak={handleSpeak}
            onVolumeChange={setVolume}
          />
        </div>

        {/* 3. Desktop: доод control bar */}
        <div className="hidden lg:col-span-2 lg:row-start-2 lg:block">
          <TranslatorControlBar
            running={running}
            detected={detected}
            onToggle={toggle}
            onSpeak={handleSpeak}
            onReset={clearAll}
          />
        </div>
      </div>

      {showOnboarding && <OnboardingSheet onDismiss={dismissOnboarding} />}
    </section>
  );
}
