"use client";
import Image from "next/image";

export const Footer = () => (
  <footer className="relative z-10 flex flex-col items-center justify-center gap-3 bg-black py-8">
    <div className="flex items-center gap-3">
      <Image
        src="/images/logoShar.png"
        alt="Sign Bridge"
        width={48}
        height={48}
        className="select-none object-contain"
      />
      <span
        className="select-none font-black"
        style={{ fontSize: "clamp(1.4rem, 3vw, 2.8rem)", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}
      >
        <span style={{ color: "var(--olive)" }}>Sign</span>
        <span style={{ color: "#fff" }}>Bridge</span>
      </span>
    </div>
    <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)" }}>
      © 2026 Sign Bridge
    </p>
  </footer>
);
