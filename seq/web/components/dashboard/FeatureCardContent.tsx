import { PlayIcon } from "@heroicons/react/24/solid";
import type { CarouselFeature } from "./FeatureCarousel";

type CardSize = "big" | "medium" | "normal";

export function FeatureCardContent({ f, size = "normal" }: { f: CarouselFeature; size?: CardSize }) {
  const big = size === "big";
  const medium = size === "medium";

  return (
    <>
      <img
        src={f.img} alt="" aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 max-w-none select-none transition-transform duration-500 group-hover:scale-110"
        style={{ height: "110%", width: "auto" }}
      />
      <div className="absolute inset-0" style={{
        background: f.dark
          ? "linear-gradient(100deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 44%, transparent 64%)"
          : "linear-gradient(100deg, var(--surface) 22%, rgba(255,255,255,0.90) 44%, transparent 62%)",
      }} />
      <div className={`relative z-10 flex h-full flex-col justify-between ${big ? "p-8 lg:p-10" : medium ? "p-5 md:p-6 lg:p-7" : "p-5 md:p-6"}`}>
        <div>
          <h3
            className={`font-bold leading-snug ${big ? "text-[28px] md:text-[36px] lg:text-[44px]" : medium ? "text-[20px] md:text-[24px] lg:text-[28px]" : "text-[18px] md:text-[20px] lg:text-[22px]"}`}
            style={{ color: f.dark ? "#eaf0f8" : "var(--text)" }}
          >
            {f.title}
          </h3>
          <p
            className={`mt-2 leading-relaxed ${big ? "text-[14px] md:text-[15px] lg:text-[16px]" : medium ? "text-[12px] md:text-[13px] lg:text-[14px]" : "text-[12px] md:text-[12px] lg:text-[13px]"}`}
            style={{ color: f.dark ? "rgba(234,240,248,0.78)" : "var(--text-3)" }}
          >
            {f.sub}
          </p>
        </div>
        {(() => {
          const bBg = f.btnBg ?? (f.dark ? "rgba(0,0,0,0.35)" : "var(--olive)");
          const bClr = f.btnColor ?? (f.dark ? "#eaf0f8" : "#0d1e35");
          return (
            <div
              className={`inline-flex items-center gap-2 self-start rounded-full font-bold transition-all duration-200 group-hover:brightness-110 group-hover:scale-105 ${big ? "px-6 py-3 text-[14px]" : medium ? "px-5 py-2.5 text-[13px]" : "px-4 py-2 text-[12px]"}`}
              style={{ background: bBg, color: bClr }}
            >
              Эхлэх
              <div
                className={`flex items-center justify-center rounded-full ${big ? "h-6 w-6" : medium ? "h-5 w-5" : "h-5 w-5"}`}
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <PlayIcon className={`translate-x-[1px] ${big ? "h-3.5 w-3.5" : "h-3 w-3"}`} style={{ color: bClr }} />
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
