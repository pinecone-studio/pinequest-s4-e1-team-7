"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM = [
  { src: "/images/team1.JPG", name: "Ариунзул", role: "Developer" },
  { src: "/images/team2.JPG", name: "Ганхөлөг", role: "Developer" },
  { src: "/images/team3.JPG", name: "Норовсүрэн", role: "Developer" },
  { src: "/images/team4.JPG", name: "Мөнхжин", role: "Developer" },
];

const HERO_IMGS = [
  { src: "/images/hero1.jpeg", round: true },
  { src: "/images/hero2.jpeg", round: false },
  { src: "/images/hero3.jpeg", round: true },
];

// Inline image triggers — compressed into first 35% of total scroll
const AT = [0.05, 0.15, 0.25];

// ─── Inline zoom image ────────────────────────────────────────────────────────
type ZoomProps = {
  p: MotionValue<number>;
  at: number;
  src: string;
  round?: boolean;
  wide?: boolean;
};
const Zoom = ({ p, at, src, round = false, wide = false }: ZoomProps) => {
  const scale = useTransform(p, [at, at + 0.07], [0, 1]);
  return (
    <motion.span
      style={{ scale, display: "inline-block", verticalAlign: "middle" }}
      className={`mx-[0.04em] origin-center ${wide ? "h-[0.9em] w-[1.5em]" : "h-[0.9em] w-[0.9em]"}`}
    >
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover object-top ${round ? "rounded-full" : "rounded-[14px]"}`}
      />
    </motion.span>
  );
};

// ─── Team card ────────────────────────────────────────────────────────────────
const TeamCard = ({
  p,
  member,
  index,
}: {
  p: MotionValue<number>;
  member: (typeof TEAM)[number];
  index: number;
}) => {
  const start = 0.38 + index * 0.03;
  const end = start + 0.09;
  const opacity = useTransform(p, [start, end], [0, 1]);
  const y = useTransform(p, [start, end], [40, 0]);
  const scale = useTransform(p, [start, end], [0.88, 1]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <div
        className="overflow-hidden rounded-full ring-[3px] ring-[var(--olive)]"
        style={{ width: "clamp(140px, 20vw, 290px)", height: "clamp(140px, 20vw, 290px)" }}
      >
        <img src={member.src} alt={member.name} className="h-full w-full object-cover object-top" />
      </div>
      <div>
        <p className="font-bold leading-tight text-white" style={{ fontSize: "clamp(13px, 1.3vw, 20px)" }}>
          {member.name}
        </p>
        <p className="font-semibold leading-tight" style={{ fontSize: "clamp(11px, 1vw, 16px)", color: "var(--olive)" }}>
          {member.role}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Left nav dot ─────────────────────────────────────────────────────────────
const NavDot = ({ p, num, isFirst }: { p: MotionValue<number>; num: number; isFirst: boolean }) => {
  // Both hooks always called — select by stable isFirst prop
  const opacityA = useTransform(p, [0, 0.34, 0.42], [1, 1, 0.3]);
  const opacityB = useTransform(p, [0.34, 0.42], [0.3, 1]);
  const ringA = useTransform(p, [0, 0.34, 0.42], [0.6, 0.6, 0]);
  const ringB = useTransform(p, [0.34, 0.42], [0, 0.6]);

  const opacity = isFirst ? opacityA : opacityB;
  const ringOpacity = isFirst ? ringA : ringB;

  return (
    <motion.div style={{ opacity }} className="relative flex h-7 w-7 items-center justify-center">
      <motion.div style={{ opacity: ringOpacity }} className="absolute inset-0 rounded-full border border-white" />
      <span className="relative text-[11px] font-bold text-white">{num}</span>
    </motion.div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Phase 1 — text fades and slides up
  const textY = useTransform(p, [0.28, 0.43], ["0vh", "-110vh"]);
  const textOpacity = useTransform(p, [0.28, 0.40], [1, 0]);
  const cueOpacity = useTransform(p, [0, 0.04], [1, 0]);

  // Phase 2 — team rises from below at the same time text exits
  // No opacity on the wrapper: off-screen position hides it before p=0.28
  const teamY = useTransform(p, [0.28, 0.43], ["105vh", "0vh"]);
  const titleOpacity = useTransform(p, [0.32, 0.46], [0, 1]);
  const titleY = useTransform(p, [0.32, 0.46], [28, 0]);
  const dividerScaleX = useTransform(p, [0.38, 0.54], [0, 1]);

  return (
    <section ref={ref} className="relative h-[500vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Left navigation numbers ── */}
        <div className="absolute bottom-10 left-8 z-50 flex flex-col gap-3">
          <NavDot p={p} num={1} isFirst={true} />
          <NavDot p={p} num={2} isFirst={false} />
        </div>

        {/* ══ Phase 1: Kinetic text headline ══ */}
        <motion.div
          style={{ opacity: reduce ? 1 : textOpacity, y: reduce ? 0 : textY }}
          className="absolute inset-0 flex items-center px-[6vw]"
        >
          <h1
            style={{ fontSize: "clamp(2.2rem, 5vw, 7.5rem)", lineHeight: 0.88, letterSpacing: "-0.02em" }}
            className="w-full select-none font-black uppercase"
          >
            <span className="block">
              <span style={{ color: "var(--olive)" }}>Дохионы хэлийг</span>
              <span className="text-white"> бодит цагт</span>
            </span>
            <span className="block">
              <span className="text-white">хөрвүүлж</span>{" "}
              <Zoom p={p} at={AT[0]} src={HERO_IMGS[0].src} round />{" "}
              <span className="text-white">чат бичин</span>{" "}
              <Zoom p={p} at={AT[1]} src={HERO_IMGS[1].src} wide />{" "}
              <span className="text-white">видео дуудлага</span>
            </span>
            <span className="block">
              <span className="text-white">хийх</span>{" "}
              <Zoom p={p} at={AT[2]} src={HERO_IMGS[2].src} round />{" "}
              <span className="text-white">платформ.</span>
            </span>
          </h1>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: reduce ? 0 : cueOpacity }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Доош гүйлгэх
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="h-6 w-px bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>

        {/* ══ Phase 2: Team reveal ══ */}
        <motion.div
          style={{ y: reduce ? 0 : teamY }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black px-[4vw]"
        >
          {/* "Багийн танилцуулга" title */}
          <motion.div
            style={{ opacity: reduce ? 1 : titleOpacity, y: reduce ? 0 : titleY }}
            className="mb-[3vh] text-center"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
              SignBridge
            </p>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 6.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                color: "var(--olive)",
              }}
            >
              Багийн танилцуулга
            </h2>
          </motion.div>

          {/* Olive divider scales in from center */}
          <motion.div
            style={{ scaleX: reduce ? 1 : dividerScaleX }}
            className="mb-[4vh] h-px w-full max-w-[72vw] origin-center"
          >
            <div className="h-full w-full" style={{ background: "var(--olive)", opacity: 0.45 }} />
          </motion.div>

          {/* 4 team circles */}
          <div className="flex w-full items-end justify-center gap-[2vw]">
            {TEAM.map((member, i) => (
              <TeamCard key={i} p={p} member={member} index={i} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
