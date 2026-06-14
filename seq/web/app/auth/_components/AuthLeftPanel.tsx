"use client";

import Link from "next/link";
import { CameraIcon, MicrophoneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

const FEATURES: { Icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; desc: string }[] = [
  { Icon: CameraIcon,      title: "Дохиог хөрвүүлэн яриаг сонсох", desc: "Монгол дохионы хэлийг яриа руу шууд хөрвүүлэх" },
  { Icon: MicrophoneIcon,  title: "Яриаг бичвэр болгох",           desc: "Яриаг бичвэр болгон хөрвүүлэх" },
  { Icon: ChatBubbleLeftRightIcon, title: "Чатлан видео дуудлага хийх", desc: "Найзтайгаа видео дуудлага хийж, мессэж бичих" },
];

export const AuthLeftPanel = ({ mode }: { mode: "login" | "register" }) => (
  <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden p-16 flex-col justify-between bg-gradient-to-br from-[var(--teal)] via-[var(--teal-2)] to-[var(--bg)]">
    <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30 bg-[var(--olive)] animate-pulse" />
    <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-[var(--teal)]" />

    <div className="relative z-10">
      <Link href="/" className="inline-flex flex-nowrap items-center gap-3">
        <img src="/images/logoShar.png" alt="Sign Bridge" className="h-13 w-13 flex-shrink-0 object-contain" />
        <div className="flex items-baseline gap-0.5">
          <span className="font-black text-xl tracking-tight" style={{ color: "var(--olive)" }}>Sign</span>
          <span className="font-black text-xl tracking-tight text-white">Bridge</span>
        </div>
      </Link>
    </div>

    <div className="relative z-10 max-w-lg w-full mx-auto my-auto py-12">
      <h1 className="text-white text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight mb-6">
        Дохионы хэлмэрч <br />
        <span style={{ color: "var(--olive)" }}>таны халаасанд</span>
      </h1>
      <p className="text-white/70 text-base leading-relaxed mb-10">
        {mode === "register"
          ? "Та бүртгүүлснээр дохионы хэлний шууд хөрвүүлэгч цогц шийдлийг ашиглах боломжтой"
          : "Та нэвтэрснээр дохионы хэлний шууд хөрвүүлэгч цогц шийдлийг ашиглах боломжтой"}
      </p>

      <div className="space-y-3">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)" }}>
              <Icon className="h-5 w-5" style={{ color: "var(--olive)" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
