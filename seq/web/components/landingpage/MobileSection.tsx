"use client";
import Image from "next/image";

export const MobileSection = () => (
  <section id="mobile" className="relative overflow-hidden bg-black">

    {/* Mobile layout */}
    <div className="flex flex-col px-6 pb-16 pt-28 md:hidden">
      <h2 className="mb-6 select-none font-black uppercase"
        style={{ fontSize: "clamp(1.6rem, 7vw, 2.4rem)", lineHeight: 0.92, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
        <span className="block" style={{ color: "var(--olive)" }}>Утсан дээрх</span>
        <span className="block text-white">хувилбар</span>
      </h2>

      <p className="mb-10 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)", fontFamily: "var(--font-display)" }}>
        SignBridge-г удахгүй iOS ба Android утсан дээр татаж улам хялбар болно.
      </p>

      <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="relative flex flex-col items-center justify-center gap-4 px-5 py-3"
          style={{ background: "#0d0d0d" }}>
          <Image src="/images/qr.png" alt="Download QR" width={280} height={280} className="rounded-lg" />
        </div>
        <div className="px-6 py-5" style={{ background: "#111" }}>
          <p className="mb-1 font-black text-white" style={{ fontSize: 17, fontFamily: "var(--font-display)" }}>SignBridge Mobile version</p>
          <div className="my-4 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
            QR уншуулж Мобайл хувилбарыг Browser дээр үзэх
          </span>
        </div>
      </div>
    </div>

    {/* Desktop layout */}
    <div className="hidden md:flex md:min-h-screen md:items-center md:gap-[4vw] md:px-[5vw] md:py-24">
      <div style={{ flex: "1 1 52%", minWidth: 280 }}>
        <h2 className="mb-10 select-none font-black uppercase"
          style={{ fontSize: "clamp(1.8rem, 4.5vw, 5rem)", lineHeight: 0.92, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>
          <span className="block" style={{ color: "var(--olive)" }}>Утсан дээрх</span>
          <span className="block text-white">хувилбар</span>
        </h2>
        <p className="max-w-[38ch] text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)", fontFamily: "var(--font-display)" }}>
          SignBridge-г удахгүй iOS ба Android утсан дээр татаж улам хялбар болно.
        </p>
      </div>

      <div style={{ flex: "0 1 380px", minWidth: 280 }}>
        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="relative flex flex-col items-center justify-center gap-4 px-5 py-3"
            style={{ background: "#0d0d0d" }}>
            <Image src="/images/qr.png" alt="Download QR" width={320} height={320} className="rounded-lg" />
          </div>
          <div className="px-6 py-5" style={{ background: "#111" }}>
            <p className="mb-1 font-black text-white" style={{ fontSize: "clamp(17px,1.8vw,22px)", fontFamily: "var(--font-display)" }}>
              SignBridge Mobile version
            </p>
            <div className="my-4 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
                QR уншуулж Мобайл хувилбарыг Browser дээр үзэх
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
      style={{ background: "rgba(255,255,255,0.08)" }} />
  </section>
);
