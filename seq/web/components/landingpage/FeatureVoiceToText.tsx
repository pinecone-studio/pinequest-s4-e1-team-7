export const FeatureVoiceToText = () => {
  return (
    <section className="w-full bg-[#f5f7f5] py-24 px-8 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse gap-16 items-center">
        {/* Phone mockup */}
        <div className="flex-1 flex justify-center">
          <div className="w-56 h-[420px] bg-[#0d1a0d] rounded-[40px] border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-black h-8 flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-full" />
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
              <p className="text-gray-400 text-[10px]">Дуу хоолой → Бичвэр</p>
              <div className="bg-[#1a2e1a] rounded-2xl p-3 flex-1">
                <p className="text-green-400 text-[10px] leading-relaxed">Сайн байна уу? Өнөөдөр уулзалтын цаг тохиролцох гэж байна...</p>
              </div>
              <div className="bg-[#1a2e1a] rounded-xl p-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
                <div className="flex-1 h-1 bg-green-500/30 rounded-full">
                  <div className="w-1/2 h-full bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Text */}
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">02</span>
          <h2 className="text-4xl font-extrabold text-black leading-tight mb-6">Дуу хоолой → Бичвэр</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Яриаг бичвэр болгож харуулдаг тул дохионы хэлтнүүд бусдын яриаг бичгээр уншиж ойлгоно. Энэ нь хурдан бөгөөд алдаагүй ажилладаг.
          </p>
        
        </div>
      </div>
    </section>
  );
};