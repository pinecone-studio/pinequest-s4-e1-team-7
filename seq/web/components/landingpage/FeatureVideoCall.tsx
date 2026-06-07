export const FeatureVideoCall = () => (
  <section
    className="w-full py-20 px-4 md:px-16"
    style={{ background: "var(--bg)" }}
  >
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-16">
      {/* Phone mockup */}
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
                <span /> Видео дуудлага
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-3">
            <div className="flex justify-center gap-3">
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full border-none"
                style={{ background: "#d06a4f" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </button>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full border-none"
                style={{ background: "var(--olive)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <span className="ltag">03</span>
        <h2
          className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Видео дуудлага
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
