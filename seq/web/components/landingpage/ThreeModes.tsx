export const ThreeModes = () => {
  return (
    <section className="w-full bg-[#f5f7f5] py-24 px-8 md:px-16" id="features">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">Үндсэн боломжууд</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-black leading-tight mb-6">
            Гурван горим, нэг зорилго — харилцаа
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Дохио нь tap-тай нэмэлт хэрэгсэлгүйгээр дохионы хэлийг шууд монгол дуу хоолой болгон, хүн бүрийг ойлголцоход тусалдаг платформ.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {[
            { num: "01", title: "Дохио → Дуу хоолой", desc: "Дохионы хэлийг шууд монгол дуу хоолойд хөрвүүлнэ." },
            { num: "02", title: "Дуу хоолой → Бичвэр", desc: "Яриаг бичвэр болгож, дохионы хэлтнүүдэд харуулна." },
            { num: "03", title: "Видео дуудлага", desc: "Видео дуудлага дээр шууд хэлмэрчилнэ." },
          ].map((item) => (
            <div key={item.num} className="flex gap-4 items-start p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
              <span className="text-xs font-bold text-green-500 mt-1">{item.num}</span>
              <div>
                <h3 className="font-semibold text-black text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};