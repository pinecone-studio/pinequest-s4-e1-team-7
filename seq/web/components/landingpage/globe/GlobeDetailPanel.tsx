"use client";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { DETAIL_STATS } from "./globeData";
import { EASE } from "../motion";

export const GlobeDetailPanel = ({ selected, onBack }: { selected: boolean; onBack: () => void }) => (
  <AnimatePresence>
    {selected && (
      <m.div
        key="detail"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute top-0 bottom-0 left-0 hidden lg:flex flex-col"
        style={{ width: "36%", paddingTop: "clamp(80px,10vh,108px)", paddingLeft: "clamp(28px,5vw,60px)", paddingRight: "1.5rem", paddingBottom: "80px", background: "linear-gradient(90deg, rgba(0,0,0,1) 74%, transparent)" }}
      >
        <div className="mb-8 flex items-center gap-2">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors" style={{ border: "1px solid rgba(255,255,255,0.28)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <ArrowLeftIcon className="h-4 w-4 text-white" />
          </button>
          <button onClick={onBack} className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors" style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            Буцах
          </button>
        </div>
        <h2 className="mb-5 font-black uppercase leading-[0.9] text-white" style={{ fontSize: "clamp(30px,4vw,54px)", letterSpacing: "-1.5px" }}>
          МОНГОЛ<br />ДОХИОНЫ ХЭЛ
        </h2>
        <p className="mb-8 text-[13px] leading-relaxed pr-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          Монголд 25,000 гаруй дохионы хэлээр ярьдаг иргэд амьдарч байна.
          SignBridge нь дохионы хэлний бэрхшээлийн улмаас ажлын байргүй 2,400 гаруй иргэд туслах зорилготой юм.
        </p>
        <div className="mb-8 h-px w-48" style={{ background: "rgba(255,255,255,0.18)" }} />
        <div className="flex flex-col gap-6">
          {DETAIL_STATS.map(({ Icon, value, label }, i) => (
            <m.div key={label} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 + i * 0.07, duration: 0.32, ease: EASE }} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}>
                <Icon className="h-5 w-5" style={{ color: "rgba(255,255,255,0.7)" }} />
              </div>
              <p className="shrink-0 font-black leading-none" style={{ color: "#F5C518", fontSize: "clamp(26px,3vw,42px)" }}>{value}</p>
              <div className="h-8 w-px shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
              <p className="text-[12px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
            </m.div>
          ))}
        </div>
      </m.div>
    )}
  </AnimatePresence>
);
