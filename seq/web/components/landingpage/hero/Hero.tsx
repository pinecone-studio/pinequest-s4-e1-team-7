"use client";
import { useRef, useState, useEffect } from "react";
import { m, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { HeroText } from "./HeroText";
import { HeroTeamPanel } from "./HeroTeam";
import { HeroOpening } from "./HeroOpening";
import { useMediaQuery } from "@/hooks/useBreakpoint";

export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    if (reduce || sessionStorage.getItem("sb_opened")) { setShowOpening(false); return; }
    sessionStorage.setItem("sb_opened", "1");
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setShowOpening(false), 2100);
    const t2 = setTimeout(() => { document.body.style.overflow = ""; }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ""; };
  }, [reduce]);

  // Mobile: 200dvh = 100dvh sticky hero + 100dvh static team below
  // Desktop: 240vh full scroll-animated hero with team panel clip-reveal
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const springP = useSpring(raw, { stiffness: 80, damping: 20 });
  const p = reduce || isMobile ? raw : springP;

  // Hero text fades out well before the sticky pin releases
  // Desktop pin releases at p=0.583 (140vh/240vh), mobile pin releases at p=0.5 (100dvh/200dvh)
  const heroOpacity = useTransform(p, (v) => {
    const end = isMobile ? 0.45 : 0.35;
    return Math.max(0, 1 - v / end);
  });

  // Desktop: team panel clips in [0.40→0.57], fully visible before pin releases at 0.583
  const rawInset = useTransform(p, (v) => {
    if (v <= 0.40) return 100;
    if (v >= 0.57) return 0;
    return 100 - ((v - 0.40) / (0.57 - 0.40)) * 100;
  });
  const panelClip = useTransform(rawInset, (v) => `inset(${Math.max(0, Math.min(100, v))}% 0 0 0)`);

  return (
    <section id="hero" ref={ref} className="relative h-[200dvh] bg-black md:h-[240vh]">
      {/* Sticky animated hero panel */}
      <div className="sticky top-0 h-dvh overflow-hidden will-change-transform">
        {/* Hero text on solid black — no background image */}
        <m.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 bg-black">
          <HeroText p={p} />
        </m.div>

        {/* Team panel inside sticky — desktop only via scroll-reveal clip */}
        <m.div style={{ clipPath: panelClip }} className="absolute inset-0 z-20 hidden md:block">
          <HeroTeamPanel p={p} />
        </m.div>

        <HeroOpening show={showOpening} />
      </div>

      {/* Mobile team section — static, appears naturally below the sticky hero */}
      <div className="relative h-dvh md:hidden">
        <HeroTeamPanel p={p} />
      </div>
    </section>
  );
};
