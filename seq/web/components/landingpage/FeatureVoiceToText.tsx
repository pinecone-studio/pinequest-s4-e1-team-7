export const FeatureVoiceToText = () => {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .feature-voice-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section style={{ background: "var(--surface-2)" }} className="w-full py-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center feature-voice-flex" style={{ display: "flex", flexDirection: "row-reverse", gap: "clamp(24px, 5vw, 48px)", alignItems: "center" }}>

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
                    <span>●</span> Дуу хоолой → Бичвэр
                  </div>
                </div>
              </div>
              <div style={{ padding: "clamp(10px, 2vw, 12px)", display: "flex", flexDirection: "column", gap: "clamp(6px, 1.5vw, 8px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 8px)", background: "var(--olive-soft)", borderRadius: "14px", padding: "clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)" }}>
                  <div style={{ width: "clamp(18px, 4vw, 20px)", height: "clamp(18px, 4vw, 20px)", borderRadius: "50%", background: "var(--olive)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="clamp(8px, 2vw, 10px)" height="clamp(8px, 2vw, 10px)" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "var(--border-2)" }}>
                    <div style={{ width: "55%", height: "100%", borderRadius: "999px", background: "var(--olive)" }} />
                  </div>
                  <span style={{ fontSize: "clamp(9px, 1.5vw, 10px)", fontWeight: 700, color: "var(--olive-deep)" }}>0.8s</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "clamp(10px, 1.5vw, 11px)", fontWeight: 700, color: "var(--olive-bright)", background: "var(--olive-soft)", padding: "clamp(4px, 1vw, 5px) clamp(10px, 2vw, 12px)", borderRadius: "999px" }}>
                    Сонсож байна...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="ltag" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>02</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: "clamp(12px, 2vw, 16px)", lineHeight: 1.1 }}>
              Дуу хоолой → Бичвэр
            </h2>
            <p style={{ fontSize: "clamp(14px, 3vw, 17px)", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "480px" }}>
              Яриаг бичвэр болгож харуулдаг тул дохионы хэлтнүүд бусдын яриаг бичгээр уншиж ойлгоно. Энэ нь хурдан бөгөөд алдаагүй ажилладаг.
            </p>
          </div>

        </div>
      </section>
    </>
  );
};