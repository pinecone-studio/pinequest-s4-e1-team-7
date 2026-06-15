"use client";
import { motion, useReducedMotion } from "framer-motion";
import React, { type CSSProperties } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Pos = { top: string; left?: string; right?: string };
type FloatCfg = { dur: number; delay: number; amp: number };
type PillCfg = {
  id: string; label: string; variant: "yellow" | "ghost";
  pos: Pos; mobileHide?: boolean; float: FloatCfg;
};
type AvatarCfg = {
  src: string; pos: Pos; float: FloatCfg; size: string;
};

// ── Config ───────────────────────────────────────────────────────────────────
const PILLS: PillCfg[] = [
  { id:"p1", label:"Дохионоос яриа руу",    variant:"yellow", pos:{ top:"5%",  right:"4%"  }, float:{ dur:4.4, delay:0.0, amp:5 } },
  { id:"p2", label:"Яриаг бичвэр болгох",   variant:"ghost",  pos:{ top:"15%", left:"3%"   }, float:{ dur:5.1, delay:0.6, amp:4 } },
  { id:"p3", label:"Монгол дохионы хэл",    variant:"yellow", pos:{ top:"24%", right:"6%"  }, mobileHide:true, float:{ dur:4.8, delay:1.1, amp:5 } },
  { id:"p4", label:"Бодит цагийн орчуулга", variant:"ghost",  pos:{ top:"34%", left:"3%"   }, mobileHide:true, float:{ dur:5.4, delay:0.3, amp:4 } },
  { id:"p5", label:"Гарын үсгийн толь",     variant:"yellow", pos:{ top:"62%", right:"5%"  }, float:{ dur:4.8, delay:0.7, amp:5 } },
  { id:"p6", label:"Хэл хоорондын холбоо",  variant:"ghost",  pos:{ top:"65%", left:"3%"   }, mobileHide:true, float:{ dur:5.6, delay:1.4, amp:4 } },
  { id:"p7", label:"Дохионы илэрхийлэл",    variant:"yellow", pos:{ top:"74%", right:"5%"  }, float:{ dur:4.2, delay:0.2, amp:5 } },
  { id:"p8", label:"Толь бичгийн хэсэг",    variant:"ghost",  pos:{ top:"83%", left:"8%"   }, mobileHide:true, float:{ dur:5.0, delay:0.9, amp:4 } },
];

const AVATARS: AvatarCfg[] = [
  { src:"/avatar/avatar1.png", pos:{ top:"36%", left:"24%"  }, float:{ dur:5.2, delay:0.0, amp:6 }, size:"clamp(64px,18%,108px)" },
  { src:"/avatar/avatar2.png", pos:{ top:"42%", right:"18%" }, float:{ dur:6.0, delay:1.4, amp:5 }, size:"clamp(64px,18%,108px)" },
];

// ── Motion primitives ────────────────────────────────────────────────────────
function DropIn({ i, style, className, children }: {
  i: number; style?: CSSProperties; className?: string; children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className} style={style}
      initial={reduce ? false : { opacity: 0, y: -36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : {
        opacity: { duration: 0.28, ease: "easeOut",       delay: i * 0.08 },
        y:       { duration: 0.52, ease: [0.22,1,0.36,1], delay: i * 0.08 },
      }}
    >
      {children}
    </motion.div>
  );
}

function YFloat({ dur, delay, amp, children }: FloatCfg & { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, -amp, 0] }}
      transition={reduce ? undefined : {
        duration: dur, repeat: Infinity, ease: "easeInOut",
        delay, repeatType: "mirror",
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Pill styles ──────────────────────────────────────────────────────────────
const PILL_S: CSSProperties = {
  fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600,
  lineHeight: 1.3, borderRadius: "10px", padding: "6px 13px 7px",
  whiteSpace: "nowrap", display: "inline-block",
};
const YELLOW: CSSProperties = { background: "#f6c945", color: "#0d1b2a" };
const GHOST: CSSProperties  = {
  background: "var(--surface-2)", color: "var(--text)",
  border: "1px solid var(--border-c)",
};

// ── Component ─────────────────────────────────────────────────────────────────
export const HeroPillCluster = () => (
  <div
    className="relative h-[300px] w-full overflow-hidden rounded-3xl md:h-full"
    style={{ border: "1px solid var(--border-c)" }}
  >
    {/* Decorative curved connector — left avatar → right avatar */}
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* avatar1 (left ~33,45) → avatar2 (right ~78,51) */}
      <path d="M33 45 Q55 30 78 51"
        fill="none" stroke="var(--border-2)" strokeWidth="0.5"
        strokeLinecap="round" strokeDasharray="2 2" opacity="0.5" />
      {/* avatar1 → p2 pill area */}
      <path d="M33 45 Q18 28 12 22"
        fill="none" stroke="var(--border-2)" strokeWidth="0.4"
        strokeLinecap="round" opacity="0.35" />
      {/* avatar2 → p1 pill area */}
      <path d="M78 51 Q84 30 84 12"
        fill="none" stroke="var(--border-2)" strokeWidth="0.4"
        strokeLinecap="round" opacity="0.35" />
    </svg>

    {/* Two floating avatar circles */}
    {AVATARS.map((av, i) => (
      <DropIn key={av.src} i={i}
        className="absolute z-[4]"
        style={av.pos}
      >
        <YFloat {...av.float}>
          <div style={{
            width: av.size, height: av.size,
            borderRadius: "50%", overflow: "hidden",
            background: "rgba(100,175,165,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
            border: "2px solid rgba(100,175,165,0.30)",
          }}>
            <img src={av.src} alt="" aria-hidden
              className="h-full w-full object-cover object-top" />
          </div>
        </YFloat>
      </DropIn>
    ))}

    {/* Floating text pills */}
    {PILLS.map((p, i) => (
      <DropIn key={p.id} i={AVATARS.length + i}
        className={`absolute z-[3]${p.mobileHide ? " hidden md:block" : ""}`}
        style={p.pos}
      >
        <YFloat {...p.float}>
          <span aria-hidden style={{ ...PILL_S, ...(p.variant === "yellow" ? YELLOW : GHOST) }}>
            {p.label}
          </span>
        </YFloat>
      </DropIn>
    ))}
  </div>
);
