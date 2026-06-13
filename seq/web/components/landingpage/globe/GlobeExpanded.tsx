"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, GlobeAltIcon, UserGroupIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { EASE } from "../motion";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div className="h-full w-full bg-black" /> });

const LEFT = 42;
const GLOB_RATIO = 0.42;
const ARC_ITEMS = [
  { id: "overview", Icon: GlobeAltIcon,  label: "Нийт тойм", angle: 220 },
  { id: "people",   Icon: UserGroupIcon, label: "Иргэд",      angle: 180 },
  { id: "jobs",     Icon: BriefcaseIcon, label: "Ажил",       angle: 140 },
];

const STATS: Record<string, { title: string; big: string; bigLabel: string; rows: { label: string; value: string }[] }> = {
  overview: {
    title: "Монгол дахь нийгмийн нөлөөлөл",
    big: "25,000+", bigLabel: "Дохионы хэлний хэрэглэгч",
    rows: [{ label: "Ажилгүй иргэд (өмнө)", value: "2,400+" }, { label: "Ажилгүйдэл буурах", value: "−90%" }],
  },
  people: {
    title: "Сонсголын бэрхшээлтэй иргэд",
    big: "25,000+", bigLabel: "Монгол дахь хэрэглэгчид",
    rows: [{ label: "Хүн амын хувь", value: "0.8%" }, { label: "Хэрэглэгчдийн хүлээлт", value: "98%" }],
  },
  jobs: {
    title: "Хөдөлмөр эрхлэлт",
    big: "−90%", bigLabel: "Ажилгүйдэл буурах хэмжээ",
    rows: [{ label: "Хандалтын хязгаарлалт (өмнө)", value: "90%" }, { label: "Хөрвүүлэх тусламж", value: "24/7" }],
  },
};

export const GlobeExpanded = ({ onBack }: { onBack: () => void }) => {
  const [filter, setFilter]     = useState("overview");
  const [spinning, setSpinning] = useState(true);
  const [hovered, setHovered]   = useState(false);
  const [arc, setArc] = useState({ cx: 0, cy: 0, r: 0 });

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const cx = w * (LEFT + (100 - LEFT) / 2) / 100;
      setArc({ cx, cy: h * 0.5, r: h * GLOB_RATIO });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const handleHover = (h: boolean) => { setHovered(h); setSpinning(!h); };
  const stat = STATS[filter];

  const pts = ARC_ITEMS.map(({ angle }) => {
    const rad = angle * Math.PI / 180;
    return { x: arc.cx + arc.r * Math.cos(rad), y: arc.cy + arc.r * Math.sin(rad) };
  });
  const a1 = { x: arc.cx + arc.r * Math.cos(235 * Math.PI / 180), y: arc.cy + arc.r * Math.sin(235 * Math.PI / 180) };
  const a2 = { x: arc.cx + arc.r * Math.cos(125 * Math.PI / 180), y: arc.cy + arc.r * Math.sin(125 * Math.PI / 180) };

  return (
    <m.div className="fixed inset-0 z-[110] bg-black"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}>

      <div className="absolute top-0 bottom-0 right-0" style={{ left: `${LEFT}%` }}>
        <GlobeR3F spinning={spinning} onMarkerHover={handleHover}
          style={{ width: "100%", height: "100%" }} />
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
              style={{
                background: active ? "#f5c518" : "rgba(0,0,0,0.55)",
                border: `1.5px solid ${active ? "#f5c518" : "rgba(255,255,255,0.45)"}`,
                backdropFilter: "blur(8px)",
              }}>
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
            <p className="font-black leading-[0.88] mb-8"
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
          <m.div className="pointer-events-none absolute bottom-12"
            style={{ left: `${LEFT + 8}%` }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
            <div className="rounded-full px-4 py-2 text-[12px] font-bold"
              style={{ background: "#f5c518", color: "#0d1e35" }}>Монгол Улс — 25,000+</div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};
