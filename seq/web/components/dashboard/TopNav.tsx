"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AvatarMenu } from "./AvatarMenu";
import { NotifPanel, NOTIF_COUNT } from "./NotifPanel";
import {
  HomeIcon as HomeO, HandRaisedIcon as HandO, MicrophoneIcon as MicO,
  VideoCameraIcon as VideoO, BookOpenIcon as BookO, BellIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeS, HandRaisedIcon as HandS, MicrophoneIcon as MicS,
  VideoCameraIcon as VideoS, BookOpenIcon as BookS,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "overview",   label: "Нүүр",  O: HomeO,  S: HomeS  },
  { id: "translator", label: "Дохио", O: HandO,  S: HandS  },
  { id: "voice",      label: "Яриа",  O: MicO,   S: MicS   },
  { id: "call",       label: "Видео", O: VideoO, S: VideoS },
  { id: "dict",       label: "Толь",  O: BookO,  S: BookS  },
] as const;

export const TopNav = () => {
  const active = usePathname().split("/")[2] ?? "overview";
  const [showNotif, setShowNotif] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) return null;

  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";
  const bridgeColor = isDark ? "#E5EEFF" : "#0D1E35";

  return (
    <header className="sticky top-0 z-40 hidden items-center justify-between gap-3 px-4 py-4 md:flex md:px-6 lg:px-10 xl:px-16"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-c)", backdropFilter: "blur(12px)" }}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link href="/dashboard" className="shrink-0 flex items-center" aria-label="Нүүр хуудас">
          <img 
            src={logoSrc}
            alt="Sign Bridge" 
            className="h-13 w-13 rounded-xl object-contain" 
          />
          <div className="flex gap-1 items-baseline">
            <span style={{ color: "#ffbf00ff", fontWeight: 800, fontSize: "20px" }}>
              Sign
            </span>
            <span style={{ color: bridgeColor, fontWeight: 800, fontSize: "20px" }}>
              Bridge
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 rounded-full px-2 py-1.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}>
          {NAV.map(({ id, label, O, S }) => {
            const isActive = active === id;
            const Icon = isActive ? S : O;
            return (
              <Link key={id} href={`/dashboard/${id}`}
                className={cn("flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-200", isActive ? "text-white" : "hover:opacity-80")}
                style={isActive ? { background: "var(--olive)", color: "#0d1e35" } : { color: "var(--text-3)" }}>
                <Icon className="size-3.5" />{label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {/* <div className="relative">
          <button onClick={() => setShowNotif((s) => !s)} aria-label="Мэдэгдэл"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-[var(--surface-2)] active:scale-95"
            style={{ border: "1px solid var(--border-c)", background: showNotif ? "var(--surface-2)" : "var(--surface)", color: "var(--text-3)" }}>
            <BellIcon className="h-[18px] w-[18px]" />
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: "var(--olive)", color: "#0d1e35" }}>{NOTIF_COUNT}</span>
          </button>
          {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
        </div> */}
        <ThemeToggle />
        <AvatarMenu />
      </div>
    </header>
  );
};