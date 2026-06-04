export const HandyTranslator = () => {
  return (
    <section className="w-full bg-white py-24 px-8 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        {/* Two phones side by side */}
        <div className="flex-1 flex justify-center gap-4">
          {/* Phone 1 - chat list */}
          <div className="w-40 h-[340px] bg-[#0d1a0d] rounded-[32px] border-4 border-gray-800 shadow-xl flex flex-col overflow-hidden">
            <div className="bg-black h-6" />
            <div className="flex-1 p-3 flex flex-col gap-2">
              {["Дохио → Бичвэр", "Дуу хоолой → Бичвэр", "Видео дуудлага"].map((t, i) => (
                <div key={i} className={`rounded-xl p-2 ${i === 1 ? "bg-green-500" : "bg-[#1a2e1a]"}`}>
                  <p className={`text-[9px] font-medium ${i === 1 ? "text-black" : "text-green-400"}`}>{t}</p>
                  <p className={`text-[8px] mt-0.5 ${i === 1 ? "text-black/70" : "text-gray-500"}`}>Танд яг тохирох болно?</p>
                </div>
              ))}
            </div>
          </div>
          {/* Phone 2 - active call */}
          <div className="w-40 h-[340px] bg-[#0d1a0d] rounded-[32px] border-4 border-gray-800 shadow-xl flex flex-col overflow-hidden mt-8">
            <div className="bg-black h-6" />
            <div className="flex-1 p-3 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-green-400" />
              </div>
              <p className="text-white text-[9px]">Сарaa</p>
              <div className="bg-green-500 rounded-full px-3 py-1">
                <p className="text-black text-[8px] font-semibold">Яриа үргэлжилж байна</p>
              </div>
            </div>
          </div>
        </div>
        {/* Text */}
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">Тав тухтай хэрэглэх</span>
          <h2 className="text-4xl font-extrabold text-black leading-tight mb-6">Гарт багтах хэлмэрч</h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Цаасгүй, хэлмэрчгүй, тусгай төхөөрөмжгүй — гар утас л хангалттай. Хаана ч, хэзээ ч ашиглана.
          </p>
        </div>
      </div>
    </section>
  );
};