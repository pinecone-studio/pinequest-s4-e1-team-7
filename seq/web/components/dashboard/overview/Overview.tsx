"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfileAvatarButton } from "../shared/ProfileAvatarButton";
import { NotificationBell } from "../shared/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { ChatTile } from "./ChatTile";
import { VcallTile, KboardTile } from "./FeatureTiles";
import { StripTile, VoiceTile, DictTile } from "./HorizontalTiles";

export const Overview = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "Хэрэглэгч";
  const logoSrc = theme === "dark" ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-4 md:hidden">
        <Link href="/dashboard/overview" className="flex items-center gap-1.5" aria-label="Нүүр хуудас">
          <img src={logoSrc} alt="Sign Bridge" className="h-9 w-9 rounded-lg object-contain" />
          <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: 19 }}>Sign</span>
          <span style={{ color: "var(--text)", fontWeight: 900, fontSize: 19 }}>Bridge</span>
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
                   md:overflow-hidden md:px-6 md:pb-5 lg:px-10 xl:px-14"
      >
        <div className="shrink-0 pb-3 pt-3">
          <p className="text-[15px]" style={{ color: "var(--text-3)" }}>Сайн байна уу?</p>
          <p className="mt-0.5 text-[25px] font-bold" style={{ color: "var(--text)" }}>{displayName}</p>
        </div>

        <div className="bento-grid md:flex-1">
          <ChatTile />
          <StripTile />
          <VcallTile />
          <KboardTile />
          <VoiceTile />
          <DictTile />
        </div>
      </div>

      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto auto auto;
          grid-template-areas:
            "chat   chat"
            "strip  strip"
            "vcall  kboard"
            "voice  dict";
          gap: 12px;
        }
        @media (min-width: 768px) {
          .bento-grid {
            grid-template-columns: 1.2fr 0.9fr 0.9fr;
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "chat  strip  strip"
              "chat  vcall  kboard"
              "voice voice  dict";
            gap: 16px;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};
