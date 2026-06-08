"use client";

import Link from "next/link";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FeatureCarousel } from "./FeatureCarousel";
import { useState, useEffect } from "react";
import type { CarouselFeature } from "./FeatureCarousel";
import { useUser } from "@clerk/nextjs";

const FEATURES: CarouselFeature[] = [
  {
    id: "translator",
    title: "Монгол дохионы хэл",
    sub: "Дохионы хэлнээс яриа болгон сонсоно.",
    img: "/images/welcome.png",
    dark: true,
    bg: "linear-gradient(135deg, var(--teal) 0%, var(--teal-2) 100%)",
    href: "/dashboard/translator",
  },
  {
    id: "voice",
    title: "Ярианаас бичвэр",
    sub: "Яриаг текст болгоно.",
    img: "/images/text.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/voice",
  },
  {
    id: "call",
    title: "Видео дуудлага",
    sub: "Дуудлага хийх үед дохионы хэлнээс бичвэр, яриа",
    img: "/images/video.png",
    dark: true,
    bg: "linear-gradient(135deg, #1a3d5c 0%, var(--teal-2) 100%)",
    href: "/dashboard/call",
  },
  {
    id: "dict",
    title: "Толь бичиг",
    sub: "Монгол дохионы цагаан толгой, тоо",
    img: "/images/hero.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/dict",
  },
];

export function Overview() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const displayName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Хэрэглэгч";

  useEffect(() => {
    setMounted(true);

    const checkDark = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";
  const bridgeColor = isDark ? "#E5EEFF" : "#0D1E35";

  return (
    <div
      className="h-full flex flex-col overflow-y-auto md:overflow-hidden px-4 lg:px-10 xl:px-16"
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
                    color: "#ffbf00ff",
                    fontWeight: 900,
                    fontSize: "20px",
                  }}
                >
                  Sign
                </span>
                <span
                  style={{
                    color: bridgeColor,
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
          <Link
            href="/dashboard/settings"
            aria-label="Тохиргоо"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{
              border: "1px solid var(--border-c)",
              background: "var(--surface)",
            }}
          >
            <Cog6ToothIcon
              className="h-[18px] w-[18px]"
              style={{ color: "var(--text)" }}
            />
          </Link>
        </div>
      </div>

      {/* Greeting row */}
      <div className="flex items-start justify-between pb-1 pt-3 md:pt-4">
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
      <div className="pb-3 pt-1">
        <h1
          className="text-[30px] font-bold leading-[1.06] tracking-[-0.5px] md:text-[38px] lg:text-[44px]"
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
