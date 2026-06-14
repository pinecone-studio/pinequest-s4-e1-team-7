"use client";

import Link from "next/link";
import {
  CameraIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { STEPS } from "@/components/landingpage/features/featuresData";
import type { ComponentType, SVGProps } from "react";

const ICONS: ComponentType<SVGProps<SVGSVGElement>>[] = [
  CameraIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
];

export const AuthLeftPanel = ({ mode }: { mode: "login" | "register" }) => (
  <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden p-16 flex-col justify-between bg-gradient-to-br from-[var(--teal)] via-[var(--teal-2)] to-[var(--bg)]">
    <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30 bg-[var(--olive)] animate-pulse" />
    <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-[var(--teal)]" />

    <div className="relative z-10">
      <Link href="/" className="inline-flex flex-nowrap items-center gap-3">
        <img
          src="/images/logoShar.png"
          alt="Sign Bridge"
          className="h-13 w-13 flex-shrink-0 object-contain"
        />
        <div className="flex items-baseline gap-0.5">
          <span
            className="font-black text-xl tracking-tight"
            style={{ color: "var(--olive)" }}
          >
            Sign
          </span>
          <span className="font-black text-xl tracking-tight text-white">
            Bridge
          </span>
        </div>
      </Link>
    </div>

    <div className="relative z-10 max-w-lg w-full mx-auto my-auto py-12">
      <h1 className="text-white text-2xl xl:text-3xl font-black leading-[1.2] tracking-tight mb-6">
        Дохионы хэлийг бодит цагт хөрвүүлж{" "}
        <span style={{ color: "var(--olive)" }}>мессеж бичин видео дуудлага хийх платформ</span>
      </h1>

      <div className="space-y-3">
        {STEPS.map(({ title }, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={title}
              className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
              }
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(245,197,24,0.12)",
                  border: "1px solid rgba(245,197,24,0.25)",
                }}
              >
                <Icon className="h-5 w-5" style={{ color: "var(--olive)" }} />
              </div>
              <p className="text-sm font-bold text-white">{title}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
