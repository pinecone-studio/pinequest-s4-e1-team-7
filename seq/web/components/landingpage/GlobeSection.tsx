"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  GlobeAltIcon,
  HandRaisedIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import type { GlobeRegion } from "./GlobeViz";
import { EASE } from "./motion";

const GlobeViz = dynamic(() => import("./GlobeViz"), { ssr: false, loading: () => <div /> });

// ── Stars ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: ((i * 137.5) % 100).toFixed(2),
  y: ((i * 97.3 + 13) % 100).toFixed(2),
  r: (((i * 31) % 14) / 10 + 0.3).toFixed(1),
  o: (((i * 73) % 55) / 100 + 0.12).toFixed(2),
}));

const MONGOLIA_PIN: GlobeRegion[] = [
  { lat: 47.92, lng: 106.91, label: "Монгол", value: "25K+", main: true },
];

// ── Detail panel stats ─────────────────────────────────────────────
const DETAIL_STATS = [
  { Icon: GlobeAltIcon,            value: "25,000+", label: "Сонсголын бэрхшээлтэй иргэд Монголд" },
  { Icon: HandRaisedIcon,          value: "2,400+",  label: "Дохионы хэлний орчуулга хийсэн" },
  { Icon: UserGroupIcon,           value: "98%",     label: "Хэрэглэгчдийн сэтгэл ханамж" },
  { Icon: ChatBubbleLeftRightIcon, value: "24/7",    label: "Бэлэн байдлын хамрах хүрээ" },
];

// ── Filter bar ─────────────────────────────────────────────────────
type FilterId = "global" | "sign" | "users" | "comms";
const FILTERS: { id: FilterId; Icon: React.ElementType; label: string }[] = [
  { id: "global", Icon: GlobeAltIcon,              label: "Дэлхий"    },
  { id: "sign",   Icon: HandRaisedIcon,             label: "Дохио"     },
  { id: "users",  Icon: UserGroupIcon,              label: "Хэрэглэгч" },
  { id: "comms",  Icon: ChatBubbleLeftRightIcon,    label: "Харилцаа"  },
];

