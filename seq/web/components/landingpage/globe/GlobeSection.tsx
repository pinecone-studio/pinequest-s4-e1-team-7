"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { m, AnimatePresence } from "framer-motion";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { STARS, MONGOLIA_PIN, type FilterId } from "./globeData";
import { GlobeDetailPanel } from "./GlobeDetailPanel";
import { GlobeStatsPanel } from "./GlobeStatsPanel";
import { GlobeFilterArc } from "./GlobeFilterArc";
import { EASE } from "../motion";

const GlobeViz = dynamic(() => import("./GlobeViz"), { ssr: false, loading: () => <div /> });

export const GlobeSection = () => {
  const globeRef   = useRef<unknown>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [globeSize, setGlobeSize] = useState(700);
  const [vw,        setVw]        = useState(1440);
  const [filter,    setFilter]    = useState<FilterId>("global");
  const [hovered,   setHovered]   = useState<FilterId | null>(null);
  const [selected,  setSelected]  = useState(false);

  useEffect(() => {
    const upd = () => { setGlobeSize(Math.round(window.innerHeight * 0.82)); setVw(window.innerWidth); };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const g = globeRef.current as { controls?: () => { update?: () => void; autoRotate?: boolean; autoRotateSpeed?: number; enableZoom?: boolean; enablePan?: boolean }; pointOfView?: (v: object, d: number) => void } | null;
      if (!g) return;
      const c = g.controls?.();
      if (!c?.update) return;
      clearInterval(t);
      c.autoRotate = true; c.autoRotateSpeed = 0.45; c.enableZoom = false; c.enablePan = false;
      g.pointOfView?.({ lat: 28, lng: 95, altitude: 2.2 }, 0);
    }, 150);
    return () => clearInterval(t);
  }, []);

  const handleCountryClick = useCallback((name: string) => { if (name === "Mongolia") setSelected(true); }, []);
  const handleBack = useCallback(() => setSelected(false), []);
  const onFilterEnter = useCallback((id: FilterId) => {
    setHovered(id);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setFilter(id), 160);
  }, []);
  const onFilterLeave = useCallback(() => {
    setHovered(null);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const globeCenter = (selected ? 0.68 : 0.55) * vw;
  const globeX      = globeCenter - globeSize / 2;
  const arcX        = globeCenter - (globeSize + 80) / 2;

  return (
    <section id="globe" style={{ height: "100vh", position: "relative", background: "#000", overflow: "hidden", contentVisibility: "auto", containIntrinsicSize: "0 100vh" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: +s.r, height: +s.r, opacity: +s.o }} />
        ))}
      </div>

      <m.div aria-hidden className="pointer-events-none absolute"
        animate={{ x: arcX }} transition={{ duration: 0.75, ease: EASE }}
        style={{ left: 0, top: "50%", y: "-50%", width: globeSize + 80, height: globeSize + 80, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.09)", clipPath: "polygon(0 0, 52% 0, 52% 100%, 0 100%)" }}
      />

      <m.div className="absolute will-change-transform" animate={{ x: globeX }} transition={{ duration: 0.75, ease: EASE }}
        style={{ left: 0, top: "50%", y: "-50%", width: globeSize, height: globeSize }}>
        <GlobeViz ref={globeRef} width={globeSize} height={globeSize} regions={MONGOLIA_PIN} highlightCountry="Mongolia" onCountryClick={handleCountryClick} />
        <AnimatePresence>
          {selected && (
            <m.div key="card" initial={{ opacity: 0, y: 16, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ delay: 0.38, duration: 0.32, ease: EASE }} className="absolute"
              style={{ bottom: "10%", right: "-5%", width: "clamp(260px,22vw,340px)", background: "#fff", borderRadius: "6px", boxShadow: "0 12px 60px rgba(0,0,0,0.5)" }}>
              <div className="px-5 pt-4 pb-3 border-b border-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(0,0,0,0.45)" }}>18+ насны иргэдийн</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black/10">
                {[{ label: "Ажилгүйдлйг бууруулах", value: "90% хүртэл" }, { label: "Хэрэглэгчдийн хүлээлт", value: "98%" }].map(({ label, value }) => (
                  <div key={label} className="px-5 py-4">
                    <p className="text-[10px] leading-snug mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>{label}</p>
                    <p className="text-[32px] font-black leading-none text-black">{value}</p>
                  </div>
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>

      <GlobeFilterArc visible={!selected} globeCenterX={globeCenter} globeSize={globeSize} filter={filter} hovered={hovered} onEnter={onFilterEnter} onLeave={onFilterLeave} />
      <GlobeDetailPanel selected={selected} onBack={handleBack} />
      <GlobeStatsPanel visible={!selected} />

      <div className="pointer-events-none absolute bottom-[2%] left-[2%] font-black text-white leading-none select-none"
        style={{ fontSize: "clamp(64px,11vw,160px)", opacity: 0.07, letterSpacing: "-5px" }}>2024</div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center rounded-full p-1"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)" }}>
        {(["Одоо", "1 жил", "5 жил"] as const).map((lbl, i) => (
          <button key={lbl} className="relative rounded-full px-6 py-2.5 text-[13px] font-semibold" style={{ color: i === 0 ? "#0d1e35" : "rgba(255,255,255,0.5)" }}>
            {i === 0 && <div className="absolute inset-0 rounded-full" style={{ background: "#fff" }} />}
            <span className="relative z-10">{lbl}</span>
          </button>
        ))}
      </div>

      <button aria-label="Мэдээлэл" className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}>
        <InformationCircleIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {!selected && (
          <m.div key="mob" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute bottom-16 left-0 right-0 flex flex-wrap justify-center gap-5 px-6 lg:hidden">
            {[{ value: "2,400+", label: "Хэрэглэгч" }, { value: "25,000+", label: "Бэрхшээлтэй иргэд" }, { value: "98%", label: "Сэтгэл ханамж" }, { value: "24/7", label: "Бэлэн байдал" }]
              .map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-[17px] font-black" style={{ color: "#F5C518" }}>{value}</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
                </div>
              ))}
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
};
