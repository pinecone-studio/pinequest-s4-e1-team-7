"use client";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

export type ChipDef = {
  Icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  special?: "waveform" | "dots";
  bg: string;
  iconColor: string;
  cx: number;
  cy: number;
  size?: number;
  connector?: { cpX: number; cpY: number; ex: number; ey: number };
  drift: { x: number; y: number; dur: number; delay: number };
  mobileHide?: boolean;
};

type Props = { avatarSrc: string; chips: ChipDef[] };

function WaveformBars({ color, reduce }: { color: string; reduce: boolean }) {
  return (
    <span className="flex items-end gap-[2px]" style={{ height: 16 }}>
      {[7, 13, 9, 15, 8].map((h, i) => (
        <motion.span
          key={i}
          style={{ width: 2, height: h, background: color, display: "block", borderRadius: 2 }}
          animate={reduce ? undefined : { scaleY: [1, 1.9, 0.4, 1.5, 1] }}
          transition={reduce ? undefined : { duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function DotsChip({ color, reduce }: { color: string; reduce: boolean }) {
  return (
    <span className="flex items-center gap-[3.5px]">
      {[0, 1, 2].map((j) => (
        <motion.span
          key={j}
          style={{ width: 4.5, height: 4.5, background: color, display: "block", borderRadius: "50%" }}
          animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
          transition={reduce ? undefined : { duration: 1.1, repeat: Infinity, delay: j * 0.27, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export function AvatarOrbit({ avatarSrc, chips }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div className="relative h-full w-full" initial="idle" whileHover="hovered">

    
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          height: "84%",
          aspectRatio: "1",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "1.5px solid var(--border-2)",
        }}
      />

    
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          height: "74%",
          aspectRatio: "1",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
        }}
      >
        <img src={avatarSrc} alt="" aria-hidden className="h-full w-full object-cover object-top" />
      </div>

    
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {chips.map((chip, i) => {
          if (!chip.connector) return null;
          const { cpX, cpY, ex, ey } = chip.connector;
          return (
            <motion.path
              key={i}
              d={`M ${chip.cx} ${chip.cy} Q ${cpX} ${cpY} ${ex} ${ey}`}
              fill="none"
              stroke="rgba(60,100,140,0.28)"
              strokeWidth="1.5"
              strokeLinecap="round"
              variants={{ idle: { pathLength: 0, opacity: 0 }, hovered: { pathLength: 1, opacity: 1 } }}
              transition={{ duration: 0.52, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      {chips.map((chip, i) => {
        const ChipIcon = chip.Icon;
        const sz = chip.size ?? 36;
        return (
          <div
            key={i}
            aria-hidden="true"
            className={chip.mobileHide ? "hidden md:block" : ""}
            style={{ position: "absolute", left: `${chip.cx}%`, top: `${chip.cy}%`, transform: "translate(-50%, -50%)" }}
          >
            <motion.div
              variants={{ idle: { scale: 1 }, hovered: { scale: 1.13 } }}
              transition={{ type: "spring", damping: 15, stiffness: 240 }}
            >
              <motion.div
                animate={reduce ? undefined : {
                  y: [0, -chip.drift.y, 0, chip.drift.y * 0.4, 0],
                  x: [0, chip.drift.x, 0, -chip.drift.x * 0.3, 0],
                }}
                transition={reduce ? undefined : {
                  duration: chip.drift.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: chip.drift.delay,
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full shadow-md"
                  style={{ width: sz, height: sz, background: chip.bg, flexShrink: 0 }}
                >
                  {chip.special === "waveform" ? (
                    <WaveformBars color={chip.iconColor} reduce={!!reduce} />
                  ) : chip.special === "dots" ? (
                    <DotsChip color={chip.iconColor} reduce={!!reduce} />
                  ) : ChipIcon ? (
                    <ChipIcon style={{ width: 16, height: 16, color: chip.iconColor }} />
                  ) : null}
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}