export function GlobeSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef      = useRef<any>(null);
  const hoverTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [globeSize,   setGlobeSize]    = useState(700);
  const [filter,      setFilter]       = useState<FilterId>("global");
  const [hovered,     setHovered]      = useState<FilterId | null>(null);
  const [selected,    setSelected]     = useState(false);

  // ~80% of viewport height — matches reference globe size
  useEffect(() => {
    const upd = () => setGlobeSize(Math.round(window.innerHeight * 0.82));
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // Init — always rotating, never stops
  useEffect(() => {
    const t = setInterval(() => {
      const g = globeRef.current;
      if (!g?.controls?.()) return;
      clearInterval(t);
      const c = g.controls();
      c.autoRotate      = true;
      c.autoRotateSpeed = 0.45;
      c.enableZoom      = false;
      c.enablePan       = false;
      g.pointOfView({ lat: 28, lng: 95, altitude: 2.2 }, 0);
    }, 100);
    return () => clearInterval(t);
  }, []);

  // Click Mongolia → show detail panel; globe keeps spinning
  const handleCountryClick = useCallback((name: string) => {
    if (name !== "Mongolia") return;
    setSelected(true);
  }, []);

  // Back → hide detail panel; globe keeps spinning
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

  // Globe shifts right to make room for detail panel
  const globeLeft = selected ? "68%" : "55%";

  return (
    <section style={{ height: "100vh", position: "relative", background: "#000", overflow: "hidden" }}>

      {/* Stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: +s.r, height: +s.r, opacity: +s.o }} />
        ))}
      </div>

      {/* Arc decoration */}
      <motion.div aria-hidden className="pointer-events-none absolute"
        animate={{ left: `calc(${globeLeft} - ${(globeSize + 80) / 2}px)` }}
        transition={{ duration: 0.75, ease: EASE }}
        style={{
          width: globeSize + 80, height: globeSize + 80,
          top: "50%", transform: "translateY(-50%)",
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.09)",
          clipPath: "polygon(0 0, 52% 0, 52% 100%, 0 100%)",
        }}
      />

      {/* Globe + floating card */}
      <motion.div className="absolute"
        animate={{ left: globeLeft }}
        transition={{ duration: 0.75, ease: EASE }}
        style={{ top: "50%", transform: "translate(-50%, -50%)", width: globeSize, height: globeSize }}
      >
        <GlobeViz
          ref={globeRef}
          width={globeSize}
          height={globeSize}
          regions={MONGOLIA_PIN}
          highlightCountry="Mongolia"
          onCountryClick={handleCountryClick}
        />

        {/* White floating card — bottom-right of globe */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ delay: 0.38, duration: 0.32, ease: EASE }}
              className="absolute"
              style={{
                bottom: "10%", right: "-5%",
                width: "clamp(260px,22vw,340px)",
                background: "#fff",
                borderRadius: "6px",
                boxShadow: "0 12px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div className="px-5 pt-4 pb-3 border-b border-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "rgba(0,0,0,0.45)" }}>
                  Улаанбаатар хот
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black/10">
                <div className="px-5 py-4">
                  <p className="text-[10px] leading-snug mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>
                    Хэрэглэгч (тоо)
                  </p>
                  <p className="text-[32px] font-black leading-none text-black">1,800+</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[10px] leading-snug mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>
                    Хамрах хүрээ
                  </p>
                  <p className="text-[32px] font-black leading-none text-black">98%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Arc-positioned filter icons (follow globe center) ── */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="arc-icons"
            className="absolute hidden lg:block pointer-events-none"
            animate={{ left: globeLeft }}
            transition={{ duration: 0.75, ease: EASE }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            style={{ top: "50%", transform: "translate(-50%, -50%)", width: 0, height: 0 }}
          >
            {FILTERS.map(({ id, Icon, label }, i) => {
              // Distribute icons along left arc from ~10:30 to ~7:30 clock position
              // Angles in degrees measured from 12 o'clock, clockwise
              const arcAngles = [308, 281, 254, 227];
              const deg = arcAngles[i];
              const rad = (deg * Math.PI) / 180;
              const R = (globeSize + 80) / 2;  // matches arc decoration radius
              // x = R·sin(a), y = -R·cos(a)  (Y-down screen coords)
              const x = Math.round(R * Math.sin(rad));
              const y = Math.round(-R * Math.cos(rad));
              const active = id === filter;
              const showLabel = active || hovered === id;

              return (
                <div
                  key={id}
                  className="absolute pointer-events-auto flex items-center"
                  style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                  onMouseEnter={() => onFilterEnter(id)}
                  onMouseLeave={onFilterLeave}
                >
                  {/* Label slides in to the LEFT — only text moves, icon is fixed */}
                  <AnimatePresence>
                    {showLabel && (
                      <motion.span
                        key={`lbl-${id}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="absolute whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-bold"
                        style={{
                          right: "calc(100% + 10px)",
                          top: "50%", transform: "translateY(-50%)",
                          background: "#F5C518", color: "#0d1e35",
                          pointerEvents: "none",
                        }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Icon circle — stays fixed on arc */}
                  <motion.button
                    type="button"
                    aria-label={label}
                    aria-pressed={active}
                    className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
                    animate={{
                      background: active ? "#F5C518" : "rgba(255,255,255,0.07)",
                      borderColor: active ? "#F5C518" : "rgba(255,255,255,0.28)",
                    }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    style={{ border: "1.5px solid" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: active ? "#0d1e35" : "rgba(255,255,255,0.7)" }} />
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT: Mongolia detail panel ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute top-0 bottom-0 left-0 hidden lg:flex flex-col"
            style={{
              width: "36%",
              paddingTop: "clamp(80px,10vh,108px)",
              paddingLeft: "clamp(28px,5vw,60px)",
              paddingRight: "1.5rem",
              paddingBottom: "80px",
              background: "linear-gradient(90deg, rgba(0,0,0,1) 74%, transparent)",
            }}
          >
            {/* ← circle + Дэлхий pill */}
            <div className="mb-8 flex items-center gap-2">
              <button onClick={handleBack}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.28)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ArrowLeftIcon className="h-4 w-4 text-white" />
              </button>
              <button onClick={handleBack}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Дэлхий
              </button>
            </div>

            {/* Title */}
            <h2 className="mb-5 font-black uppercase leading-[0.9] text-white"
              style={{ fontSize: "clamp(30px,4vw,54px)", letterSpacing: "-1.5px" }}>
              МОНГОЛ<br />ДОХИОНЫ ХЭЛ
            </h2>

            {/* Description */}
            <p className="mb-8 text-[13px] leading-relaxed pr-2"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              Монголд 25,000 гаруй сонсголын бэрхшээлтэй иргэн амьдарч байна.
              SignBridge нь тэдгээрийн 2,400 гаруй иргэнд хүрч, дохионы хэлний
              орчуулга болон харилцааг дэмжиж байна.
            </p>

            {/* Thin short divider */}
            <div className="mb-8 h-px w-48" style={{ background: "rgba(255,255,255,0.18)" }} />

            {/* Stats rows: [icon] [BIG NUMBER] | [text] */}
            <div className="flex flex-col gap-6">
              {DETAIL_STATS.map(({ Icon, value, label }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.07, duration: 0.32, ease: EASE }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}>
                    <Icon className="h-5 w-5" style={{ color: "rgba(255,255,255,0.7)" }} />
                  </div>
                  <p className="shrink-0 font-black leading-none"
                    style={{ color: "#F5C518", fontSize: "clamp(26px,3vw,42px)" }}>
                    {value}
                  </p>
                  <div className="h-8 w-px shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
                  <p className="text-[12px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RIGHT: global stats panel — matches reference layout ── */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="global-stats"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute hidden lg:flex flex-col"
            style={{
              right: "3%",
              top: "50%",
              transform: "translateY(-50%)",
              width: "clamp(220px,21vw,290px)",
            }}
          >
            {/* Description paragraph */}
            <p className="mb-5 text-[13px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              SignBridge нь Монголын сонсголын бэрхшээлтэй иргэдэд зориулсан
              дохионы хэлний орчуулгын тэргүүлэх платформ юм.
            </p>

            {/* Full-width divider */}
            <div className="mb-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />

            {/* Primary stat label + huge number */}
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              Платформ хэрэглэгч нийт
            </p>
            <p className="font-black leading-[0.9]"
              style={{ color: "#F5C518", fontSize: "clamp(52px,6vw,80px)", letterSpacing: "-2px" }}>
              2,400+
            </p>

            {/* Divider */}
            <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />

            {/* Secondary stat */}
            <p className="mb-1 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Сонсголын бэрхшээлтэй иргэд
            </p>
            <p className="font-black leading-none"
              style={{ color: "#F5C518", fontSize: "clamp(26px,2.8vw,38px)" }}>
              25,000+
            </p>

            {/* Divider */}
            <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.16)" }} />

            {/* Two-column bottom stats */}
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <p className="text-[10px] leading-snug mb-2"
                  style={{ color: "rgba(255,255,255,0.32)" }}>
                  Сэтгэл ханамж
                </p>
                <p className="font-black" style={{ color: "#F5C518", fontSize: "clamp(22px,2.4vw,32px)" }}>
                  98%
                </p>
              </div>
              <div>
                <p className="text-[10px] leading-snug mb-2"
                  style={{ color: "rgba(255,255,255,0.32)" }}>
                  Бэлэн байдал
                </p>
                <p className="font-black" style={{ color: "#F5C518", fontSize: "clamp(22px,2.4vw,32px)" }}>
                  24/7
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Year stamp */}
      <div className="pointer-events-none absolute bottom-[2%] left-[2%] font-black text-white leading-none select-none"
        style={{ fontSize: "clamp(64px,11vw,160px)", opacity: 0.07, letterSpacing: "-5px" }}>
        2024
      </div>

      {/* Bottom timeline */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center rounded-full p-1"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)" }}>
        {(["Одоо", "1 жил", "5 жил"] as const).map((lbl, i) => (
          <button key={lbl}
            className="relative rounded-full px-6 py-2.5 text-[13px] font-semibold"
            style={{ color: i === 0 ? "#0d1e35" : "rgba(255,255,255,0.5)" }}>
            {i === 0 && (
              <motion.div layoutId="tl" className="absolute inset-0 rounded-full"
                style={{ background: "#fff" }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            )}
            <span className="relative z-10">{lbl}</span>
          </button>
        ))}
      </div>

      {/* Info button */}
      <button aria-label="Мэдээлэл"
        className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}>
        <InformationCircleIcon className="h-5 w-5" />
      </button>

      {/* Mobile stats */}
      <AnimatePresence>
        {!selected && (
          <motion.div key="mob" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute bottom-16 left-0 right-0 flex flex-wrap justify-center gap-5 px-6 lg:hidden"
          >
            {[
              { value: "2,400+",  label: "Хэрэглэгч"         },
              { value: "25,000+", label: "Бэрхшээлтэй иргэд" },
              { value: "98%",     label: "Сэтгэл ханамж"      },
              { value: "24/7",    label: "Бэлэн байдал"       },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[17px] font-black" style={{ color: "#F5C518" }}>{value}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
