"use client";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ChatBubbleLeftRightIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import type { FC, SVGProps, CSSProperties } from "react";

type FloatP = { y: number; wobble?: number; dur: number; delay: number };
type PillDef = {
  text: string;
  sent: boolean;
  rot: number;
  pos: CSSProperties;
  mobileHide?: boolean;
  fp: FloatP;
};
type CircleDef = {
  href: string;
  label: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
  pos: CSSProperties;
  fp: FloatP;
};

const PILLS: PillDef[] = [
  { text: "Дохионоос яриа руу",     sent: true,  rot: -14, pos: { top: "4%",  right: "5%" },  fp: { y: 4, wobble: 1.6, dur: 4.4, delay: 0.0 } },
  { text: "Яриаг бичвэр болгох",    sent: false, rot:  -8, pos: { top: "12%", left:  "8%" },  fp: { y: 5, wobble: 1.2, dur: 5.1, delay: 0.5 } },
  { text: "Монгол дохионы хэл",     sent: true,  rot: -17, pos: { top: "21%", right: "8%" },  fp: { y: 3, wobble: 1.8, dur: 4.6, delay: 1.0 }, mobileHide: true },
  { text: "Бодит цагийн орчуулга",  sent: false, rot:   7, pos: { top: "30%", left:  "6%" },  fp: { y: 5, wobble: 1.4, dur: 5.4, delay: 0.3 }, mobileHide: true },
  { text: "Гарын үсгийн толь",      sent: true,  rot: -11, pos: { top: "50%", right: "5%" },  fp: { y: 4, wobble: 1.6, dur: 4.8, delay: 0.7 } },
  { text: "Хэл хоорондын холбоо",   sent: false, rot:  13, pos: { top: "60%", left:  "7%" },  fp: { y: 5, wobble: 1.2, dur: 5.6, delay: 1.3 }, mobileHide: true },
  { text: "Дохионы илэрхийлэл",     sent: true,  rot:  -8, pos: { top: "72%", right: "6%" },  fp: { y: 3, wobble: 1.8, dur: 4.2, delay: 0.2 } },
  { text: "Толь бичгийн хэсэг",     sent: false, rot:  -4, pos: { top: "81%", left: "10%" },  fp: { y: 4, wobble: 1.4, dur: 5.0, delay: 0.9 }, mobileHide: true },
];

const CIRCLES: CircleDef[] = [
  { href: "/dashboard/call", label: "Чат эхлэх",    Icon: ChatBubbleLeftRightIcon, pos: { top: "37%", left:  "5%" }, fp: { y: 6, dur: 5.2, delay: 0.0 } },
  { href: "/dashboard/call", label: "Видео дуудлага", Icon: VideoCameraIcon,        pos: { top: "42%", right: "7%" }, fp: { y: 5, dur: 6.8, delay: 2.8 } },
];

const PILL_BASE: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "clamp(0.88rem, 1.55vw, 1.15rem)",
  fontWeight: 600,
  lineHeight: 1.2,
  borderRadius: "18px",
  padding: "9px 18px",
  whiteSpace: "nowrap",
  userSelect: "none",
};
const SENT: CSSProperties = { background: "#f6c945", color: "#0d1b2a" };
const RECV: CSSProperties = { background: "#1c2d42", color: "#e0eaf4" };

export const HeroPillCluster = () => {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative h-[300px] w-full overflow-hidden rounded-3xl md:h-full"
      style={{ border: "1px solid var(--border-c)" }}
    >
      {PILLS.map((p, i) => (
        <motion.div
          key={p.text}
          aria-hidden="true"
          className={`absolute z-[2] ${p.mobileHide ? "hidden md:block" : ""}`}
          style={p.pos}
          initial={{ opacity: 0, y: -160, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: p.rot }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  y:       { type: "spring", damping: 13, stiffness: 68, delay: i * 0.06 },
                  rotate:  { type: "spring", damping: 17, stiffness: 80, delay: i * 0.06 },
                  opacity: { duration: 0.26, ease: "easeOut",            delay: i * 0.06 },
                }
          }
        >
          <motion.span
            style={{ ...PILL_BASE, ...(p.sent ? SENT : RECV) }}
            animate={
              reduce
                ? undefined
                : {
                    y:      [0, -p.fp.y, 0, p.fp.y * 0.5, 0],
                    rotate: [0, p.fp.wobble ?? 0, 0, -(p.fp.wobble ?? 0) * 0.4, 0],
                  }
            }
            transition={
              reduce
                ? undefined
                : { duration: p.fp.dur, repeat: Infinity, ease: "easeInOut", delay: p.fp.delay }
            }
          >
            {p.text}
          </motion.span>
        </motion.div>
      ))}

      {CIRCLES.map((c, i) => {
        const CircleIcon = c.Icon;
        return (
          <motion.div
            key={c.label}
            className="absolute z-[10]"
            style={c.pos}
            initial={{ opacity: 0, y: -160 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    y:       { type: "spring", damping: 15, stiffness: 60, delay: i * 0.22 + 0.18 },
                    opacity: { duration: 0.28, ease: "easeOut",            delay: i * 0.22 + 0.18 },
                  }
            }
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -c.fp.y, 0, c.fp.y * 0.5, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: c.fp.dur, repeat: Infinity, ease: "easeInOut", delay: c.fp.delay }
              }
            >
              <Link
                href={c.href}
                aria-label={c.label}
                className="flex items-center justify-center rounded-full
                           transition-all duration-150
                           hover:scale-105 hover:brightness-110 active:scale-95
                           focus-visible:outline focus-visible:outline-2
                           focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                style={{
                  width:      "clamp(48px, 9vw, 110px)",
                  height:     "clamp(48px, 9vw, 110px)",
                  background: "linear-gradient(135deg, #0a2038 0%, #1a3d5c 100%)",
                  border:     "1px solid rgba(150,200,255,0.16)",
                  boxShadow:  "0 8px 28px rgba(0,0,0,0.28)",
                  color:      "var(--olive)",
                }}
              >
                <CircleIcon className="h-5 w-5 md:h-7 md:w-7" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
