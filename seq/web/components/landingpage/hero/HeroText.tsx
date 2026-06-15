"use client";
import { type MotionValue } from "framer-motion";
import { AT, HERO_IMGS } from "./heroData";
import { Zoom } from "./Zoom";

export const HeroText = ({ p }: { p: MotionValue<number> }) => (
  <div className="flex h-full w-full items-center px-[3vw]">
    <h1
      style={{ fontSize: "clamp(1.8rem, 5vw, 7.5rem)", lineHeight: 0.92, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}
      className="w-full select-none font-black uppercase"
    >
      <span className="block">
        <span style={{ color: "var(--olive)" }}>Дохионы хэлийг{" "}</span>
        <span className="text-white">хөрвүүлж</span>
      </span>
      <span className="block text-white">
        <Zoom p={p} at={AT[0]} src={HERO_IMGS[0].src} round />{" "}
        шууд{" "}
        <Zoom p={p} at={AT[1]} src={HERO_IMGS[1].src} round />{" "}
        дуудлага
      </span>
      <span className="block text-white">
        <Zoom p={p} at={AT[2]} src={HERO_IMGS[2].src} />{" "}
       хийх
        <Zoom p={p} at={AT[3]} src={HERO_IMGS[3].src} round />{" "}
        платформ
      </span>
    </h1>
  </div>
);
