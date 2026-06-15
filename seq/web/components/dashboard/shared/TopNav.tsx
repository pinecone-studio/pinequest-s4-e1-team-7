"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";
import { ProfileAvatarButton } from "../shared/ProfileAvatarButton";
import { NotificationBell } from "../shared/NotificationBell";
import {
  HomeIcon as HomeO,
  HandRaisedIcon as HandO,
  MicrophoneIcon as MicO,
  ChatBubbleLeftRightIcon as ChatO,
  BookOpenIcon as BookO,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeS,
  HandRaisedIcon as HandS,
  MicrophoneIcon as MicS,
  ChatBubbleLeftRightIcon as ChatS,
  BookOpenIcon as BookS,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "overview", label: "Нүүр", O: HomeO, S: HomeS },
  { id: "translator", label: "Дохио", O: HandO, S: HandS },
  { id: "voice", label: "Яриа", O: MicO, S: MicS },
  { id: "call", label: "Чат", O: ChatO, S: ChatS },
  { id: "dict", label: "Толь", O: BookO, S: BookS },
] as const;

export const TopNav = () => {
  const pathname = usePathname();
  const chatOnly = pathname.startsWith("/accessible");
  const active = chatOnly ? "call" : (pathname.split("/")[2] ?? "overview");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <header
      className="sticky top-0 z-40 hidden items-center justify-between gap-3 px-4 py-4 md:flex md:px-6 lg:px-10 xl:px-16"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border-c)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: logo + nav tabs */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link
          href={chatOnly ? "/accessible/chat" : "/dashboard/overview"}
          className="flex shrink-0 items-center"
          aria-label="Нүүр хуудас"
        >
          <img
            src={logoSrc}
            alt="Sign Bridge"
            className="h-13 w-13 rounded-xl object-contain"
          />
          <div className="flex items-baseline gap-1">
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
        </Link>

        <nav
          aria-label="Хяналтын самбар цэс"
          className="flex items-center gap-1 rounded-full px-2 py-1.5"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-c)",
          }}
        >
          {NAV.map(({ id, label, O, S }) => {
            const isActive = active === id;
            const disabled = chatOnly && id !== "call";
            const href = id === "call" && chatOnly ? "/accessible/chat" : `/dashboard/${id}`;
            const Icon = isActive ? S : O;

            const inner = (
              <>
                <Icon className="size-3.5" />
                {label}
              </>
            );

            if (disabled) {
              return (
                <span
                  key={id}
                  aria-disabled="true"
                  aria-label={`${label} — харааны бэрхшээлтэй горимд идэвхгүй`}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold opacity-35 pointer-events-none select-none"
                  style={{ color: "var(--text-3)" }}
                >
                  {inner}
                </span>
              );
            }

            return (
              <Link
                key={id}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--olive)]",
                  !isActive && "hover:bg-[var(--glass-btn)] hover:-translate-y-px active:scale-95",
                  isActive && "active:scale-[0.97]",
                )}
                style={
                  isActive
                    ? { background: "var(--olive)", color: "#0d1e35" }
                    : { color: "var(--text-3)" }
                }
              >
                {inner}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: theme toggle + notification bell + avatar */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <ProfileAvatarButton size={40} />
      </div>
    </header>
  );
};
