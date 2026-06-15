"use client";
import { m, AnimatePresence } from "framer-motion";
import { SPLIT, GLOBE_ITEMS } from "./globeData";
import { EASE } from "../motion";

type Props = { compare: "before" | "after"; setCompare: (c: "before" | "after") => void };

const SOURCES = [
  "* 7,800 Deaf (2023, UNDP) · 9,000–16,000 MSL users (linguistic est.)",
  "* <20 sign language interpreters nationwide - EMongolia academy",
  "* 18% employment rate for persons with disabilities — 2024 gov. data",
];

export const GlobeLeftPanel = ({ compare, setCompare }: Props) => {
  const activeItem = GLOBE_ITEMS.find(i => i.mode === compare) ?? GLOBE_ITEMS[0];
  return (
    <div className="absolute left-0 top-0 flex h-full flex-col justify-center bg-black px-[5vw]"
      style={{ width: `${SPLIT}%`, zIndex: 10 }}>

      <m.div className="mb-8 flex flex-col gap-3" initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}>
        {GLOBE_ITEMS.map((item, i) => {
          const isActive = compare === item.mode;
          return (
            <m.button key={item.mode} onClick={() => setCompare(item.mode)}
              className="flex items-center gap-5 text-left"
              variants={{ hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}>
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ border: `1.5px solid ${isActive ? item.accent : "rgba(255,255,255,0.18)"}`, transition: "border-color 0.3s" }}>
                {isActive && (
                  <m.div layoutId="pill" className="absolute inset-0 rounded-full"
                    style={{ background: item.accent }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10 text-[15px] font-black"
                  style={{ color: isActive ? "#0d1e35" : "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>{i + 1}</span>
              </div>
              <span className="font-black uppercase transition-colors duration-300"
                style={{ fontSize: "clamp(3rem, 6vw, 9rem)", lineHeight: 0.88, letterSpacing: "-0.03em", color: isActive ? item.accent : "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)" }}>
                {item.label}
              </span>
            </m.button>
          );
        })}
      </m.div>

      <div className="pl-[76px]">
        <AnimatePresence mode="wait">
          <m.div key={compare} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: EASE }} className="flex flex-col gap-5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: activeItem.accent, fontFamily: "var(--font-display)" }}>{activeItem.tag}</p>
            <div className="h-px" style={{ background: activeItem.accent, opacity: 0.35 }} />
            {activeItem.stats.map(({ label, value }) => (
              <div key={label}>
                <p className="mb-1 text-[13px] uppercase font-bold tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-display)" }}>{label}</p>
                <p className="font-black leading-tight"
                  style={{ color: activeItem.accent, fontSize: "clamp(1.4rem, 2.6vw, 3rem)", letterSpacing: "-0.5px", fontFamily: "var(--font-display)" }}>{value}</p>
              </div>
            ))}
          </m.div>
        </AnimatePresence>
      </div>

      {compare === "before" && (
        <div className="mt-8 pl-[76px] flex flex-col gap-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Эх сурвалж</p>
          {SOURCES.map(s => (
            <p key={s} className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-display)" }}>{s}</p>
          ))}
        </div>
      )}
    </div>
  );
};
