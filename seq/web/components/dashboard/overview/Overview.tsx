"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileAvatarButton } from "../shared/ProfileAvatarButton";
import { NotificationBell } from "../shared/NotificationBell";
import { FeatureCarousel } from "./FeatureCarousel";
import { useState, useEffect } from "react";
import type { CarouselFeature } from "./FeatureCarousel";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

const FEATURES: CarouselFeature[] = [
  {
    id: "call",
    title: "Чат",
    sub: "Нэр, утсаар хайж чат, дуу, видео дуудлага",
    img: "/images/video.png",
    dark: true,
    bg: "linear-gradient(135deg, #1a3d5c 0%, var(--teal-2) 100%)",
    href: "/dashboard/call",
    btnBg: "rgba(255,255,255,0.18)",
    btnColor: "#eaf0f8",
  },
  {
    id: "translator",
    title: "Монгол дохионы хэл",
    sub: "Дохионы хэлнээс яриа болгон сонсоно.",
    img: "/images/welcome.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/translator",
  },
  {
    id: "voice",
    title: "Ярианаас бичвэр",
    sub: "Яриаг бичвэр болгоно.",
    img: "/images/text.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/voice",
  },
  {
    id: "dict",
    title: "Толь бичиг",
    sub: "Монгол дохионы цагаан толгой, тоо",
    img: "/images/hero.png",
    dark: true,
    bg: "linear-gradient(135deg, var(--teal) 0%, #0b2840 100%)",
    href: "/dashboard/dict",
    btnBg: "rgba(255,255,255,0.18)",
    btnColor: "#eaf0f8",
  },
];

export function Overview() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "Хэрэглэгч";

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <div
      className="h-full flex flex-col overflow-hidden px-4 md:px-6 lg:px-10 xl:px-16"
      style={{ background: "var(--bg)" }}
    >
      {/* Mobile header: logo · theme toggle · settings */}
      <div className="flex items-center justify-between pt-4 pb-1 md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center"
          aria-label="Нүүр хуудас"
        >
          {mounted && (
            <>
              <img
                src={logoSrc}
                alt="Sign Bridge"
                className="h-13 w-13 rounded-lg object-contain"
              />
              <div className="flex gap-1 items-baseline">
                <span
                  style={{
                    color: "var(--olive)",
                    fontWeight: 900,
                    fontSize: "20px",
                  }}
                >
                  Sign
                </span>
                <span
                  style={{
                    color: "var(--text)",
                    fontWeight: 900,
                    fontSize: "20px",
                  }}
                >
                  Bridge
                </span>
              </div>
            </>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <ProfileAvatarButton size={40} />
        </div>
      </div>

      {/* Greeting row */}
      <div className="flex items-start justify-between pb-1 pt-2 md:pt-3">
        <div>
          <p className="text-[14px] md:text-[15px]" style={{ color: "var(--text-3)" }}>
            Сайн байна уу?
          </p>
          <h2
            className="mt-0.5 text-[22px] font-bold leading-tight md:text-[24px] lg:text-[26px]"
            style={{ color: "var(--text)" }}
          >
            {displayName}
          </h2>
        </div>
      </div>

      {/* Hero headline */}
      <div className="pb-2 pt-1">
        <h1
          className="text-[28px] font-bold leading-[1.06] tracking-[-0.5px] md:text-[34px] lg:text-[40px]"
          style={{ color: "var(--text)" }}
        >
          Монгол дохионы хэлнээс
          <br />
          шууд хөрвүүлэх платформ
        </h1>
      </div>

      {/* Feature carousel — fills remaining viewport height on desktop */}
      <div className="md:flex-1 md:min-h-0 pb-[max(calc(env(safe-area-inset-bottom)+4rem),5.5rem)] md:pb-5">
        <FeatureCarousel features={FEATURES} />
      </div>
    </div>
  );
}
