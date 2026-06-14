"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { useTranslator } from "@/hooks/useTranslator";
import { PageHeader } from "@/components/ui/PageHeader";
import { TranslatorCard } from "./TranslatorCard";
import { TranslatorSettings } from "./TranslatorSettings";
import { TranslatorConversation } from "./TranslatorConversation";
import { TranslatorControlBar } from "./TranslatorControlBar";
import { OnboardingSheet } from "../shared/OnboardingSheet";

const CameraView = dynamic(
  () =>
    import("@/components/CameraView").then((m) => ({ default: m.CameraView })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <span className="text-sm text-white/50">Камер ачааллаж байна…</span>
      </div>
    ),
  },
);

export function Translator() {
  const t = useTranslator();
  const [showSettings, setShowSettings] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  const handleToggle = useCallback(() => {
    if (t.running) setCameraKey((k) => k + 1);
    t.toggle();
  }, [t]);

  const startStopButton = (
    <button
      type="button"
      onClick={handleToggle}
      disabled={t.running && t.modelLoading}
      aria-label={t.running ? "Зогсоох" : "Эхлүүлэх"}
      className="flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
      style={{
        background: t.running ? "var(--surface-2)" : "var(--olive)",
        color: t.running ? "var(--text)" : "#0d1e35",
        border: t.running ? "1px solid var(--border-c)" : "none",
        boxShadow: t.running ? "none" : "0 4px 20px rgba(245,197,24,0.35)",
      }}
    >
      {t.running ? (
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
  );

  const settingsBtn = (
    <button
      type="button"
      onClick={() => setShowSettings((s) => !s)}
      aria-label="Тохиргоо"
      className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)] lg:hidden"
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
  );

  return (
    <div
      className="h-full overflow-y-auto overscroll-y-contain lg:flex lg:flex-col lg:overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 pb-[max(calc(env(safe-area-inset-bottom)+5.5rem),6.5rem)] lg:h-full lg:max-h-full lg:max-w-none lg:overflow-hidden lg:px-10 lg:pb-4 xl:px-16">
        <PageHeader title="Дохионы хэл" right={settingsBtn} />

        <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[1fr_auto] lg:gap-5">
          <section
            className="overflow-hidden rounded-[22px] lg:col-start-1 lg:flex lg:min-h-[440px] lg:flex-col lg:row-start-1"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-c)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="relative h-[280px] w-full bg-black sm:h-[320px] lg:h-auto lg:min-h-0 lg:flex-1">
              <CameraView
                key={cameraKey}
                width={640}
                height={480}
                fullscreen
                mirrorPreview
                mirrorDetect
                manualStart
                active={t.running}
                inferenceActive={t.running && t.modelReady}
                onLandmarks={t.handleLandmarks}
                onMediaPipeReady={t.startLoad}
                showPreview
              />

              <div className="absolute left-3 top-3 z-10 hidden items-center gap-2 lg:flex">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: t.running ? "var(--olive)" : "#888" }}
                  />
                  Камер {t.running ? "Идэвхтэй" : "Идэвхгүй"}
                </span>
                {t.running && t.livePred && (
                  <span
                    className="rounded-full px-3 py-1 font-mono text-[11px] text-white/85"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    {(t.livePred.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {(t.modelError || t.modelLoading) && (
                <div className="pointer-events-none absolute inset-x-3 top-3 z-10 lg:top-12">
                  <p
                    className="rounded-lg px-3 py-2 text-center text-xs"
                    style={{
                      background: t.modelError
                        ? "rgba(245,158,11,0.9)"
                        : "rgba(0,0,0,0.65)",
                      color: t.modelError ? "#1a1a1a" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {t.modelError ?? "Ачааллаж байна…"}
                  </p>
                </div>
              )}

              {!t.running && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
                  <p className="text-sm text-white/75 whitespace-nowrap">
                    Камер асаахын тулд эхлүүлэх товчийг дарна уу
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
              <p
                className="min-w-0 flex-1 truncate text-[12px] font-medium"
                style={{ color: "var(--text-3)" }}
              >
                {t.statusText}
              </p>
              <button
                type="button"
                onClick={handleToggle}
                disabled={t.running && t.modelLoading}
                aria-label={t.running ? "Зогсоох" : "Эхлүүлэх"}
                className="flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[13px] font-bold transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:brightness-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                style={{
                  background: t.running ? "var(--surface-2)" : "var(--olive)",
                  color: t.running ? "var(--text)" : "#0d1e35",
                  border: t.running ? "1px solid var(--border-c)" : "none",
                }}
              >
                {t.running && t.modelLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Ачааллаж...
                  </>
                ) : t.running ? (
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
              {startStopButton}
            </div>
          </section>

          <div className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:col-start-2 lg:row-start-1 lg:flex">
            <TranslatorConversation
              detected={t.detected}
              running={t.running}
              modelReady={t.modelReady}
              livePred={t.livePred}
              placeholder={t.placeholder}
              speaking={t.speaking}
              volume={t.volume}
              onSpeak={t.handleSpeak}
              onVolumeChange={t.setVolume}
              onReset={t.clearAll}
            />
          </div>

          {showSettings && (
            <div className="lg:hidden">
              <TranslatorSettings
                settings={t.settings}
                onUpdate={t.updateSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}
          <div className="lg:hidden">
            <TranslatorCard
              detected={t.detected}
              running={t.running}
              modelLoading={t.modelLoading}
              speaking={t.speaking}
              volume={t.volume}
              onSpeak={t.handleSpeak}
              onVolumeChange={t.setVolume}
            />
          </div>

          <div className="hidden lg:col-span-2 lg:row-start-2 lg:block">
            <TranslatorControlBar
              running={t.running}
              modelReady={t.modelReady}
              gender={t.settings.gender}
              onToggle={handleToggle}
              onGenderChange={(g) => t.updateSettings({ gender: g })}
            />
          </div>
        </div>

        {t.showOnboarding && (
          <OnboardingSheet onDismiss={t.dismissOnboarding} />
        )}
      </div>
    </div>
  );
}
