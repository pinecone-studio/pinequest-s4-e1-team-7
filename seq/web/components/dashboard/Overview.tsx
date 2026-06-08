import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FeatureCarousel } from "./FeatureCarousel";
import type { CarouselFeature } from "./FeatureCarousel";

const FEATURES: CarouselFeature[] = [
  {
    id: "translator",
    title: "Монгол дохионы хэл",
    sub: "Дохио → Яриа хөрвүүлэгч",
    img: "/images/welcome.png",
    dark: true,
    bg: "linear-gradient(135deg, var(--teal) 0%, var(--teal-2) 100%)",
    href: "/dashboard/translator",
  },
  {
    id: "voice",
    title: "Ярианаас бичвэр",
    sub: "Яриаг текст болгоно",
    img: "/images/text.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/voice",
  },
  {
    id: "call",
    title: "Видео дуудлага",
    sub: "Шууд дохио хэлмэрчлэл",
    img: "/images/video.png",
    dark: true,
    bg: "linear-gradient(135deg, #1a3d5c 0%, var(--teal-2) 100%)",
    href: "/dashboard/call",
  },
  {
    id: "dict",
    title: "Толь бичиг",
    sub: "Дохионы цагаан толгой",
    img: "/images/hero.png",
    dark: false,
    bg: "var(--surface)",
    href: "/dashboard/dict",
  },
];

export async function Overview() {
  const user = await currentUser();
  const name = user?.firstName ?? "Хэрэглэгч";
  const h = new Date().getHours();
  const greeting =
    h < 6 ? "Шөнийн мэнд" : h < 12 ? "Өглөөний мэнд" : h < 18 ? "Өдрийн мэнд" : "Оройн мэнд";

  return (
    <div className="pb-4" style={{ background: "var(--bg)" }}>

      {/* Mobile header: logo · theme toggle · settings */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1 md:hidden">
        <Link href="/dashboard" aria-label="Нүүр хуудас">
          <img src="/images/logo.png" alt="Sign Bridge" className="h-10 w-10 rounded-xl" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard/settings"
            aria-label="Тохиргоо"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ border: "1px solid var(--border-c)", background: "var(--surface)" }}
          >
            <Cog6ToothIcon className="h-[18px] w-[18px]" style={{ color: "var(--text)" }} />
          </Link>
        </div>
      </div>

      {/* Greeting row */}
      <div className="flex items-start justify-between px-5 pb-2 pt-3 md:pt-6">
        <div>
          <p className="text-[14px]" style={{ color: "var(--text-3)" }}>
            {greeting},
          </p>
          <h2
            className="mt-0.5 text-[22px] font-bold leading-tight"
            style={{ color: "var(--text)" }}
          >
            {name}
          </h2>
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarIcon className="h-3.5 w-3.5" style={{ color: "var(--olive)" }} />
            <span
              className="text-[12px] font-semibold"
              style={{ color: "var(--text-3)" }}
            >
              Гишүүн
            </span>
          </div>
        </div>

      </div>

      {/* Hero headline */}
      <div className="px-5 pb-3 pt-1">
        <h1
          className="text-[32px] font-bold leading-[1.08] tracking-[-0.5px] md:text-[42px]"
          style={{ color: "var(--text)" }}
        >
          Дохионы хэлийг
          <br />
          судалцгаая!
        </h1>
      </div>

      {/* Feature carousel with scroll indicator */}
      <FeatureCarousel features={FEATURES} />
    </div>
  );
}
