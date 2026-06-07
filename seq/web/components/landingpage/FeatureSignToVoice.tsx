export const FeatureSignToVoice = () => (
  <section
    className="w-full py-20 px-4 md:px-16"
    style={{ background: "var(--bg)" }}
  >
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-16">
      <div className="flex flex-1 justify-center">
        <div className="lphone w-[200px] sm:w-[240px]">
          <div className="lphone-status">
            <span>9:41</span>
            <span>●●●</span>
          </div>
          <div className="lphone-nav">Sign Bridge</div>
          <div className="lphone-cam">
            <div className="lphone-scan" />
            <div className="lphone-cap">
              <div className="cl">
                <span /> Дохионы хэл - Яриа
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <button
              className="w-full rounded-2xl py-2.5 text-center text-sm font-bold text-white"
              style={{ background: "var(--olive)" }}
            >
              Яриаг сонсох
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <span className="ltag">01</span>
        <h2
          className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Дохионы хэл - Яриа
        </h2>
        <p
          className="mt-4 max-w-[480px] text-base leading-relaxed md:text-lg"
          style={{ color: "var(--text-2)" }}
        >
          Видео дуудлага дээр дохионы хэлийг шууд хөрвүүлэн уншина.
        </p>
      </div>
    </div>
  </section>
);
