import { Logo } from "../Logo";

export const ResponsiveDesign = () => {
  return (
    <>
      <style>{`
        @keyframes lscan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .handy-mockup {
            display: none !important;
          }
          .handy-flex {
            flex-direction: column !important;
          }
        }
      `}</style>

      <section>
        <div
          className="max-w-5xl mx-auto handy-flex"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "clamp(40px, 6vw, 80px)",
            alignItems: "center",
          }}
        >
          <div
            className="handy-mockup"
            style={{
              position: "relative",
              flex: "0 0 auto",
              width: "clamp(340px, 45vw, 520px)",
              height: "clamp(320px, 42vw, 460px)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "clamp(260px, 38vw, 360px)",
                  background: "#0d1a14",
                  borderRadius: "14px 14px 0 0",
                  padding: "12px",
                  border: "2px solid #1e2e2b",
                  boxShadow: "0 -4px 30px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(160deg,#162418,#0e1714)",
                    borderRadius: "8px",
                    padding: "16px",
                    minHeight: "200px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: "2px",
                      background:
                        "linear-gradient(90deg,transparent,var(--olive-bright),transparent)",
                      boxShadow: "0 0 14px var(--olive-bright)",
                      animation: "lscan 2.4s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "8px",
                        background: "var(--olive)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Logo />
                    </div>

                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: "clamp(8px, 1.5vw, 9px)",
                        fontWeight: 700,
                        color: "var(--olive-bright)",
                        background: "rgba(132,201,138,0.15)",
                        padding: "4px 9px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--olive-bright)",
                          display: "inline-block",
                          animation: "pulse 1.2s infinite",
                        }}
                      />
                      Хөрвүүлж байна
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(12,18,14,0.75)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "clamp(8px, 1.5vw, 9px)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--olive-bright)",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "var(--olive-bright)",
                          display: "inline-block",
                        }}
                      />
                      Дохио → Яриа
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(13px, 2vw, 15px)",
                        fontWeight: 600,
                        color: "#eef4f0",
                        lineHeight: 1.4,
                      }}
                    >
                      Сайн байна уу?
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                      alignItems: "flex-end",
                      height: "32px",
                    }}
                  >
                    {[30, 60, 45, 80, 55, 70, 40, 75, 50, 65, 35, 55].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: "3px",
                            background: "var(--olive-bright)",
                            opacity: 0.4 + (i % 3) * 0.2,
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "clamp(260px, 38vw, 360px)",
                  height: "14px",
                  background: "#1a2a26",
                  borderRadius: "0 0 6px 6px",
                  border: "2px solid #1e2e2b",
                  borderTop: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "55px",
                    height: "3px",
                    borderRadius: "2px",
                    background: "#0d1a14",
                  }}
                />
              </div>
              <div
                style={{
                  width: "clamp(285px, 42vw, 400px)",
                  height: "10px",
                  background: "#111c18",
                  borderRadius: "0 0 8px 8px",
                  margin: "0 auto",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "0px",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: "clamp(150px, 20vw, 190px)",
                  background: "#0d1a14",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 0 0 8px #1b2a26, 0 24px 48px rgba(0,0,0,0.5)",
                  border: "2px solid #1e2e2b",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 14px 4px",
                    fontSize: "10px",
                    color: "#eef4f0",
                    fontWeight: 600,
                  }}
                >
                  <span>9:41</span>
                  <span style={{ letterSpacing: "1px" }}>●●●</span>
                </div>
                {/* Nav */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#eef4f0",
                    padding: "4px 0 8px",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "0.08em",
                  }}
                >
                  Sign Bridge
                </div>
                {/* Camera / screen area */}
                <div
                  style={{
                    background: "linear-gradient(160deg,#162418,#0e1714)",
                    margin: "0 10px",
                    borderRadius: "12px",
                    minHeight: "clamp(100px, 14vw, 140px)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: "2px",
                      background:
                        "linear-gradient(90deg,transparent,var(--olive-bright),transparent)",
                      boxShadow: "0 0 14px var(--olive-bright)",
                      animation: "lscan 2.4s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      padding: "8px",
                      fontSize: "7px",
                      fontWeight: 700,
                      color: "var(--olive-bright)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--olive-bright)",
                        display: "inline-block",
                        animation: "pulse 1.2s infinite",
                      }}
                    />
                    Дохио → Яриа
                  </div>
                </div>

                <div style={{ padding: "10px" }}>
                  <div
                    style={{
                      background: "rgba(132,201,138,0.15)",
                      border: "1px solid rgba(132,201,138,0.2)",
                      borderRadius: "10px",
                      padding: "8px 10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "var(--olive-bright)",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "var(--olive-bright)",
                          display: "inline-block",
                        }}
                      />
                      Дохио → Яриа
                    </div>
                  </div>
                  <button
                    style={{
                      background: "var(--olive)",
                      borderRadius: "12px",
                      padding: "10px",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "clamp(10px, 1.5vw, 11px)",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Дуудлага эхлүүлэх
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
