export const ThreeSteps = () => {
  const steps = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      title: "Камераа нээнэ",
      desc: "Камераа нэвтрүүлж, дохионы хэлтнийг бичлэг авна. Зөвшөөрлийг нэг удаа өгнө.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>
        </svg>
      ),
      title: "Дохимогоо үзүүлнэ",
      desc: "Гарын дохиог камерт үзүүлэхэд AI шууд таниж, орчуулгыг эхлүүлнэ.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
      title: "Шууд дуугаар сонсоно",
      desc: "Орчуулсан үгийг монгол дуу хоолойгоор шууд сонсгоно. Бичвэр хэлбэрээр ч харагдана.",
    },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .lstep-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 1024px) {
          .lstep-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <section className="lhow lsec" id="how-it-works" style={{ padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 32px)" }}>
        <div className="lsec-head" style={{ marginBottom: "clamp(32px, 6vw, 50px)" }}>
          <div className="ltag" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>Гурван амжилт</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginTop: "clamp(12px, 2vw, 16px)", marginBottom: "clamp(10px, 2vw, 14px)" }}>
            Гурван энгийн алхам
          </h2>
          <p style={{ fontSize: "clamp(14px, 3vw, 15px)", color: "var(--text-2)", marginTop: "clamp(10px, 2vw, 12px)", lineHeight: 1.6 }}>
            Татаж авснаас хойш хэдхэн секундын дотор — хэрэглэхэд хялбар, зохион байгуулалттай.
          </p>
        </div>

        <div className="lstep-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(14px, 3vw, 20px)" }}>
          {steps.map((step, i) => (
            <div key={i} className="lstep" style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "24px", padding: "clamp(20px, 4vw, 30px)" }}>
              <div className="num" style={{ position: "absolute", top: "clamp(16px, 3vw, 24px)", right: "clamp(18px, 3vw, 26px)", fontFamily: "var(--font-display)", fontSize: "clamp(32px, 6vw, 40px)", fontWeight: 800, color: "var(--olive-faint)" }}>0{i + 1}</div>
              <div className="ic" style={{ width: "clamp(48px, 10vw, 56px)", height: "clamp(48px, 10vw, 56px)", borderRadius: "16px", background: "linear-gradient(150deg,var(--olive),var(--olive-deep))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(14px, 2vw, 18px)", flexShrink: 0 }}>
                {step.icon}
              </div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px, 3vw, 19px)", fontWeight: 600, marginBottom: "clamp(8px, 1.5vw, 10px)", color: "var(--text)" }}>{step.title}</h4>
              <p style={{ fontSize: "clamp(13px, 2vw, 14.5px)", color: "var(--text-2)", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};