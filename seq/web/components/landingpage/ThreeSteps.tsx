const steps = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Камераа нээнэ",
    desc: "Камераа нээж, дохионы хэлтнийг бичлэг авна. Зөвшөөрлийг нэг удаа өгнө.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" />
      </svg>
    ),
    title: "Дохимогоо үзүүлнэ",
    desc: "Гарын дохиог камерт үзүүлэхэд AI шууд таниж, орчуулгыг эхлүүлнэ.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    title: "Шууд дуугаар сонсоно",
    desc: "Орчуулсан үгийг монгол дуу хоолойгоор шууд сонсгоно. Бичвэр хэлбэрээр ч харагдана.",
  },
];

export const ThreeSteps = () => (
  <section className="w-full px-4 py-20 md:px-16" style={{ background: "var(--surface-2)" }} id="how">
    <div className="mx-auto max-w-4xl">
      {/* Section header */}
      <div className="mb-12 text-center">
        <span className="ltag">Гурван алхам</span>
        <h2
          className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Хэрхэн ажилладаг вэ?
        </h2>
        <p className="mt-3 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-2)" }}>
          Татаж авснаас хойш хэдхэн секундын дотор — хэрэглэхэд хялбар, зохион байгуулалттай.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="relative rounded-3xl border p-6 transition hover:shadow-md"
            style={{ background: "var(--surface)", borderColor: "var(--border-c)" }}
          >
            {/* Big number */}
            <span
              className="absolute right-5 top-4 font-display text-4xl font-black select-none"
              style={{ color: "var(--olive-faint)" }}
            >
              0{i + 1}
            </span>
            {/* Icon */}
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white"
              style={{ background: "linear-gradient(150deg, var(--olive), var(--olive-deep))" }}
            >
              {step.icon}
            </div>
            <h4
              className="font-display mb-2 text-base font-semibold md:text-lg"
              style={{ color: "var(--text)" }}
            >
              {step.title}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
