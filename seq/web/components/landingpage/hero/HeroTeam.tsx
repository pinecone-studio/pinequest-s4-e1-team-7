"use client";
import Image from "next/image";
import { m, useTransform, type MotionValue } from "framer-motion";
import { TEAM } from "./heroData";

const TORN = "M0,28 C22,8 48,52 74,30 C100,8 128,56 154,34 C180,12 208,58 234,36 C260,14 288,60 314,38 C340,16 368,62 394,40 C420,18 448,64 474,42 C500,20 528,56 554,34 C580,12 608,58 634,36 C660,14 688,60 714,38 C740,16 768,62 794,40 C820,18 848,56 874,34 C900,12 928,58 954,36 C980,14 1008,60 1034,38 C1060,16 1088,62 1114,40 C1140,18 1168,56 1194,34 C1220,12 1248,58 1274,36 C1300,14 1328,60 1354,38 C1380,16 1412,52 1440,30";

export const HeroTeamPanel = ({ p }: { p: MotionValue<number> }) => {
  const r      = useTransform(p, [0.68, 1.0], ["6%", "130%"]);
  const bgClip = useTransform(r, (v) => `circle(${v} at 50% 50%)`);

  return (
    <div className="absolute inset-0 bg-[#0a0a0a]">
      <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 72, transform: "translateY(-72px)" }} aria-hidden="true">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="h-full w-full" style={{ filter: "drop-shadow(0 -10px 24px rgba(0,0,0,0.85))" }}>
          <path d={`${TORN} L1440,72 L0,72 Z`} fill="#0a0a0a" />
        </svg>
      </div>
      <m.div style={{ clipPath: bgClip }} className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true">
        <p
          className="select-none text-center font-black uppercase leading-none"
          style={{ fontSize: "clamp(7rem, 22vw, 32rem)", letterSpacing: "-0.04em", color: "rgba(255,255,255,0.06)" }}
        >
          TEAM<br />MEMBERS
        </p>
      </m.div>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[4vw]">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">SignBridge</p>
        <h2
          className="font-black uppercase mb-[3vh] text-center"
          style={{ fontSize: "clamp(1.8rem, 5vw, 6.5rem)", lineHeight: 0.92, letterSpacing: "-0.02em", color: "var(--olive)" }}
        >
          Багийн танилцуулга
        </h2>
        <div className="mb-[4vh] h-px w-full max-w-[72vw]" style={{ background: "var(--olive)", opacity: 0.45 }} />
        <div className="flex w-full items-end justify-center gap-[2vw]">
          {TEAM.map((member, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <div className="relative overflow-hidden rounded-full ring-[3px] ring-[var(--olive)]" style={{ width: "clamp(140px, 20vw, 290px)", height: "clamp(140px, 20vw, 290px)" }}>
                <Image src={member.src} alt={member.name} fill className="object-cover object-top" sizes="(max-width:640px) 50vw, 25vw" />
              </div>
              <div>
                <p className="font-bold leading-tight text-white" style={{ fontSize: "clamp(13px, 1.3vw, 20px)" }}>{member.name}</p>
                <p className="font-semibold leading-tight" style={{ fontSize: "clamp(11px, 1vw, 16px)", color: "var(--olive)" }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
