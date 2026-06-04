export const FeatureSignToVoice = () => {
  return (
    <section className="w-full bg-white py-24 px-8 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        {/* Phone mockup */}
        <div className="flex-1 flex justify-center">
          <div className="w-56 h-[420px] bg-[#0d1a0d] rounded-[40px] border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-black h-8 flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-full" />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
              <div className="bg-[#1a2e1a] rounded-2xl p-3">
                <p className="text-green-400 text-xs font-semibold">Дохио → Дуу хоолой</p>
                <p className="text-gray-300 text-[10px] mt-1">Дохиолох үед шууд монголоор чанга яриулна</p>
              </div>
              <div className="bg-green-500 rounded-2xl p-3 mt-auto">
                <p className="text-black text-xs font-semibold text-center">Дуудлага эхлүүлэх</p>
              </div>
              <div className="flex justify-center">
                <span className="text-green-400 text-[10px] bg-[#1a2e1a] px-3 py-1 rounded-full">0.3 секунд</span>
              </div>
            </div>
          </div>
        </div>
        {/* Text */}
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">01</span>
          <h2 className="text-4xl font-extrabold text-black leading-tight mb-6">Дохио → Дуу хоолой</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Дохиолох үед шууд монголоор чанга яриулна. Ярианы бэрхшээлтэй хүмүүст зориулсан хурдан, нарийвчлалтай орчуулга.
          </p>
        </div>
      </div>
    </section>
  );
};