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
    <div className="md:h-full">
      {/* Mobile: horizontal scroll carousel with peek */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex overflow-x-auto pb-3"
          style={{
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "16px",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            gap: "12px",
            paddingLeft: "16px",
            paddingRight: "16px",
          } as CSSProperties}
        >
          {features.map((f) => (
            <Link
              key={f.id}
              href={f.href}
              className="group relative shrink-0 overflow-hidden rounded-[28px] transition-all duration-300 active:scale-[0.97]"
              style={{
                width: "78vw",
                maxWidth: "370px",
                height: "clamp(300px, 44dvh, 440px)",
                scrollSnapAlign: "start",
                flexShrink: 0,
                ...cardStyle(f),
              }}
            >
              <FeatureCardContent f={f} />
            </Link>
          ))}
          <div className="w-4 shrink-0" />
        </div>
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 py-2">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`${i + 1}-р карт`}
              className="rounded-full transition-all duration-300"
              style={{
                height: "7px",
                width: activeIdx === i ? "28px" : "7px",
                background: activeIdx === i ? "var(--olive)" : "var(--border-c)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Desktop: bento grid — fills available height, no fixed row heights */}
      <div className="hidden h-full md:grid md:grid-cols-3 md:grid-rows-[1fr_1fr] md:gap-5">
        {features[0] && (
          <Link
            href={features[0].href}
            className="group relative col-span-2 overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            style={cardStyle(features[0])}
          >
            <FeatureCardContent f={features[0]} />
          </Link>
        )}
        {features[1] && (
          <Link
            href={features[1].href}
            className="group relative col-span-1 overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            style={cardStyle(features[1])}
          >
            <FeatureCardContent f={features[1]} />
          </Link>
        )}
        {features[2] && (
          <Link
            href={features[2].href}
            className="group relative col-span-1 overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            style={cardStyle(features[2])}
          >
            <FeatureCardContent f={features[2]} />
          </Link>
        )}
        {features[3] && (
          <Link
            href={features[3].href}
            className="group relative col-span-2 overflow-hidden rounded-[28px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]"
            style={cardStyle(features[3])}
          >
            <FeatureCardContent f={features[3]} />
          </Link>
        )}
      </div>
    </div>
  );
}
