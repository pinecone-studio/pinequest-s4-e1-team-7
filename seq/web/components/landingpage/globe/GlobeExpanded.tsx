"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { EASE } from "../motion";
import { LEFT, GLOB_RATIO, ARC_ITEMS, STATS } from "./globeExpandedData";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

export const GlobeExpanded = ({ onBack }: { onBack: () => void }) => {
  const [filter, setFilter]     = useState("overview");
  const [spinning, setSpinning] = useState(true);
  const [hovered, setHovered]   = useState(false);
  const [arc, setArc]           = useState({ cx: 0, cy: 0, r: 0 });
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setArc({ cx: w * (LEFT + (100 - LEFT) / 2) / 100, cy: h * 0.5, r: h * GLOB_RATIO });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const handleHover = (h: boolean) => { setHovered(h); setSpinning(!h); };
  const stat = STATS[filter];
  const currentArcItem = ARC_ITEMS.find(a => a.id === filter) ?? ARC_ITEMS[0];

  const cycleFilter = () => {
    const idx = ARC_ITEMS.findIndex(a => a.id === filter);
    setFilter(ARC_ITEMS[(idx + 1) % ARC_ITEMS.length].id);
    setPanelOpen(false);
  };

  const toRad = (deg: number) => deg * Math.PI / 180;
  const pts = ARC_ITEMS.map(({ angle }) => ({ x: arc.cx + arc.r * Math.cos(toRad(angle)), y: arc.cy + arc.r * Math.sin(toRad(angle)) }));
  const a1  = { x: arc.cx + arc.r * Math.cos(toRad(235)), y: arc.cy + arc.r * Math.sin(toRad(235)) };
  const a2  = { x: arc.cx + arc.r * Math.cos(toRad(125)), y: arc.cy + arc.r * Math.sin(toRad(125)) };

  return (
    <m.div className="fixed inset-0 z-[110] bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}>

      {/* ═══════════════════════ MOBILE ═══════════════════════ */}
      <div className="md:hidden">
        <div className="absolute inset-0">
          <GlobeR3F spinning={spinning} onMarkerHover={handleHover} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-0 z-20 px-4"
          style={{ paddingTop: "max(env(safe-area-inset-top) + 12px, 16px)" }}>
          <div className="mb-3">
            <button onClick={onBack} aria-label="Буцах"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(10px)" }}>
              <ArrowLeftIcon className="h-4 w-4 text-white" />
            </button>
          </div>
          <button onClick={cycleFilter}
            className="flex w-full items-center rounded-full transition-all active:scale-[0.97]"
            style={{ background: "#f5c518", color: "#0d1e35", padding: "10px 20px 10px 10px", minHeight: "68px" }}>
            <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.18)" }}>
              <GlobeAltIcon className="h-6 w-6" />
            </div>
            <span className="flex-1 text-left text-[15px] font-black leading-snug line-clamp-2">
              {currentArcItem.label}
            </span>
            <ChevronDownIcon className="ml-3 h-6 w-6 shrink-0 opacity-70" />
          </button>
        </div>

        {/* Bottom stats panel */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <AnimatePresence mode="wait">
            {!panelOpen && (
              <m.div key="collapsed"
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex items-center gap-4 px-5"
                style={{ background: "rgba(5,5,5,0.9)", backdropFilter: "blur(16px)", paddingTop: "20px", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
                <span className="shrink-0 font-black leading-none"
                  style={{ color: "#f5c518", fontSize: "clamp(2.2rem, 9vw, 3rem)", letterSpacing: "-0.03em" }}>
                  {stat.big}
                </span>
                <span className="flex-1 text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {stat.bigLabel}
                </span>
                <button onClick={() => setPanelOpen(true)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
                  style={{ border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.07)" }}>
                  <ChevronUpIcon className="h-5 w-5 text-white" />
                </button>
              </m.div>
            )}

            {panelOpen && (
              <m.div key="expanded"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 40 }}
                className="px-5 pt-6"
                style={{ background: "rgba(5,5,5,0.94)", backdropFilter: "blur(20px)", borderRadius: "28px 28px 0 0", paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}>
                <div className="mb-5 flex items-center gap-4">
                  <span className="shrink-0 font-black leading-none"
                    style={{ color: "#f5c518", fontSize: "clamp(2.2rem, 9vw, 3rem)", letterSpacing: "-0.03em" }}>
                    {stat.big}
                  </span>
                  <span className="flex-1 text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {stat.bigLabel}
                  </span>
                  <button onClick={() => setPanelOpen(false)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
                    style={{ border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.07)" }}>
                    <ChevronDownIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
                {stat.rows.map(({ label, value }) => (
                  <div key={label}>
                    <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <div className="flex items-baseline gap-4 py-4">
                      <span className="shrink-0 font-black leading-none"
                        style={{ color: "#f5c518", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", letterSpacing: "-0.02em", minWidth: "max-content" }}>
                        {value}
                      </span>
                      <span className="text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
                  {stat.title}
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════ DESKTOP ═══════════════════════ */}
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
                  <m.span className="mr-3 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-bold"
                    style={{ background: "#f5c518", color: "#0d1e35" }}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, ease: EASE }}>
                    {label}
                  </m.span>
                )}
              </AnimatePresence>
              <button onClick={() => setFilter(id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                style={{ background: active ? "#f5c518" : "rgba(0,0,0,0.55)", border: `1.5px solid ${active ? "#f5c518" : "rgba(255,255,255,0.45)"}`, backdropFilter: "blur(8px)" }}>
                <Icon className="h-5 w-5" style={{ color: active ? "#0d1e35" : "rgba(255,255,255,0.85)" }} />
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
            <button onClick={onBack}
              className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              Буцах
            </button>
          </div>

          <AnimatePresence mode="wait">
            <m.div key={filter} className="flex flex-col"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: EASE }}>
              <p className="mb-6 max-w-[80%] text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{stat.title}</p>
              <div className="mb-6 h-px" style={{ background: "rgba(255,255,255,0.18)" }} />
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.55)" }}>{stat.bigLabel}</p>
              <p className="mb-8 font-black leading-[0.88]"
                style={{ color: "#f5c518", fontSize: "clamp(52px,6.5vw,96px)", letterSpacing: "-3px" }}>{stat.big}</p>
              <div className="mb-6 h-px" style={{ background: "rgba(255,255,255,0.18)" }} />
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {stat.rows.map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-2 text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
                    <p className="font-black" style={{ color: "#f5c518", fontSize: "clamp(26px,3.2vw,48px)" }}>{value}</p>
                  </div>
                ))}
              </div>
            </m.div>
          </AnimatePresence>

          <div className="pointer-events-none select-none font-black leading-none text-white"
            style={{ fontSize: "clamp(48px,7vw,96px)", opacity: 0.07, letterSpacing: "-4px" }}>2026</div>
        </div>

        <AnimatePresence>
          {hovered && (
            <m.div className="pointer-events-none absolute bottom-12" style={{ left: `${LEFT + 8}%` }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
              <div className="rounded-full px-4 py-2 text-[12px] font-bold"
                style={{ background: "#f5c518", color: "#0d1e35" }}>Монгол Улс — 25,000+</div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};
