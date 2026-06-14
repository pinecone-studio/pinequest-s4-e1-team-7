"use client";
import { useRef } from "react";
import Image from "next/image";
import { useScroll, useSpring, useReducedMotion } from "framer-motion";
import { STEPS } from "./featuresData";
import { FeaturesLeftPanel } from "./FeaturesLeftPanel";

export const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const springP = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const p = reduce ? scrollYProgress : springP;

  return (
    <section id="features" ref={ref} className="relative bg-black">

      {/* Mobile layout */}
      <div className="md:hidden">
        {STEPS.map((step, i) => (
          <div key={i}>
            <div className="relative flex h-[55dvh] w-full items-center justify-center overflow-hidden bg-black">
              <div className="relative" style={{ width: "72%", height: "84%" }}>
                <Image src={step.img} alt={step.title} fill className="object-contain" sizes="100vw" />
              </div>
            </div>

            <div className="px-6 py-8">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: "var(--olive)" }}>
                Онцлог {step.tag}
              </p>
              <h3 className="mb-5 font-black uppercase leading-[0.92] tracking-tight text-white"
                style={{ fontSize: "clamp(2rem, 9vw, 3.5rem)", letterSpacing: "-0.02em" }}>
                {step.title}
              </h3>
              <p className="mb-7 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                {step.desc}
              </p>
              <ul className="flex flex-col gap-4">
                {step.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                      style={{ background: "var(--olive)", color: "#0d1e35" }}>✓</span>
                    <span className="text-[15px] leading-snug" style={{ color: "rgba(255,255,255,0.75)" }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {i < STEPS.length - 1 && (
              <div className="mx-6 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Desktop sticky two-column layout */}
      <div className="hidden md:flex md:items-start">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="sticky top-0 h-screen w-1/2 shrink-0 overflow-hidden will-change-transform">
          <FeaturesLeftPanel p={p} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>
        <div className="w-1/2 shrink-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex h-screen flex-col justify-center px-[6vw]">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: "var(--olive)" }}>
                Онцлог {step.tag}
              </p>
              <h3 className="mb-6 font-black uppercase" style={{ fontSize: "clamp(1.8rem, 3.8vw, 5rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#fff" }}>
                {step.title}
              </h3>
              <p className="mb-8 max-w-sm text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                {step.desc}
              </p>
              <ul className="flex flex-col gap-3">
                {step.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                      style={{ background: "var(--olive)", color: "#0d1e35" }}>✓</span>
                    <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.75)" }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
