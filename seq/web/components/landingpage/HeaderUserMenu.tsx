"use client";
import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppMode } from "@/context/AppModeContext";

const MODE_OPTIONS = [
  { mode: "standard" as const,   title: "Энгийн горим",           desc: "Дохио, дуудлага, толь, бүх функц", path: "/dashboard/translator" },
  { mode: "accessible" as const, title: "Харааны бэрхшээлтэй", desc: "Чат, брайль, яриа бичих",           path: "/accessible/chat" },
];

export const HeaderUserMenu = () => {
  const { setMode } = useAppMode();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const pick = (opt: typeof MODE_OPTIONS[number]) => {
    setOpen(false);
    setMode(opt.mode);
    router.push(opt.path);
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)} className="db-pillbtn green">Эхлэх</button>
      <AnimatePresence>
        {open && (
          <m.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-50 w-[min(280px,calc(100vw-32px))] rounded-2xl overflow-hidden shadow-xl"
            style={{ background: "var(--surface, #fff)", border: "1px solid var(--border-c, #e5e7eb)" }}>
            {MODE_OPTIONS.map((opt) => (
              <button key={opt.mode} type="button" onClick={() => pick(opt)}
                className="w-full text-left px-5 py-4 transition-colors hover:bg-black/5 active:bg-black/10">
                <span className="block text-[15px] font-bold"
                  style={{ color: opt.mode === "accessible" ? "#ffbf00" : "var(--text)", fontFamily: "var(--font-display)" }}>
                  {opt.title}
                </span>
                <span className="mt-1 block text-[13px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-display)" }}>{opt.desc}</span>
              </button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
