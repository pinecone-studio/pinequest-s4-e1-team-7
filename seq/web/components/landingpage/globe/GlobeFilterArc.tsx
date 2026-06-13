"use client";
import { m, AnimatePresence } from "framer-motion";
import { type FilterId, FILTERS } from "./globeData";
import { EASE } from "../motion";

const ARC_ANGLES = [308, 281, 254, 227];

export const GlobeFilterArc = ({ visible, globeCenterX, globeSize, filter, hovered, onEnter, onLeave }: {
  visible: boolean;
  globeCenterX: number;
  globeSize: number;
  filter: FilterId;
  hovered: FilterId | null;
  onEnter: (id: FilterId) => void;
  onLeave: () => void;
}) => (
  <AnimatePresence>
    {visible && (
      <m.div
        key="arc-icons"
        className="absolute hidden lg:block pointer-events-none"
        animate={{ x: globeCenterX }}
        transition={{ duration: 0.75, ease: EASE }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        style={{ top: "50%", y: "-50%", left: 0, width: 0, height: 0 }}
      >
        {FILTERS.map(({ id, Icon, label }, i) => {
          const rad = (ARC_ANGLES[i] * Math.PI) / 180;
          const R = (globeSize + 80) / 2;
          const x = Math.round(R * Math.sin(rad));
          const y = Math.round(-R * Math.cos(rad));
          const active = id === filter;
          const showLabel = active || hovered === id;
          return (
            <div key={id} className="absolute pointer-events-auto flex items-center"
              style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
              onMouseEnter={() => onEnter(id)} onMouseLeave={onLeave}>
              <AnimatePresence>
                {showLabel && (
                  <m.span
                    key={`lbl-${id}`}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-bold"
                    style={{ right: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)", background: "#F5C518", color: "#0d1e35", pointerEvents: "none" }}
                  >
                    {label}
                  </m.span>
                )}
              </AnimatePresence>
              <m.button
                type="button" aria-label={label} aria-pressed={active}
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
                animate={{ background: active ? "#F5C518" : "rgba(255,255,255,0.07)", borderColor: active ? "#F5C518" : "rgba(255,255,255,0.28)" }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                style={{ border: "1.5px solid" }}
              >
                <Icon className="h-6 w-6" style={{ color: active ? "#0d1e35" : "rgba(255,255,255,0.7)" }} />
              </m.button>
            </div>
          );
        })}
      </m.div>
    )}
  </AnimatePresence>
);
