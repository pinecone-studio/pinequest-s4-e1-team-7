"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { EASE } from "../motion";
import { ARC_ITEMS, STATS } from "./globeExpandedData";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

type Props = { filter: string; onFilter: (f: string) => void; onBack: () => void };

export const GlobeExpandedMobile = ({ filter, onFilter, onBack }: Props) => {
  const [spinning, setSpinning]   = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const currentArcItem = ARC_ITEMS.find(a => a.id === filter) ?? ARC_ITEMS[0];
  const stat = STATS[filter];

  const cycleFilter = () => {
    const idx = ARC_ITEMS.findIndex(a => a.id === filter);
    onFilter(ARC_ITEMS[(idx + 1) % ARC_ITEMS.length].id);
  };

  return (
    <div className="md:hidden">
      <div className="absolute inset-0">
        <GlobeR3F spinning={spinning} onMarkerHover={(h) => setSpinning(!h)} style={{ width: "100%", height: "100%" }} />
      </div>

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
          style={{ background: "#f5c518", color: "#0d1e35", padding: "10px 20px 10px 10px", minHeight: "68px", fontFamily: "var(--font-display)" }}>
          <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.18)" }}>
            <GlobeAltIcon className="h-6 w-6" />
          </div>
          <span className="flex-1 text-left text-[15px] font-black leading-snug line-clamp-2">{currentArcItem.label}</span>
          <ChevronDownIcon className="ml-3 h-6 w-6 shrink-0 opacity-70" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <AnimatePresence mode="wait">
          {!panelOpen && (
            <m.div key="collapsed" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex items-center gap-4 px-5"
              style={{ background: "rgba(5,5,5,0.9)", backdropFilter: "blur(16px)", paddingTop: "20px", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
              <span className="shrink-0 font-black leading-none" style={{ color: "#f5c518", fontSize: "clamp(2.2rem, 9vw, 3rem)", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{stat.big}</span>
              <span className="flex-1 text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display)" }}>{stat.bigLabel}</span>
              <button onClick={() => setPanelOpen(true)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
                style={{ border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.07)" }}>
                <ChevronUpIcon className="h-5 w-5 text-white" />
              </button>
            </m.div>
          )}
          {panelOpen && (
            <m.div key="expanded" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 40 }}
              className="px-5 pt-6"
              style={{ background: "rgba(5,5,5,0.94)", backdropFilter: "blur(20px)", borderRadius: "28px 28px 0 0", paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}>
              <div className="mb-5 flex items-center gap-4">
                <span className="shrink-0 font-black leading-none" style={{ color: "#f5c518", fontSize: "clamp(2.2rem, 9vw, 3rem)", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>{stat.big}</span>
                <span className="flex-1 text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display)" }}>{stat.bigLabel}</span>
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
                    <span className="shrink-0 font-black leading-none" style={{ color: "#f5c518", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", letterSpacing: "-0.02em", minWidth: "max-content", fontFamily: "var(--font-display)" }}>{value}</span>
                    <span className="text-[14px] leading-snug" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-display)" }}>{label}</span>
                  </div>
                </div>
              ))}
              <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-display)" }}>{stat.title}</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
