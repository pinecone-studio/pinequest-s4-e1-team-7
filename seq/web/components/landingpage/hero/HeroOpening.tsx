"use client";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";

export const HeroOpening = ({ show }: { show: boolean }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at center, #161616 0%, #000 70%)" }} />
          <m.div
            className="relative mb-10 h-px w-[180px] origin-center bg-white/22"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex flex-col items-center leading-[0.88]">
            {(["Sign", "Bridge"] as const).map((word, i) => (
              <div key={word} className="overflow-hidden">
                <m.span
                  data-lp-font=""
                  className="block select-none font-black uppercase"
                  style={{ fontSize: "clamp(5rem, 14vw, 17rem)", letterSpacing: "-0.04em", color: i === 0 ? "var(--olive)" : "#fff" }}
                  initial={{ y: reduce ? 0 : "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 0.1 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                </m.span>
              </div>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
