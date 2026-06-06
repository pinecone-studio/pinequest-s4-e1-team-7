const ITEMS = [
  { num: "1.", title: "Дохио хэл - Яриа", desc: "Монгол дохионы хэлийг хөрвүүлж яриа болгоно." },
  { num: "2.", title: "Яриа - Бичвэр", desc: "Яриаг бичвэр болгож, дохионы хэлтэн уншина." },
  { num: "3.", title: "Видео дуудлага", desc: "Видео дуудлага дээр дохионы хэлийг шууд хөрвүүлэн уншина." },
];

export const ThreeModes = () => (
  <section className="w-full py-20 px-4 md:px-16" style={{ background: "var(--surface-2)" }} id="features">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-16">
      <div className="flex-1">
        <span className="ltag">Онцлог</span>
        <h2
          className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl"
          style={{ color: "var(--text)" }}
        >
          Харилцааны гүүр
        </h2>
        <p className="mt-4 max-w-[420px] text-base leading-relaxed md:text-lg" style={{ color: "var(--text-2)" }}>
          Sign Bridge нь монгол дохионы хэлийг шууд хөрвүүлэн, хүн хоорондын харилцааны гүүр болох платформ.
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col gap-3">
        {ITEMS.map(({ num, title, desc }) => (
          <div
            key={num}
            className="flex items-start gap-4 rounded-[18px] border p-4 transition hover:shadow-sm md:p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
          >
            <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: "var(--olive)" }}>
              {num}
            </span>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h3>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
