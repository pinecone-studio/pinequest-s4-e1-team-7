"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSignDetection } from "@/hooks/useSignDetection";
import { CameraView } from "@/components/CameraView";
import { TranslatorCard } from "./TranslatorCard";
import { TranslatorSettings } from "./TranslatorSettings";
import { OnboardingSheet } from "./OnboardingSheet";
import { ChevronLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";

const appendWord = (prev: string, word: string) => {
  const t = prev.trim();
  if (!t) return word;
  if (t.split(/\s+/).pop() === word) return prev;
  return `${t} ${word}`;
};

export function Translator() {
  const router = useRouter();
  const { settings, updateSettings, pushHistory } = useApp();
  const { speak } = useTextToSpeech();
  const [running, setRunning] = useState(false);
  const [detected, setDetected] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const onWord = useCallback(
    (word: string) => {
      setDetected((prev) => appendWord(prev, word));
      pushHistory("sign", word);
      if (settings.autoSpeak) {
        speak(word, { ...settings, volume });
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 2200);
      }
    },
    [speak, settings, volume, pushHistory],
  );

  const { modelReady, startLoad, handleLandmarks, reset } = useSignDetection(onWord);

  const toggle = () =>
    setRunning((r) => { if (!r) { setDetected(""); reset(); } return !r; });

  const handleSpeak = () => {
    if (!detected) return;
    speak(detected, { ...settings, volume });
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto md:h-[calc(100dvh-56px)] md:overflow-hidden md:rounded-2xl">
      <CameraView width={640} height={480} mirror inferenceActive={running && modelReady}
        onLandmarks={handleLandmarks} onMediaPipeReady={startLoad} showPreview fullscreen />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button onClick={() => router.back()} aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
          <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
        </button>
        <div className="rounded-full px-4 py-1.5 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
          <p className="text-[13px] font-bold uppercase tracking-widest" style={{ color: "var(--text)" }}>Дохионы хэл</p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full transition-colors duration-300" style={{ background: running ? "var(--olive)" : "var(--text-3)" }} />
            <span className="text-[11px] font-semibold transition-colors duration-300" style={{ color: running ? "var(--olive)" : "var(--text-3)" }}>
              {running ? "Шууд" : "Зогссон"}
            </span>
          </div>
        </div>
        <button onClick={() => setShowSettings((s) => !s)} aria-label="Тохиргоо"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
          style={{ background: showSettings ? "var(--olive)" : "var(--surface)", border: `1px solid ${showSettings ? "var(--olive)" : "var(--border-c)"}` }}>
          <Cog6ToothIcon className="h-5 w-5" style={{ color: showSettings ? "#0d1e35" : "var(--text)" }} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 pb-[max(env(safe-area-inset-bottom),24px)]">
        {showSettings && <TranslatorSettings settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />}
        <TranslatorCard detected={detected} running={running} modelReady={modelReady} speaking={speaking}
          volume={volume} onSpeak={handleSpeak} onVolumeChange={setVolume} />
        <div className="flex items-center justify-center py-2">
          <button onClick={toggle} aria-label={running ? "Зогсоох" : "Эхлүүлэх"}
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full transition-all duration-200 active:scale-95"
            style={{ background: "var(--olive)", boxShadow: running ? "0 0 0 10px rgba(245,197,24,0.15), 0 0 48px rgba(245,197,24,0.50)" : "0 4px 20px rgba(0,0,0,0.25)" }}>
            {running ? <StopIcon className="h-7 w-7 text-black" /> : <span className="h-6 w-6 rounded-full" style={{ background: "var(--text)" }} />}
          </button>
        </div>
      </div>

      {showOnboarding && <OnboardingSheet onDismiss={() => setShowOnboarding(false)} />}
    </div>
  );
}
