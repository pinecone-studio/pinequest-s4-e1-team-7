"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FeatureCardContent } from "./FeatureCardContent";

export type CarouselFeature = { id: string; title: string; sub: string; img: string; dark: boolean; bg: string; href: string };

export function FeatureCarousel({ features }: { features: CarouselFeature[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slotWidth = el.scrollWidth / features.length;
    setActiveIdx(Math.min(Math.round(el.scrollLeft / slotWidth), features.length - 1));
  }, [features.length]);

  const scrollTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / features.length) * i, behavior: "smooth" });
    setActiveIdx(i);
  };

  const cardStyle = (f: CarouselFeature) => ({
    background: f.bg,
    border: f.dark ? "none" : "1px solid var(--border-c)",
    boxShadow: "var(--shadow-sm)",
  });

  return (
    <>
      <div className="md:hidden">
        <div ref={scrollRef} onScroll={onScroll} className="no-scrollbar -mx-4 flex overflow-x-auto pb-4"
          style={{ scrollSnapType: "x mandatory", scrollPaddingLeft: "16px", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", gap: "12px", paddingLeft: "16px", paddingRight: "16px" } as CSSProperties}>
          {features.map((f) => (
            <Link key={f.id} href={f.href} className="group relative shrink-0 overflow-hidden rounded-[28px] transition-all duration-300 active:scale-[0.97]"
              style={{ width: "85vw", maxWidth: "400px", height: "clamp(400px, 46dvh, 500px)", scrollSnapAlign: "start", flexShrink: 0, ...cardStyle(f) }}>
              <FeatureCardContent f={f} />
            </Link>
          ))}
          <div className="w-4 shrink-0" />
        </div>
        <div className="flex items-center justify-center gap-1.5 py-3">
          {features.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} aria-label={`${i + 1}-р карт`} className="rounded-full transition-all duration-300"
              style={{ height: "6px", width: activeIdx === i ? "24px" : "6px", background: activeIdx === i ? "var(--olive)" : "var(--border-c)" }} />
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 md:gap-4 md:pb-6">
        {features.map((f) => (
          <Link key={f.id} href={f.href} className="group relative overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            style={{ height: "clamp(300px, 26vw, 400px)", ...cardStyle(f) }}>
            <FeatureCardContent f={f} />
          </Link>
        ))}
      </div>
    </>
  );
}
