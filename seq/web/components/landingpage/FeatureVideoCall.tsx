export const FeatureVideoCall = () => {
  return (
    <section className="w-full bg-white py-24 px-8 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        {/* Phone mockup */}
        <div className="flex-1 flex justify-center">
          <div className="w-56 h-[420px] bg-[#0d1a0d] rounded-[40px] border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden relative">
            <div className="bg-black h-8 flex items-center justify-center">
              <div className="w-20 h-4 bg-black rounded-full" />
            </div>
            <div className="flex-1 bg-[#111] flex flex-col items-center justify-center gap-4 p-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-green-400" />
              </div>
              <p className="text-white text-xs">Бат-Эрдэнэ</p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-[#0d1a0d] p-3">
              <p className="text-green-400 text-[10px] text-center">Хэлмэрчилж байна...</p>
            </div>
          </div>
        </div>
        {/* Text */}
        <div className="flex-1">
          <span className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-4 block">03</span>
          <h2 className="text-4xl font-extrabold text-black leading-tight mb-6">Видео дуудлага</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Видео дуудлага дээр талын нэгний Sign-To-Text болон Text-To-Voice хэлмэрчилгээ шууд монгол дуу хоолой болгон сонсгоно. Захиас тэмдэглэгдэж хадгалагдана.
          </p>
          
        </div>
      </div>
    </section>
  );
};