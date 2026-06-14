"use client";
import { useState } from "react";
import { useScroll, useMotionValueEvent, m, AnimatePresence } from "framer-motion";
import { getLenis } from "./LenisProvider";

const LABELS = ["Нүүр", "Баг", "Асуудал", "Онцлог", "Апп"];

export const PageNav = () => {
  const [active, setActive]   = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const hero     = document.getElementById("hero");
    const globe    = document.getElementById("globe");
    const features = document.getElementById("features");
    const mobile   = document.getElementById("mobile");
    if (!hero) return;
    const vh            = window.innerHeight;
    const teamStart     = hero.offsetTop + (hero.offsetHeight - vh) * 0.38;
    const globeStart    = globe    ? globe.offsetTop    - vh * 0.35 : Infinity;
    const featuresStart = features ? features.offsetTop - vh * 0.35 : Infinity;
    const mobileStart   = mobile   ? mobile.offsetTop   - vh * 0.35 : Infinity;
    if      (y >= mobileStart)   setActive(4);
    else if (y >= featuresStart) setActive(3);
    else if (y >= globeStart)    setActive(2);
    else if (y >= teamStart)     setActive(1);
    else                         setActive(0);
  });

  const goTo = (index: number) => {
    const lenis = getLenis();
    const hero  = document.getElementById("hero");
    const scroll   = (top: number) => lenis ? lenis.scrollTo(top) : window.scrollTo({ top, behavior: "smooth" });
    const scrollId = (id: string)  => lenis ? lenis.scrollTo(`#${id}`) : document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if      (index === 0) scroll(0);
    else if (index === 1 && hero) scroll(hero.offsetTop + (hero.offsetHeight - window.innerHeight) * 0.44);
    else if (index === 2) scrollId("globe");
    else if (index === 3) scrollId("features");
    else if (index === 4) scrollId("mobile");
  };

  return (
    <div className="fixed bottom-10 left-8 z-50 flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => {
        const isActive = active === i;
        const isHovered = hovered === i;
        return (
          <div key={i} className="relative flex items-center">
            <button
              type="button"
              onClick={() => goTo(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              aria-label={LABELS[i]}
              className="flex items-center justify-center rounded-full font-black transition-all duration-300 active:scale-95"
              style={{
                width: isActive ? 44 : isHovered ? 36 : 28,
                height: isActive ? 44 : 28,
                background: isActive ? "#f5c518" : isHovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                color: isActive ? "#0d1e35" : "rgba(255,255,255,0.55)",
                fontSize: isActive ? 15 : 12,
              }}
            >
              {i + 1}
            </button>

            <AnimatePresence>
              {isHovered && (
                <m.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute left-12 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-bold"
                  style={{ background: "rgba(0,0,0,0.75)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  {LABELS[i]}
                </m.span>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
