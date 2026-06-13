"use client";
import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { getLenis } from "./LenisProvider";

export const PageNav = () => {
  const [active, setActive] = useState(0);
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
    const scroll = (top: number) => lenis ? lenis.scrollTo(top) : window.scrollTo({ top, behavior: "smooth" });
    const scrollId = (id: string) => lenis ? lenis.scrollTo(`#${id}`) : document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if      (index === 0) scroll(0);
    else if (index === 1 && hero) scroll(hero.offsetTop + (hero.offsetHeight - window.innerHeight) * 0.44);
    else if (index === 2) scrollId("globe");
    else if (index === 3) scrollId("features");
    else if (index === 4) scrollId("mobile");
  };

  return (
    <div className="fixed bottom-10 left-8 z-50 flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Section ${i + 1}`}
          className="flex items-center justify-center rounded-full font-black transition-all duration-300"
          style={{
            width: 28,
            height: active === i ? 48 : 24,
            background: active === i ? "#f5c518" : "rgba(255,255,255,0.10)",
            color: active === i ? "#0d1e35" : "rgba(255,255,255,0.38)",
            fontSize: active === i ? 13 : 11,
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};
