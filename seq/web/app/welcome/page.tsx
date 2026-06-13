"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredAppMode } from "@/lib/accessibility-mode";
import { a11ySpeak } from "@/lib/a11y-speak";
import { useA11yGestures } from "@/lib/use-a11y-gestures";

export default function WelcomePage() {
  const router = useRouter();

  const enterBlindMode = () => {
    setStoredAppMode("accessible");
    a11ySpeak("Харааны бэрхшээлтэй горим идэвхжлээ. Хайлтын хэсэгт байна.");
    router.push("/auth/login?next=/accessible/chat");
  };

  const { onTouchStart, onTouchEnd } = useA11yGestures({
    onSwipe: (dir) => {
      if (dir === "down") enterBlindMode();
    },
  });

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--bg)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Дээд 50% — Энгийн апп ────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center gap-5 px-6"
        style={{ minHeight: "50dvh" }}
      >
        <h1 className="text-3xl font-black" style={{ color: "var(--text)" }}>
          Sign Bridge
        </h1>
        <p className="max-w-xs text-center text-sm" style={{ color: "var(--text-3)" }}>
          Монгол дохионы хэл ↔ текст бодит цагийн орчуулга
        </p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/auth/login"
            className="rounded-2xl px-6 py-4 text-center text-lg font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)" }}
          >
            Нэвтрэх
          </Link>
          <Link
            href="/auth/register"
            className="rounded-2xl px-6 py-4 text-center text-lg font-bold"
            style={{ background: "var(--olive)", color: "#0d1e35" }}
          >
            Бүртгүүлэх
          </Link>
        </div>
      </div>

      {/* ── Хуваагч зураас ───────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center gap-3 px-6"
        style={{ borderTop: "2px dashed var(--border-c)" }}
      >
        <span className="flex-1 text-[11px] uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
          Доод тал — Харааны бэрхшээлтэй горим
        </span>
      </div>

      {/* ── Доод 50% — Харааны бэрхшээлтэй горим ───────────── */}
      <button
        type="button"
        onClick={enterBlindMode}
        className="flex flex-1 flex-col items-center justify-center gap-4 px-6 active:opacity-80"
        style={{
          minHeight: "50dvh",
          background: "color-mix(in srgb, #ffbf00 8%, var(--bg))",
        }}
        aria-label="Харааны бэрхшээлтэй горим — доод талыг дарна уу"
      >
        <span
          className="text-[4rem] leading-none select-none"
          aria-hidden
        >
          👆
        </span>
        <p className="text-center text-xl font-black" style={{ color: "#ffbf00" }}>
          Харааны бэрхшээлтэй горим
        </p>
        <p className="max-w-xs text-center text-sm" style={{ color: "var(--text-3)" }}>
          Swipe, брайль бичих, дуу уншуулах
        </p>
      </button>
    </div>
  );
}
