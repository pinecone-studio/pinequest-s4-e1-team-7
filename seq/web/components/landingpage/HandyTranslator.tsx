import { Logo } from "../Logo";

export const HandyTranslator = () => {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .handy-mockup {
            display: none !important;
          }
          .handy-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section style={{ background: "var(--bg)" }} className="w-full py-24 px-8 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center handy-flex" style={{ display: "flex", flexDirection: "row", gap: "clamp(24px, 5vw, 48px)", alignItems: "center" }}>

         
          <div className="handy-mockup flex-1 flex justify-center items-end" style={{ position: "relative", minHeight: "clamp(300px, 40vw, 420px)" }}>

         
            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 1 }}>
              <div style={{ width: "clamp(240px, 35vw, 320px)", background: "#0d1a14", borderRadius: "14px 14px 0 0", padding: "12px", border: "2px solid #1e2e2b", boxShadow: "0 -4px 30px rgba(0,0,0,0.4)" }}>
                <div style={{ background: "linear-gradient(160deg,#162418,#0e1714)", borderRadius: "8px", padding: "16px", minHeight: "190px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,var(--olive-bright),transparent)", boxShadow: "0 0 14px var(--olive-bright)", animation: "lscan 2.4s ease-in-out infinite" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "var(--olive)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div className="m">
            <Logo />
          </div>
                    </div>
                    <span style={{ fontSize: "clamp(10px, 2vw, 12px)", fontWeight: 700, color: "#eef4f0", fontFamily: "var(--font-display)" }}>ДОХИО</span>
                    <div style={{ marginLeft: "auto", fontSize: "clamp(8px, 1.5vw, 9px)", fontWeight: 700, color: "var(--olive-bright)", background: "rgba(132,201,138,0.15)", padding: "4px 9px", borderRadius: "999px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--olive-bright)", display: "inline-block", animation: "pulse 1.2s infinite" }} />
                      Хэлмэрчилж байна
                    </div>
                  </div>
                  <div style={{ background: "rgba(12,18,14,0.75)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "clamp(8px, 1.5vw, 9px)", fontWeight: 700, textTransform: "uppercase", color: "var(--olive-bright)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--olive-bright)", display: "inline-block" }} />
                      Дохио → Дуу хоолой
                    </div>
                    <div style={{ fontSize: "clamp(13px, 2vw, 15px)", fontWeight: 600, color: "#eef4f0", lineHeight: 1.4 }}>Сайн байна уу?</div>
                    <div style={{ fontSize: "11px", color: "rgba(238,244,240,0.5)", marginTop: "4px" }}></div>
                  </div>
                  <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "32px" }}>
                    {[30, 60, 45, 80, 55, 70, 40, 75, 50, 65, 35, 55].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px", background: "var(--olive-bright)", opacity: 0.4 + (i % 3) * 0.2 }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ width: "clamp(240px, 35vw, 320px)", height: "14px", background: "#1a2a26", borderRadius: "0 0 6px 6px", border: "2px solid #1e2e2b", borderTop: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "55px", height: "3px", borderRadius: "2px", background: "#0d1a14" }} />
              </div>
              <div style={{ width: "clamp(265px, 38vw, 355px)", height: "10px", background: "#111c18", borderRadius: "0 0 8px 8px", margin: "0 auto", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }} />
            </div>

      
            <div style={{ position: "absolute", right: "10px", bottom: "24px", zIndex: 2, transform: "translateY(10px)" }}>
              <div className="lphone" style={{ width: "clamp(140px, 20vw, 180px)", boxShadow: "0 0 0 8px #1b2a26, 0 24px 48px rgba(0,0,0,0.5)" }}>
                <div className="lphone-status" style={{ fontSize: "clamp(9px, 1.5vw, 10px)", padding: "5px 12px" }}>
                  <span>9:41</span><span>●●●</span>
                </div>
                <div className="lphone-nav" style={{ fontSize: "clamp(10px, 1.5vw, 11px)" }}>ДОХИО</div>
                <div className="lphone-cam">
                  <div className="lphone-scan" />
                  <div className="lphone-cap mt-0" style={{ padding: "10px", display: "flex", flexDirection: "column" }}>
                    <div className="cl" style={{ fontSize: "clamp(7px, 1.2vw, 8px)" }}><span>●</span> Дохио → Дуу хоолой</div>
                  </div>
                </div>
                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
                  <button style={{ background: "var(--olive)", borderRadius: "12px", padding: "10px", textAlign: "center", color: "#fff", fontSize: "clamp(10px, 1.5vw, 11px)", fontWeight: 700, border: "none", cursor: "pointer", width: "100%" }}>
                    Дуудлага эхлүүлэх
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="flex-1">
            <div className="ltag" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>Тав тухтай хэрэглэх</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: "16px", lineHeight: 1.1 }}>
              Гарт багтах хэлмэрч
            </h2>
            <p style={{ fontSize: "clamp(14px, 3vw, 17px)", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "480px" }}>
              Цаасгүй, хэлмэрчгүй, тусгай төхөөрөмжгүй — гар утас л хангалттай. Хаана ч, хэзээ ч ашиглана.
            </p>
          </div>

        </div>
      </section>
    </>
  );
};