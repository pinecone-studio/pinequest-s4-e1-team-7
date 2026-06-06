// components/home-grid.tsx
"use client";
import Link from "next/link";
import { Hand, Mic, Video, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tint: string;
};

const features: Feature[] = [
  {
    href: "/dashboard/translator",
    title: "Дохио → Дуу",
    subtitle: "Дохиог дуу хоолой болгоно",
    icon: Hand,
    tint: "bg-emerald-500/15 text-emerald-400",
  },
  {
    href: "/dashboard/voice",
    title: "Дуу → Бичвэр",
    subtitle: "Яриаг бичвэр болгоно",
    icon: Mic,
    tint: "bg-sky-500/15 text-sky-400",
  },
  {
    href: "/dashboard/call",
    title: "Видео дуудлага",
    subtitle: "Шууд дуудлага",
    icon: Video,
    tint: "bg-violet-500/15 text-violet-400",
  },
  {
    href: "/dashboard/dict",
    title: "Толь бичиг",
    subtitle: "Дохионы толь бичиг",
    icon: BookOpen,
    tint: "bg-amber-500/15 text-amber-400",
  },
];

export function HomeGrid() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Үндсэн үйлдлүүд</h2>
      <div className="grid grid-cols-2 gap-3">
        {features.map(({ href, title, subtitle, icon: Icon, tint }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-card p-4 transition active:scale-[0.98]"
          >
            <div
              className={`mb-3 grid h-12 w-12 place-items-center rounded-xl ${tint}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <p className="font-semibold leading-tight">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
