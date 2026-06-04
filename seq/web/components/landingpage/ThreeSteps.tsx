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
    <section className="w-full bg-[#f5f7f5] py-24 px-8 md:px-16" id="how-it-works">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">Гурван амжилт</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-black">Гурван энгийн алхам</h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm leading-relaxed">
            Татаж авснаас хойш хэдхэн секундын дотор — хэрэглэхэд хялбар, зохион байгуулалттай.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                {step.icon}
              </div>
              <h3 className="font-bold text-black text-base">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};