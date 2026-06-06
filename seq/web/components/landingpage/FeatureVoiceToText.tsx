export const FeatureVoiceToText = () => (
  <section
    className="w-full py-20 px-4 md:px-16"
    style={{ background: "var(--surface-2)" }}
  >
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row-reverse md:gap-16">
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
                <span /> Яриа - Бичвэр
              </div>
            </div>
          </div>
          <div
            className="flex flex-col gap-2 p-3"
            style={{ background: "var(--surface)" }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
              style={{ background: "var(--olive-soft)" }}
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--olive)" }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div
                className="h-1 flex-1 rounded-full"
                style={{ background: "var(--border-2)" }}
              >
                <div
                  className="h-full w-[55%] rounded-full"
                  style={{ background: "var(--olive)" }}
                />
              </div>
              <span
                className="text-[10px] font-bold"
                style={{ color: "var(--olive-deep)" }}
              >
                0.8s
              </span>
            </div>

            <div className="text-center">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold"
                style={{
                  color: "var(--olive-bright)",
                  background: "var(--olive-soft)",
                }}
              >
                Сонсож байна...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="flex-1 text-center md:text-left">
        <span className="ltag">02</span>
        <h2
          className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Яриа - Бичвэр
        </h2>
        <p
          className="mt-4 max-w-[480px] text-base leading-relaxed md:text-lg"
          style={{ color: "var(--text-2)" }}
        >
          Яриаг бичвэр болгож, дохионы хэлтэн уншина.
        </p>
      </div>
    </div>
  </section>
);
