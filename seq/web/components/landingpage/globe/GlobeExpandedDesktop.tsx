"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EASE } from "../motion";
import { LEFT, GLOB_RATIO, ARC_ITEMS, STATS } from "./globeExpandedData";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

type Props = { filter: string; onFilter: (f: string) => void; onBack: () => void };

export const GlobeExpandedDesktop = ({ filter, onFilter, onBack }: Props) => {
  const [spinning, setSpinning] = useState(true);
  const [hovered, setHovered]   = useState(false);
  const [arc, setArc]           = useState({ cx: 0, cy: 0, r: 0 });

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setArc({ cx: w * (LEFT + (100 - LEFT) / 2) / 100, cy: h * 0.5, r: h * GLOB_RATIO });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const handleHover = (h: boolean) => { setHovered(h); setSpinning(!h); };
  const stat = STATS[filter];
  const toRad = (deg: number) => deg * Math.PI / 180;
  const pts = ARC_ITEMS.map(({ angle }) => ({ x: arc.cx + arc.r * Math.cos(toRad(angle)), y: arc.cy + arc.r * Math.sin(toRad(angle)) }));
  const a1  = { x: arc.cx + arc.r * Math.cos(toRad(235)), y: arc.cy + arc.r * Math.sin(toRad(235)) };
  const a2  = { x: arc.cx + arc.r * Math.cos(toRad(125)), y: arc.cy + arc.r * Math.sin(toRad(125)) };

  return (
    <div className="absolute inset-0 hidden md:block">
      <div className="absolute top-0 bottom-0 right-0" style={{ left: `${LEFT}%` }}>
        <GlobeR3F spinning={spinning} onMarkerHover={handleHover} style={{ width: "100%", height: "100%" }} />
      </div>

      {arc.r > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 4 }}>
          <path d={`M ${a1.x} ${a1.y} A ${arc.r} ${arc.r} 0 0 1 ${a2.x} ${a2.y}`}
            fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1} />
        </svg>
      )}

      {arc.r > 0 && ARC_ITEMS.map(({ id, Icon, label }, i) => {
        const pt = pts[i];
        const active = filter === id;
        return (
          <div key={id} className="absolute flex items-center"
            style={{ left: pt.x, top: pt.y, transform: "translate(-50%,-50%)", zIndex: 5 }}>
            <AnimatePresence>
              {active && (
                <m.span className="mr-4 whitespace-nowrap rounded-full px-5 py-2 text-[18px] font-bold"
                  style={{ background: "#f5c518", color: "#0d1e35" }}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, ease: EASE }}>
                  {label}
                </m.span>
              )}
            </AnimatePresence>
            <button onClick={() => onFilter(id)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: active ? "#f5c518" : "rgba(0,0,0,0.55)", border: `2px solid ${active ? "#f5c518" : "rgba(255,255,255,0.55)"}`, backdropFilter: "blur(8px)" }}>
              <Icon className="h-7 w-7" style={{ color: active ? "#0d1e35" : "rgba(255,255,255,0.9)" }} />
            </button>
          </div>
        );
      })}

      <div className="pointer-events-none absolute top-0 bottom-0 w-px"
        style={{ left: `${LEFT}%`, background: "rgba(255,255,255,0.1)", zIndex: 3 }} />

      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-10"
        style={{ width: `${LEFT}%`, paddingLeft: "clamp(28px,5vw,72px)", paddingRight: "clamp(16px,2vw,32px)", zIndex: 3 }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.28)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <ArrowLeftIcon className="h-4 w-4 text-white" />
          </button>
      
        </div>

        <AnimatePresence mode="wait">
          <m.div key={filter} className="flex flex-col"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: EASE }}>
            <p className="mb-7 max-w-[88%] text-[20px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-display)" }}>{stat.title}</p>
            <div className="mb-7 h-px" style={{ background: "rgba(255,255,255,0.22)" }} />
            <p className="mb-3 text-[16px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>{stat.bigLabel}</p>
            <p className="mb-9 font-black leading-[0.88]" style={{ color: "#f5c518", fontSize: "clamp(56px,6.5vw,88px)", letterSpacing: "-3px", fontFamily: "var(--font-display)" }}>{stat.big}</p>
            <div className="mb-7 h-px" style={{ background: "rgba(255,255,255,0.22)" }} />
            <div className="grid grid-cols-2 gap-x-8 gap-y-7">
              {stat.rows.map(({ label, value }) => (
                <div key={label}>
                  <p className="mb-2 text-[13px] leading-snug" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>{label}</p>
                  <p className="font-black" style={{ color: "#f5c518", fontSize: "clamp(36px,4vw,60px)", letterSpacing: "-1px", fontFamily: "var(--font-display)" }}>{value}</p>
                </div>
              ))}
            </div>
          </m.div>
        </AnimatePresence>

        <div className="pointer-events-none select-none font-black leading-none text-white"
          style={{ fontSize: "clamp(48px,7vw,96px)", opacity: 0.07, letterSpacing: "-4px", fontFamily: "var(--font-display)" }}>2026</div>
      </div>

      <AnimatePresence>
        {hovered && (
          <m.div className="pointer-events-none absolute bottom-12" style={{ left: `${LEFT + 8}%` }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
            <div className="rounded-full px-4 py-2 text-[12px] font-bold" style={{ background: "#f5c518", color: "#0d1e35", fontFamily: "var(--font-display)" }}>
              Монгол Улс - 16,000+
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
