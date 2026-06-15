"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  HandRaisedIcon,
  SpeakerWaveIcon,
  FaceSmileIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileAvatarButton } from "../shared/ProfileAvatarButton";
import { NotificationBell } from "../shared/NotificationBell";
import { HeroPillCluster } from "./HeroPillCluster";
import { AvatarOrbit } from "./AvatarOrbit";
import type { ChipDef } from "./AvatarOrbit";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

type CardDef = {
  id: string;
  title: string;
  sub: string;
  href: string;
  avatar: string;
  chips: ChipDef[];
};

const CHIPS_TRANSLATOR: ChipDef[] = [
  {
    Icon: HandRaisedIcon,
    bg: "#e8b830",
    iconColor: "#0d1b2a",
    cx: 88, cy: 10,
    connector: { cpX: 80, cpY: 20, ex: 72, ey: 28 },
    drift: { x: 1.5, y: -2.5, dur: 4.8, delay: 0 },
  },
  {
    special: "waveform",
    bg: "#bf4d6e",
    iconColor: "#fff",
    cx: 14, cy: 82,
    connector: { cpX: 22, cpY: 76, ex: 30, ey: 70 },
    drift: { x: -1.5, y: 2.5, dur: 5.3, delay: 0.9 },
  },
];

const CHIPS_VOICE: ChipDef[] = [
  {
    Icon: SpeakerWaveIcon,
    bg: "#bf4d6e",
    iconColor: "#fff",
    cx: 88, cy: 10,
    connector: { cpX: 80, cpY: 20, ex: 72, ey: 28 },
    drift: { x: 1.5, y: -2.5, dur: 4.5, delay: 0 },
  },
  {
    special: "dots",
    bg: "rgba(0,0,0,0.09)",
    iconColor: "rgba(40,70,110,0.72)",
    cx: 14, cy: 82,
    connector: { cpX: 22, cpY: 76, ex: 30, ey: 70 },
    drift: { x: -1.5, y: 2.5, dur: 5.1, delay: 0.8 },
  },
];

const CHIPS_DICT: ChipDef[] = [
  {
    Icon: BookOpenIcon,
    bg: "#e8b830",
    iconColor: "#0d1b2a",
    cx: 88, cy: 10,
    connector: { cpX: 80, cpY: 20, ex: 72, ey: 28 },
    drift: { x: 1.5, y: -2.5, dur: 4.7, delay: 0 },
  },
  {
    Icon: FaceSmileIcon,
    bg: "rgba(0,0,0,0.09)",
    iconColor: "rgba(40,70,110,0.72)",
    cx: 14, cy: 82,
    connector: { cpX: 22, cpY: 76, ex: 30, ey: 70 },
    drift: { x: -1.5, y: 2.5, dur: 5.5, delay: 0.7 },
  },
];

const CARDS: CardDef[] = [
  {
    id: "translator",
    title: "Дохионоос яриа руу сонсох",
    sub: "Унших хоолойг сонгох",
    href: "/dashboard/translator",
    avatar: "/avatar/avatar8.png",
    chips: CHIPS_TRANSLATOR,
  },
  {
    id: "voice",
    title: "Ярианаас бичвэр ба дохионы үсэг рүү унших",
    sub: "Үсгийн хэмжээг тохируулах",
    href: "/dashboard/voice",
    avatar: "/avatar/avatar9.png",
    chips: CHIPS_VOICE,
  },
  {
    id: "dict",
    title: "Толь бичиг",
    sub: "Цагаан толгой ба тоо",
    href: "/dashboard/dict",
    avatar: "/avatar/avatar8.png",
    chips: CHIPS_DICT,
  },
];

const FLEX_GROW = [2, 1, 1] as const;
const MIN_H     = ["min-h-[200px]", "min-h-[160px]", "min-h-[160px]"] as const;

export const Overview = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const displayName = user?.name ?? user?.email ?? "Хэрэглэгч";
  const logoSrc = theme === "dark" ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-4 md:hidden">
        <Link href="/dashboard/overview" className="flex items-center gap-1.5" aria-label="Нүүр хуудас">
          <img src={logoSrc} alt="Sign Bridge" className="h-9 w-9 rounded-lg object-contain" />
          <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: 19 }}>Sign</span>
          <span style={{ color: "var(--text)",  fontWeight: 900, fontSize: 19 }}>Bridge</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <ProfileAvatarButton size={38} />
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   px-4 pb-[max(calc(env(safe-area-inset-bottom)+4.5rem),5.5rem)]
                   md:overflow-hidden md:px-6 md:pb-5
                   lg:px-10 xl:px-14"
      >
        <div className="shrink-0 pt-3">
          <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Сайн байна уу?</p>
          <p className="mt-0.5 text-[20px] font-bold" style={{ color: "var(--text)" }}>
            {displayName}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3 md:flex-row md:overflow-hidden md:gap-5">
          <div className="order-2 flex flex-col gap-3 md:order-1 md:h-full md:w-1/2">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              className={MIN_H[i]}
              style={{ flexGrow: FLEX_GROW[i], flexShrink: 1, flexBasis: "0%" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : i * 0.08, duration: reduce ? 0 : 0.44, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                href={card.href}
                aria-label={`${card.title} — ${card.sub}`}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl
                           transition-all duration-200
                           hover:-translate-y-px hover:brightness-[1.04]
                           active:scale-[0.99]
                           focus-visible:outline focus-visible:outline-2
                           focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]"
                style={{ background: "var(--surface)", border: "1px solid var(--border-c)" }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0"
                  style={{ width: "52%" }}
                >
                  <AvatarOrbit avatarSrc={card.avatar} chips={card.chips} />
                </div>

                {/* fades card bg over avatar to eliminate the hard seam */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-[1]"
                  style={{
                    width: "72%",
                    background: "linear-gradient(to right, var(--surface) 46%, transparent 100%)",
                  }}
                />

                <div className="relative z-[2] p-4 md:p-5" style={{ maxWidth: "58%" }}>
                  <h2
                    className="font-bold leading-snug tracking-tight text-[13px] md:text-[14px]"
                    style={{ color: "var(--text)" }}
                  >
                    {card.title}
                  </h2>
                  <p className="mt-1.5 text-[11px]" style={{ color: "var(--text-2)" }}>
                    {card.sub}
                  </p>
                </div>

                <div className="relative z-[2] px-4 pb-4 md:px-5 md:pb-5">
                  <span
                    className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold"
                    style={{ background: "var(--olive)", color: "#0d1e35" }}
                  >
                    Эхлэх ▶
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          </div>

          <div className="order-1 md:order-2 md:h-full md:w-1/2 md:self-stretch">
            <HeroPillCluster />
          </div>
        </div>
      </div>
    </div>
  );
};
