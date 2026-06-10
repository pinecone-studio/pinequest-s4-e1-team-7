import Link from "next/link";

export const Hero = () => (
  <section
    className="relative flex min-h-screen flex-col overflow-hidden px-4 pb-0 pt-5 md:pt-10"
    style={{ background: "var(--bg)" }}
    id="top"
  >
    <div className="relative mx-auto w-full max-w-3xl text-center">
      <h1
        className="font-display text-[44px] font-bold leading-[1.04] tracking-[-1.5px] sm:text-[56px] md:text-[64px] lg:text-[72px]"
        style={{ color: "var(--text)" }}
      >
        Дохионы хэлийг
        <br />
        <span style={{ color: "var(--olive)" }}>шууд хөрвүүлэх платформ</span>
      </h1>

      <p
        className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed md:text-[19px]"
        style={{ color: "var(--text-2)" }}
      >
        Монгол дохионы хэлнээс бичвэр хөрвүүлж, видео дуудлага хийнэ.
      </p>
    </div>

    {/* ── Floating visual composition — fills remaining viewport ── */}
    <div className="relative mx-auto mt-10 w-full flex-1 max-w-5xl">
      {/* Warm circle behind center image */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(340px, 42vw, 540px)",
          height: "clamp(340px, 42vw, 540px)",
          borderRadius: "50%",
          background: "var(--olive-soft)",
          opacity: 0.72,
          zIndex: 0,
        }}
      />

      {/* Center image — mobile: landing4, desktop: landing3 */}
      <img
        src="/images/landing4.png"
        alt="Sign Bridge"
        className="absolute left-1/2 object-contain md:hidden"
        style={{ top: "40%", transform: "translate(-50%, -50%)", height: "92%", width: "auto", maxWidth: "80%", zIndex: 2 }}
      />
      <img
        src="/images/landing3.png"
        alt="Sign Bridge"
        className="absolute left-1/2 object-contain hidden md:block"
        style={{ top: "40%", transform: "translate(-50%, -50%)", height: "92%", width: "auto", maxWidth: "54%", zIndex: 2 }}
      />

      {/* Top-left — landing1 */}
      <img
        src="/images/landing1.png"
        alt=""
        className="pointer-events-none absolute hidden md:block"
        style={{
          top: "8%",
          left: "5%",
          width: "clamp(175px, 16vw, 235px)",
          borderRadius: "20px",
          zIndex: 3,
        }}
      />

      {/* Bottom-left — landing4 */}
      <img
        src="/images/landing4.png"
        alt=""
        className="pointer-events-none absolute hidden md:block"
        style={{
          bottom: "8%",
          left: "3%",
          width: "clamp(145px, 13vw, 200px)",
          borderRadius: "18px",
          zIndex: 3,
        }}
      />

      {/* Top-right — landing2 */}
      <img
        src="/images/landing2.png"
        alt=""
        className="pointer-events-none absolute hidden md:block"
        style={{
          top: "6%",
          right: "5%",
          width: "clamp(185px, 17vw, 250px)",
          borderRadius: "20px",
          zIndex: 3,
        }}
      />

      {/* Bottom-right — landing3 */}
      {/* Over center — video.png overlaid on top of center image */}
      <img
        src="/images/video.png"
        alt=""
        className="pointer-events-none absolute hidden md:block"
        style={{
          bottom: "-11%",
          left: "70%",
          transform: "translateX(-50%)",
          width: "clamp(180px, 20vw, 260px)",
          borderRadius: "20px",
          zIndex: 4,
        }}
      />
    </div>
  </section>
);
