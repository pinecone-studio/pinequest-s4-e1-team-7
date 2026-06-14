"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { STARS, SPLIT } from "./globeData";
import { GlobeExpanded } from "./GlobeExpanded";
import { GlobeStatsPanel } from "./GlobeStatsPanel";
import { GlobeMobileOverlay } from "./GlobeMobileOverlay";
import { GlobeLeftPanel } from "./GlobeLeftPanel";
import { EASE } from "../motion";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

export const GlobeSection = () => {
  const [compare, setCompare] = useState<"before" | "after">("after");
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  const onBack = useCallback(() => setExpanded(false), []);

  return (
    <section id="globe" className="relative overflow-hidden bg-black" style={{ height: "100vh" }}>

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: +s.r, height: +s.r, opacity: +s.o }} />
        ))}
      </div>

      <div className="absolute z-[1] left-[5%] right-[5%] top-[6vh] h-[42vh] md:left-1/2 md:right-0 md:top-0 md:bottom-0 md:h-auto">
        <GlobeR3F onExpand={() => setExpanded(true)} style={{ width: "100%", height: "100%" }} />
      </div>

      <GlobeMobileOverlay compare={compare} setCompare={setCompare} setExpanded={setExpanded} />

      <div className="absolute inset-0 z-10 hidden md:block">
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

        <GlobeLeftPanel compare={compare} setCompare={setCompare} />

        <m.div className="pointer-events-none absolute top-0 bottom-0 w-px"
          style={{ left: `${SPLIT}%`, background: "rgba(255,255,255,0.18)", transformOrigin: "top", zIndex: 15 }}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: EASE }} />

        <button onClick={() => setExpanded(true)} aria-label="Өгөгдлийг судлах"
          className="absolute flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{ width: 64, height: 64, background: "#f5c518", left: `${SPLIT}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
          <ArrowRightIcon className="h-7 w-7" style={{ color: "#0d1e35" }} />
        </button>

        <GlobeStatsPanel visible={!expanded} compare={compare} />
      </div>

      <AnimatePresence>
        {expanded && <GlobeExpanded onBack={onBack} />}
      </AnimatePresence>
    </section>
  );
};
