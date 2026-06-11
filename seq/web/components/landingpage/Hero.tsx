"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { EASE } from "./motion";

export const Hero = () => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Floating images drift up as user scrolls past hero — pure transform, no layout
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "-22%"]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden px-4 pb-0 pt-5 md:pt-10"
      style={{ background: "var(--bg)" }}
      id="top"
    >
      {/* ── Text entry — animates once on load, not on scroll ── */}
      <motion.div
        className="relative mx-auto w-full max-w-3xl text-center"
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <h1
          className="font-display text-[44px] font-bold leading-[1.04] tracking-[-1.5px] sm:text-[56px] md:text-[64px] lg:text-[72px]"
          style={{ color: "var(--text)" }}
        >
          Дохионы хэлийг
          <br />
          <span style={{ color: "var(--olive)" }}>шууд хөрвүүлэх платформ</span>
        </h1>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed md:text-[19px]"
          style={{ color: "var(--text-2)" }}
          initial={{ opacity: 0, y: reduced ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: reduced ? 0 : 0.15, ease: EASE }}
        >
          Монгол дохионы хэлнээс бичвэр хөрвүүлж, видео дуудлага хийнэ.
        </motion.p>
      </motion.div>

      {/* ── Floating visual composition — parallax on scroll ── */}
      <motion.div
        className="relative mx-auto mt-10 w-full flex-1 max-w-5xl"
        style={{ y }}
      >
        {/* Warm circle */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(340px, 42vw, 540px)",
            height: "clamp(340px, 42vw, 540px)",
            borderRadius: "50%",
            background: "var(--olive-soft)",
            opacity: 0.72,
            zIndex: 0,
          }}
        />

        {/* Center image — mobile */}
        <img
          src="/images/landing4.png"
          alt="Sign Bridge"
          className="absolute left-1/2 object-contain md:hidden"
          style={{ top: "40%", transform: "translate(-50%, -50%)", height: "92%", width: "auto", maxWidth: "80%", zIndex: 2 }}
        />
        {/* Center image — desktop */}
        <img
          src="/images/landing3.png"
          alt="Sign Bridge"
          className="absolute left-1/2 hidden object-contain md:block"
          style={{ top: "40%", transform: "translate(-50%, -50%)", height: "92%", width: "auto", maxWidth: "54%", zIndex: 2 }}
        />

        {/* Top-left */}
        <img
          src="/images/landing1.png"
          alt=""
          className="pointer-events-none absolute hidden md:block"
          style={{ top: "8%", left: "5%", width: "clamp(175px, 16vw, 235px)", borderRadius: "20px", zIndex: 3 }}
        />

        {/* Bottom-left */}
        <img
          src="/images/landing4.png"
          alt=""
          className="pointer-events-none absolute hidden md:block"
          style={{ bottom: "8%", left: "3%", width: "clamp(145px, 13vw, 200px)", borderRadius: "18px", zIndex: 3 }}
        />

        {/* Top-right */}
        <img
          src="/images/landing2.png"
          alt=""
          className="pointer-events-none absolute hidden md:block"
          style={{ top: "6%", right: "5%", width: "clamp(185px, 17vw, 250px)", borderRadius: "20px", zIndex: 3 }}
        />

        {/* video.png overlay */}
        <img
          src="/images/video.png"
          alt=""
          className="pointer-events-none absolute hidden md:block"
          style={{ bottom: "-11%", left: "70%", transform: "translateX(-50%)", width: "clamp(180px, 20vw, 260px)", borderRadius: "20px", zIndex: 4 }}
        />
      </motion.div>
    </motion.section>
  );
};
