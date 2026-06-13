"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { STARS } from "./globeData";
import { GlobeExpanded } from "./GlobeExpanded";
import { EASE } from "../motion";

const GlobeR3F = dynamic(() => import("./GlobeR3F"), { ssr: false, loading: () => <div /> });

const ITEMS = [
  {
    mode: "before" as const,
    label: "Өмнө",
    accent: "#ef4444",
    tag: "Одоогийн байдал",
    stats: [
      { label: "Ажилгүйдэлтэй иргэд", value: "2,400+" },
      { label: "Дохионы хэлээр ярьдаг иргэд", value: "25,000+" },
      { label: "Хөдөлмөр эрхлэх бэрхшээл", value: "90%" },
      { label: "Дохионы хэлмэрч", value: "Шаардлагатай" },
    ],
  },
  {
    mode: "after" as const,
    label: "Дараа",
    accent: "#f5c518",
    tag: "SignBridge-тэй",
    stats: [
      { label: "Ажилгүйдэл буурах", value: "−90%" },
      { label: "Эдгээр иргэдийн нийгмийн харилцаа", value: "25,000+" },
      { label: "Хэрэглэгчдийн хүлээлт", value: "98%" },
      { label: "Хөрвүүлэх тусламж", value: "24/7" },
    ],
  },
];

const SPLIT = 67;

export const GlobeSection = () => {
  const [compare, setCompare]   = useState<"before" | "after">("after");
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  const onBack = useCallback(() => setExpanded(false), []);

  return (
    <section id="globe" className="relative overflow-hidden bg-black" style={{ height: "100vh" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: +s.r, height: +s.r, opacity: +s.o }} />
        ))}
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
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

      <m.div className="absolute top-0 bottom-0" style={{ left: `${SPLIT}%`, right: 0, zIndex: 2 }}
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        animate={{ clipPath: "inset(0 0 0 0%)" }}
        transition={{ duration: 0.85, delay: 0.7, ease: EASE }}>
        <div className="absolute inset-0" style={{ left: "-46vh", right: 0 }}>
          <GlobeR3F
            onExpand={() => setExpanded(true)}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </m.div>

      <button onClick={() => setExpanded(true)} aria-label="Өгөгдлийг судлах"
        className="absolute flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
        style={{ width: 64, height: 64, background: "#f5c518", left: `${SPLIT}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
        <ArrowRightIcon className="h-7 w-7" style={{ color: "#0d1e35" }} />
      </button>

      <m.div className="pointer-events-none absolute top-0 bottom-0 w-px"
        style={{ left: `${SPLIT}%`, background: "rgba(255,255,255,0.18)", transformOrigin: "top", zIndex: 15 }}
        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        transition={{ duration: 0.75, delay: 0.2, ease: EASE }} />

      <div className="absolute left-0 top-0 flex h-full flex-col justify-center px-[5vw]"
        style={{ width: `${SPLIT}%`, zIndex: 10 }}>
        <m.div className="mb-8 flex flex-col gap-3" initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}>
          {ITEMS.map((item, i) => {
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

        <div className="flex gap-12 pl-[76px]">
          {ITEMS.map((item) => {
            const isActive = compare === item.mode;
            return (
              <div key={item.mode} className="flex flex-col gap-5 transition-opacity duration-300"
                style={{ opacity: isActive ? 1 : 0.28, minWidth: 0, flex: 1 }}>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: item.accent }}>{item.tag}</p>
                <div className="h-px" style={{ background: item.accent, opacity: 0.35 }} />
                {item.stats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
                    <p className="font-black leading-tight"
                      style={{ color: item.accent, fontSize: "clamp(1.4rem, 2.6vw, 3rem)", letterSpacing: "-0.5px" }}>{value}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {expanded && <GlobeExpanded onBack={onBack} />}
      </AnimatePresence>
    </section>
  );
};
