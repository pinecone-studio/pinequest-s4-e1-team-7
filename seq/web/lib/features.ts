import { Hand, Mic, Video, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Feature = {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tint: string;
};

export const features: Feature[] = [
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
