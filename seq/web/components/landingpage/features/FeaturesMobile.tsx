"use client";
import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { STEPS } from "./featuresData";
import { EASE } from "../motion";

export const FeaturesMobile = () => {
  const [openSteps, setOpenSteps] = useState<number[]>([]);
  const toggle = (i: number) =>
    setOpenSteps((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  return (
    <div className="md:hidden">
      <div className="px-5 pb-0 pt-8">
        <div className="relative mb-6 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/9", background: "#0d0d0d" }}>
          <Image src={STEPS[0].img} alt={STEPS[0].title} fill className="object-contain p-6" sizes="100vw" />
        </div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: "var(--olive)" }}>
          Онцлог {STEPS[0].tag}
        </p>
        <h3 className="mb-4 font-black uppercase"
          style={{ fontSize: "clamp(1.5rem, 6vw, 2.4rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "#fff" }}>
          {STEPS[0].title}
        </h3>
        <p className="mb-5 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display)" }}>
          {STEPS[0].desc}
        </p>
        <ul className="mb-8 flex flex-col gap-3">
          {STEPS[0].bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "#facc15" }} />
              <span className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {STEPS.slice(1).map((step, idx) => {
        const i = idx + 1;
        const isOpen = openSteps.includes(i);
        return (
          <div key={i}>
            <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <button onClick={() => toggle(i)}
              className="flex w-full items-center justify-between px-5 py-5 text-left transition-colors"
              style={{ background: isOpen ? "rgba(255,255,255,0.04)" : "transparent" }}>
              <span className="pr-4 font-black uppercase leading-tight"
                style={{ fontSize: "clamp(1rem, 4.5vw, 1.3rem)", color: isOpen ? "#f5c518" : "#fff", letterSpacing: "-0.02em" }}>
                {step.title}
              </span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all"
                style={{ border: `1.5px solid ${isOpen ? "#f5c518" : "rgba(255,255,255,0.3)"}` }}>
                {isOpen
                  ? <MinusIcon className="h-4 w-4" style={{ color: "#f5c518" }} />
                  : <PlusIcon className="h-4 w-4 text-white" />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: EASE }}
                  style={{ overflow: "hidden" }}>
                  <div className="px-5 pb-7 pt-2">
                    <div className="relative mb-5 overflow-hidden rounded-xl" style={{ aspectRatio: "16/9", background: "#0d0d0d" }}>
                      <Image src={step.img} alt={step.title} fill className="object-contain p-4" sizes="100vw" />
                    </div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: "var(--olive)" }}>
                      Онцлог {step.tag}
                    </p>
                    <p className="mb-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display)" }}>{step.desc}</p>
                    <ul className="flex flex-col gap-3">
                      {step.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: "#facc15" }} />
                          <span className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
    </div>
  );
};
