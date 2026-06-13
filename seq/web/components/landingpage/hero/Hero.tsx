"use client";
import { useRef, useState, useEffect } from "react";
import { m, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { HERO_IMGS } from "./heroData";
import { HeroText } from "./HeroText";
import { HeroTeamPanel } from "./HeroTeam";
import { HeroOpening } from "./HeroOpening";

export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    if (reduce) { setShowOpening(false); return; }
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setShowOpening(false), 2100);
    const t2 = setTimeout(() => { document.body.style.overflow = ""; }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ""; };
  }, [reduce]);

  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const springP = useSpring(raw, { stiffness: 80, damping: 20 });
  const p = reduce ? raw : springP;

  const r        = useTransform(p, [0.25, 0.58], ["4%", "100%"]);
  const imgClip  = useTransform(r, (v) => `circle(${v} at 5% 58%)`);
  const imgScale = useTransform(p, [0.25, 0.58], [1, 1.12]);
  const imgOp    = useTransform(p, [0.22, 0.36], [0, 1]);
  const textOp   = useTransform(p, [0.4, 0.54], [1, 0]);
  const panelY   = useTransform(p, [0.58, 1.0], ["20%", "0%"]);
  const panelOp  = useTransform(p, [0.58, 0.68], [0, 1]);

  return (
    <section id="hero" ref={ref} className="relative h-[380vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden will-change-transform">
        <m.div style={{ clipPath: imgClip, opacity: imgOp }} className="absolute inset-0 z-0">
          <m.div style={{ scale: imgScale }} className="absolute inset-0 origin-center">
            <Image src={HERO_IMGS[0].src} alt="" fill className="object-cover" sizes="100vw" />
          </m.div>
          <div className="absolute inset-0 bg-black/20" />
        </m.div>
        <m.div style={{ opacity: textOp }} className="absolute inset-0 z-10 bg-black">
          <HeroText p={p} />
        </m.div>
        <m.div style={{ y: panelY, opacity: panelOp }} className="absolute inset-0 z-20">
          <HeroTeamPanel p={p} />
        </m.div>
        <HeroOpening show={showOpening} />
      </div>
    </section>
  );
};
