export const FeatureVideoCall = () => {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .feature-video-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section
        style={{ background: "var(--bg)" }}
        className="w-full py-24 px-8 md:px-16"
      >
        <div
          className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center feature-video-flex"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "clamp(24px, 5vw, 48px)",
            alignItems: "center",
          }}
        >
          <div className="flex-1 flex justify-center">
            <div
              className="lphone"
              style={{ width: "clamp(160px, 30vw, 300px)" }}
            >
              <div
                className="lphone-status"
                style={{
                  fontSize: "clamp(9px, 2vw, 12px)",
                  padding: "clamp(4px, 2vw, 6px) clamp(10px, 3vw, 14px)",
                }}
              >
                <span>9:41</span>
                <span>●●●</span>
              </div>
              <div
                className="lphone-nav"
                style={{
                  fontSize: "clamp(10px, 2vw, 13px)",
                  padding: "clamp(4px, 1.5vw, 6px)",
                }}
              >
                ДОХИО
              </div>
              <div className="lphone-cam">
                <div className="lphone-scan" />
                <div
                  className="lphone-cap"
                  style={{ padding: "clamp(8px, 2vw, 12px)" }}
                >
                  <div
                    className="cl"
                    style={{
                      fontSize: "clamp(7px, 1.5vw, 9px)",
                      marginBottom: "clamp(4px, 1vw, 6px)",
                    }}
                  >
                    <span>●</span> Видео дуудлага
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "clamp(10px, 2vw, 12px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(6px, 1.5vw, 8px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "clamp(6px, 1.5vw, 8px)",
                    justifyContent: "center",
                  }}
                >
                  <button
                    style={{
                      width: "clamp(40px, 8vw, 44px)",
                      height: "clamp(40px, 8vw, 44px)",
                      borderRadius: "50%",
                      background: "#d06a4f",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="clamp(16px, 3vw, 18px)"
                      height="clamp(16px, 3vw, 18px)"
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
                    style={{
                      width: "clamp(40px, 8vw, 44px)",
                      height: "clamp(40px, 8vw, 44px)",
                      borderRadius: "50%",
                      background: "var(--olive)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="clamp(16px, 3vw, 18px)"
                      height="clamp(16px, 3vw, 18px)"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </button>
                </div>
                <div style={{ textAlign: "center" }}></div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div
              className="ltag"
              style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
            >
              03
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 5vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-1px",
                color: "var(--text)",
                marginBottom: "clamp(12px, 2vw, 16px)",
                lineHeight: 1.1,
              }}
            >
              Видео дуудлага
            </h2>
            <p
              style={{
                fontSize: "clamp(14px, 3vw, 17px)",
                color: "var(--text-2)",
                lineHeight: 1.6,
                maxWidth: "480px",
              }}
            >
              Видео дуудлага дээр талын нэгний Sign-To-Text болон Text-To-Voice
              хэлмэрчилгээ шууд монгол дуу хоолой болгон сонсгоно. Захиас
              тэмдэглэгдэж хадгалагдана.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
