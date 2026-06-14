"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { STARS, SPLIT, GLOBE_ITEMS } from "./globeData";
import { GlobeExpanded } from "./GlobeExpanded";
import { GlobeStatsPanel } from "./GlobeStatsPanel";
import { EASE } from "../motion";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

export const GlobeSection = () => {
  const [compare, setCompare]   = useState<"before" | "after">("after");
  const [expanded, setExpanded] = useState(false);
  const reduce  = useReducedMotion();
  const onBack  = useCallback(() => setExpanded(false), []);
  const activeItem = GLOBE_ITEMS.find(i => i.mode === compare) ?? GLOBE_ITEMS[0];

  return (
    <section id="globe" className="relative overflow-hidden bg-black" style={{ height: "100vh" }}>

      {/* Stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: +s.r, height: +s.r, opacity: +s.o }} />
        ))}
      </div>

      {/* Single globe — fills section, always mounted once */}
      <div className="absolute inset-0 z-[1] bg-black">
        <GlobeR3F onExpand={() => setExpanded(true)} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* ══════════════════ MOBILE overlay ══════════════════ */}
      <div className="absolute inset-0 z-10 flex flex-col md:hidden">

        {/* Center headings — tap to toggle */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <m.div className="text-center" initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}>
            {GLOBE_ITEMS.map((item) => (
              <m.button key={item.mode} onClick={() => setCompare(item.mode)}
                className="block w-full font-black uppercase"
                style={{
                  fontSize: "clamp(4rem, 19vw, 7rem)",
                  lineHeight: 0.86,
                  letterSpacing: "-0.03em",
                  color: item.accent,
                  opacity: compare === item.mode ? 1 : 0.22,
                  transition: "opacity 0.3s",
                }}
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: compare === item.mode ? 1 : 0.22, y: 0, transition: { duration: 0.55, ease: EASE } } }}>
                {item.label}
              </m.button>
            ))}
          </m.div>
        </div>

        {/* Bottom gradient + stats grid + CTA */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col px-6"
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom), 28px)",
            paddingTop: "70px",
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
          }}>

          <AnimatePresence mode="wait">
            <m.div key={compare}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: activeItem.accent }}>{activeItem.tag}</p>
              <div className="mb-4 h-px" style={{ background: `${activeItem.accent}44` }} />
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                {activeItem.stats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
                    <p className="font-black leading-tight"
                      style={{ color: activeItem.accent, fontSize: "clamp(1.3rem, 5.5vw, 1.9rem)", letterSpacing: "-0.02em" }}>
                      {value}
                    </p>
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

      {/* ══════════════════ DESKTOP overlay ══════════════════ */}
      <div className="absolute inset-0 z-10 hidden md:block">

        {/* Pulsing rings centered at SPLIT */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: 2 }}>
          <div className="absolute" style={{ left: `${SPLIT}%`, top: "50%", transform: "translate(-50%,-50%)", width: "90vh", height: "90vh" }}>
            <svg width="100%" height="100%" viewBox="0 0 900 900">
              {[0.28, 0.4, 0.54, 0.68, 0.82].map(f => (
                <circle key={f} cx={450} cy={450} r={450 * f} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
              ))}
              {!reduce && (
                <m.circle cx={450} cy={450} r={80} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5}
                  animate={{ r: [80, 400], opacity: [0.5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", repeatDelay: 1.5 }} />
              )}
            </svg>
          </div>
        </div>

        {/* Left panel — solid black covers globe on the left */}
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
                      style={{ color: isActive ? "#0d1e35" : "rgba(255,255,255,0.35)" }}>{i + 1}</span>
                  </div>
                  <span className="font-black uppercase transition-colors duration-300"
                    style={{ fontSize: "clamp(3rem, 6vw, 9rem)", lineHeight: 0.88, letterSpacing: "-0.03em", color: isActive ? item.accent : "rgba(255,255,255,0.55)" }}>
                    {item.label}
                  </span>
                </m.button>
              );
            })}
          </m.div>

          <div className="pl-[76px]">
            <AnimatePresence mode="wait">
              <m.div key={compare}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="flex flex-col gap-5">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: activeItem.accent }}>{activeItem.tag}</p>
                <div className="h-px" style={{ background: activeItem.accent, opacity: 0.35 }} />
                {activeItem.stats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.15em]"
                      style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
                    <p className="font-black leading-tight"
                      style={{ color: activeItem.accent, fontSize: "clamp(1.4rem, 2.6vw, 3rem)", letterSpacing: "-0.5px" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Divider line */}
        <m.div className="pointer-events-none absolute top-0 bottom-0 w-px"
          style={{ left: `${SPLIT}%`, background: "rgba(255,255,255,0.18)", transformOrigin: "top", zIndex: 15 }}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: EASE }} />

        {/* Expand button */}
        <button onClick={() => setExpanded(true)} aria-label="Өгөгдлийг судлах"
          className="absolute flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{ width: 64, height: 64, background: "#f5c518", left: `${SPLIT}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
          <ArrowRightIcon className="h-7 w-7" style={{ color: "#0d1e35" }} />
        </button>

        <GlobeStatsPanel visible={!expanded} compare={compare} />
      </div>

      {/* GlobeExpanded is fixed, renders above everything */}
      <AnimatePresence>
        {expanded && <GlobeExpanded onBack={onBack} />}
      </AnimatePresence>
    </section>
  );
};
