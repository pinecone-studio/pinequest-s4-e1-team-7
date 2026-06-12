"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppMode } from "@/context/AppModeContext";
import { a11ySpeak } from "@/lib/a11y-speak";
import { useA11yGestures } from "@/lib/use-a11y-gestures";
import { PageHeader } from "@/components/ui/PageHeader";

const OPTIONS = [
  {
    mode: "standard" as const,
    title: "Энгийн горим",
    desc: "Дохио, дуудлага, толь, бүх функц",
  },
  {
    mode: "accessible" as const,
    title: "Харааны бэрхшээлтэй",
    desc: "Чат — swipe, брайль, дуу уншуулах",
  },
];

export function ModePicker() {
  const router = useRouter();
  const { user } = useAuth();
  const { setMode } = useAppMode();

  useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user, router]);

  const pick = (mode: "standard" | "accessible") => {
    setMode(mode);
    const path =
      mode === "accessible" ? "/accessible/chat" : "/dashboard/overview";
    if (mode === "accessible") {
      a11ySpeak("Харааны бэрхшээлтэй горим.");
    }
    router.replace(path);
  };

  const { onTouchStart, onTouchEnd } = useA11yGestures({
    onSwipe: (dir) => {
      if (dir === "left") pick("standard");
      if (dir === "right") pick("accessible");
    },
    onDoubleTap: () => pick("accessible"),
  });

  if (!user) return null;

  return (
    <div
      className="flex min-h-dvh flex-col touch-manipulation"
      style={{ background: "var(--bg)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="px-4 pt-4">
        <PageHeader title="Горим сонгох" />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-24">
        {OPTIONS.map((opt) => (
          <button
            key={opt.mode}
            type="button"
            onClick={() => pick(opt.mode)}
            className="rounded-[18px] p-6 text-left active:scale-[0.99]"
            style={{
              background: "var(--surface)",
              border: `1px solid ${opt.mode === "accessible" ? "#ffbf00" : "var(--border-c)"}`,
            }}
            aria-label={opt.title}
          >
            <span
              className="block text-xl font-bold"
              style={{ color: opt.mode === "accessible" ? "#ffbf00" : "var(--text)" }}
            >
              {opt.title}
            </span>
            <span className="mt-2 block text-[14px]" style={{ color: "var(--text-3)" }}>
              {opt.desc}
            </span>
          </button>
        ))}

        <p className="text-center text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>
          Зүүн — энгийн. Баруун — харааны. Хоёр дар — харааны горим.
        </p>
      </div>
    </div>
  );
}
