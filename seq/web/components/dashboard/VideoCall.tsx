"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { OnboardingSheet } from "./OnboardingSheet";

function genId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function VideoCall() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [sessionId] = useState(genId);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const startCall = () => {
    setShowOnboarding(false);
    setStarting(true);
    router.push(`/call/${sessionId}`);
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg)" }}>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 md:px-6 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-0 lg:max-w-none lg:px-10 xl:px-16">

        {/* Header */}
        <div className="flex items-center pb-2 pt-5">
          <button onClick={() => router.back()} aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}>
            <ChevronLeftIcon className="h-5 w-5" style={{ color: "var(--text)" }} />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold md:text-[20px]" style={{ color: "var(--text)" }}>
            Видео дуудлага
          </h1>
          <div className="h-10 w-10" />
        </div>

        {/* Start button */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <button onClick={startCall} disabled={starting} aria-label="Эхлүүлэх"
              className="flex h-[100px] w-[100px] items-center justify-center rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 md:h-[120px] md:w-[120px]"
              style={{
                background: "var(--olive)",
                boxShadow: starting
                  ? "0 0 0 16px rgba(245,197,24,0.18), 0 0 0 32px rgba(245,197,24,0.07)"
                  : "0 8px 28px rgba(0,0,0,0.15)",
              }}>
              <VideoCameraIcon className="h-12 w-12 text-black md:h-14 md:w-14" />
            </button>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
              style={{ color: starting ? "var(--olive)" : "var(--text-3)" }}>
              {starting ? "Нэгдэж байна..." : "Эхлүүлэх"}
            </p>
          </div>
        </div>

      </div>

      {showOnboarding && (
        <OnboardingSheet onDismiss={dismissOnboarding} onComplete={startCall} />
      )}
    </div>
  );
}
