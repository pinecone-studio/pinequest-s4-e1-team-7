export const ThreeModes = () => {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .three-modes-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section style={{ background: "var(--surface-2)" }} className="w-full py-24 px-8 md:px-16" id="features">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center three-modes-flex" style={{ display: "flex", flexDirection: "row", gap: "clamp(24px, 5vw, 48px)", alignItems: "center" }}>

          {/* Left text */}
          <div className="flex-1">
            <div className="ltag" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>Үндсэн боломжууд</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-1.5px", color: "var(--text)", lineHeight: 1.05, marginBottom: "clamp(16px, 3vw, 20px)" }}>
              Гурван горим, нэг зорилго — харилцаа
            </h2>
            <p style={{ fontSize: "clamp(14px, 3vw, 17px)", color: "var(--text-2)", lineHeight: 1.6, maxWidth: "420px" }}>
              Дохио нь tap-тай нэмэлт хэрэгсэлгүйгээр дохионы хэлийг шууд монгол дуу хоолой болгон, хүн бүрийг ойлголцоход тусалдаг платформ.
            </p>
          </div>

          {/* Right cards */}
          <div className="flex-1 flex flex-col gap-4" style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 16px)" }}>
            {[
              { num: "01", title: "Дохио → Дуу хоолой", desc: "Дохионы хэлийг шууд монгол дуу хоолойд хөрвүүлнэ." },
              { num: "02", title: "Дуу хоолой → Бичвэр", desc: "Яриаг бичвэр болгож, дохионы хэлтнүүдэд харуулна." },
              { num: "03", title: "Видео дуудлага", desc: "Видео дуудлага дээр шууд хэлмэрчилнэ." },
            ].map((item) => (
              <div key={item.num} className="lfeat" style={{ padding: "clamp(14px, 3vw, 18px) clamp(16px, 3vw, 22px)", display: "flex", gap: "clamp(12px, 2vw, 16px)", alignItems: "flex-start", borderRadius: "18px", background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: 700, color: "var(--olive)", marginTop: "2px", minWidth: "24px", flexShrink: 0 }}>
                  {item.num}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(13px, 2.5vw, 15px)", fontWeight: 600, color: "var(--text)", marginBottom: "clamp(4px, 1vw, 6px)" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "clamp(12px, 2vw, 13px)", color: "var(--text-2)", lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};