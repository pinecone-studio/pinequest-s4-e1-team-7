"use client";
import { m, AnimatePresence } from "framer-motion";
import { EASE } from "../motion";

const DATA = {
  before: {
    accent: "#ef4444",
    tag: "Тулгамдаж буй асуудал",
    desc: "Монгол Улсад дохионы хэлээр ярьдаг иргэдийн хөдөлмөр эрхлэлт, мэдээлэл авах болон нийгмийн харилцаанд хүртээмжийн асуудал тулгарсаар байна.",
    big: { label: "Хөдөлмөр эрхлэлтийн түвшин", value: "18%" },
    mid: { label: "Хөгжлийн бэрхшээлтэй иргэд", value: "110,000+" },
    grid: [
      {
        label: "Дохионы хэлний хүртээмжтэй ажил олгогч байгууллага",
        value: "4",
      },
      { label: "Дохионы хэлмэрч", value: "Шаардлагатай" },
    ],
  },
  after: {
    accent: "#f5c518",
    tag: "SignBridge платформ нь",
    desc: "Иргэд шууд харилцаж, нийгэмд бүрэн оролцох, хөдөлмөрийн бүтээмж ба боломжийг нэмэгдүүлнэ.",
    big: { label: "Ажил эрхлэлтийн хүртээмжийг нэмэгдүүлэх", value: "↑" },
    mid: {
      label: "Ажил олгогч ба ажил хайгчдыг холбох",
      value: "1 платформ",
    },
    grid: [
      { label: "AI хөрвүүлэх нарийвчлал", value: "98%" },
      { label: "Тасралтгүй үйлчилгээ", value: "24/7" },
    ],
  },
};

type Props = { visible: boolean; compare: "before" | "after" };

export const GlobeStatsPanel = ({ visible, compare }: Props) => {
  const d = DATA[compare];
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="global-stats"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28, transition: { duration: 0.2 } }}
          transition={{ duration: 0.45, ease: EASE }}
          className="absolute hidden lg:flex flex-col"
          style={{
            right: "4%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "clamp(280px,27vw,400px)",
          }}
        >
          <AnimatePresence mode="wait">
            <m.div
              key={compare}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div
                className="mb-5 inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{
                  background: `${d.accent}28`,
                  color: d.accent,
                  border: `1px solid ${d.accent}66`,
                }}
              >
                {d.tag}
              </div>
              <p
                className="mb-6 text-[14px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {d.desc}
              </p>
              <div
                className="mb-6 h-px"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              <p
                className="mb-2 text-[12px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {d.big.label}
              </p>
              <p
                className="font-black leading-[0.88]"
                style={{
                  color: d.accent,
                  fontSize: "clamp(72px,8vw,110px)",
                  letterSpacing: "-3px",
                }}
              >
                {d.big.value}
              </p>
              <div
                className="my-6 h-px"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />
              <p
                className="mb-2 text-[12px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {d.mid.label}
              </p>
              <p
                className="font-black leading-none"
                style={{ color: d.accent, fontSize: "clamp(36px,4vw,56px)", letterSpacing: "-1px" }}
              >
                {d.mid.value}
              </p>
            </m.div>
          </AnimatePresence>
        </m.div>
      )}
    </AnimatePresence>
  );
};
