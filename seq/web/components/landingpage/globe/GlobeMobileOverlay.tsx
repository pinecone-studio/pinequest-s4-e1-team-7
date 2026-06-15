"use client";
import { m, AnimatePresence } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { GLOBE_ITEMS } from "./globeData";
import { EASE } from "../motion";

type Props = {
  compare: "before" | "after";
  setCompare: (c: "before" | "after") => void;
  setExpanded: (v: boolean) => void;
};

export const GlobeMobileOverlay = ({ compare, setCompare, setExpanded }: Props) => {
  const activeItem = GLOBE_ITEMS.find(i => i.mode === compare) ?? GLOBE_ITEMS[0];
  return (
    <div className="absolute inset-0 z-10 flex flex-col md:hidden">
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <m.div className="text-center" initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}>
          {GLOBE_ITEMS.map((item) => (
            <m.button key={item.mode} onClick={() => setCompare(item.mode)}
              className="block w-full font-black uppercase"
              style={{ fontSize: "clamp(4rem, 19vw, 7rem)", lineHeight: 0.86, letterSpacing: "-0.03em",
                color: item.accent, opacity: compare === item.mode ? 1 : 0.22, transition: "opacity 0.3s" }}
              variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: compare === item.mode ? 1 : 0.22, y: 0, transition: { duration: 0.55, ease: EASE } } }}>
              {item.label}
            </m.button>
          ))}
        </m.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 28px)", paddingTop: "70px",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)" }}>
        <AnimatePresence mode="wait">
          <m.div key={compare} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: EASE }} className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: activeItem.accent, fontFamily: "var(--font-display)" }}>{activeItem.tag}</p>
            <div className="mb-4 h-px" style={{ background: `${activeItem.accent}44` }} />
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {activeItem.stats.map(({ label, value }) => (
                <div key={label}>
                  <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-display)" }}>{label}</p>
                  <p className="font-black leading-tight"
                    style={{ color: activeItem.accent, fontSize: "clamp(1.3rem, 5.5vw, 1.9rem)", letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>{value}</p>
                </div>
              ))}
            </div>
          </m.div>
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(true)}
            className="flex flex-1 items-center justify-center rounded-full font-black uppercase tracking-wide transition-all active:scale-95"
            style={{ background: "#f5c518", color: "#0d1e35", padding: "16px 24px", fontSize: "13px", letterSpacing: "0.06em" }}>
            ДЭЛГЭРЭНГҮЙ ҮЗЭХ
          </button>
          <button onClick={() => setExpanded(true)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
            style={{ border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
            <ArrowRightIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
