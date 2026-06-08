import { PlayIcon } from "@heroicons/react/24/solid";
import type { CarouselFeature } from "./FeatureCarousel";

export function FeatureCardContent({ f }: { f: CarouselFeature }) {
  return (
    <>
      <img src={f.img} alt="" aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 max-w-none select-none transition-transform duration-500 group-hover:scale-110"
        style={{ height: "110%", width: "auto" }} />
      <div className="absolute inset-0" style={{
        background: f.dark
          ? "linear-gradient(100deg, var(--teal) 20%, rgba(26,61,92,0.50) 42%, transparent 60%)"
          : "linear-gradient(100deg, var(--surface) 22%, rgba(255,255,255,0.90) 44%, transparent 62%)",
      }} />
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div>
          <h3 className="text-[22px] font-bold leading-snug" style={{ color: f.dark ? "#eaf0f8" : "var(--text)" }}>{f.title}</h3>
          <p className="mt-2 text-[13px] leading-snug" style={{ color: f.dark ? "rgba(234,240,248,0.68)" : "var(--text-3)" }}>{f.sub}</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-200 group-hover:brightness-110 group-hover:scale-105"
          style={{ background: f.dark ? "rgba(0,0,0,0.35)" : "var(--olive)", color: f.dark ? "#eaf0f8" : "#0d1e35" }}>
          Эхлэх
          <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: f.dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)" }}>
            <PlayIcon className="h-3 w-3 translate-x-[1px]" style={{ color: f.dark ? "#eaf0f8" : "#0d1e35" }} />
          </div>
        </div>
      </div>
    </>
  );
}
