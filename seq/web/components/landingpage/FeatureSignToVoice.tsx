export const FeatureSignToVoice = () => {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .feature-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section style={{ background: "var(--bg)" }} className="w-full py-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center feature-flex" style={{ display: "flex", flexDirection: "row", gap: "clamp(24px, 5vw, 48px)", alignItems: "center" }}>

          {/* Phone mockup */}
          <div className="flex-1 flex justify-center">
            <div className="lphone" style={{ width: "clamp(160px, 30vw, 300px)" }}>
              <div className="lphone-status" style={{ fontSize: "clamp(9px, 2vw, 12px)", padding: "clamp(4px, 2vw, 6px) clamp(10px, 3vw, 14px)" }}>
                <span>9:41</span>
                <span>●●●</span>
              </div>
              <div className="lphone-nav" style={{ fontSize: "clamp(10px, 2vw, 13px)", padding: "clamp(4px, 1.5vw, 6px)" }}>ДОХИО</div>
              <div className="lphone-cam">
                <div className="lphone-scan" />
                <div className="lphone-cap" style={{ padding: "clamp(8px, 2vw, 12px)" }}>
                  <div className="cl" style={{ fontSize: "clamp(7px, 1.5vw, 9px)", marginBottom: "clamp(4px, 1vw, 6px)" }}>
                    <span>●</span> Дохио → Дуу хоолой
                  </div>
                </div>
              </div>
              <div style={{ padding: "clamp(10px, 2vw, 12px)", display: "flex", flexDirection: "column", gap: "clamp(6px, 1.5vw, 8px)" }}>
                <button style={{ background: "var(--olive)", borderRadius: "14px", padding: "clamp(10px, 2vw, 12px)", textAlign: "center", color: "#fff", fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 700, border: "none", cursor: "pointer", width: "100%" }}>
                  Дуудлага эхлүүлэх
                </button>
                
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="ltag" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>01</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: "clamp(12px, 2vw, 16px)", lineHeight: 1.1 }}>
              Дохио → Дуу хоолой
            </h2>
            <p style={{ fontSize: "clamp(14px, 3vw, 17px)", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "480px" }}>
              Дохиолох үед шууд монголоор чанга яриулна. Ярианы бэрхшээлтэй хүмүүст зориулсан хурдан, нарийвчлалтай орчуулга.
            </p>
          </div>

        </div>
      </section>
    </>
  );
};