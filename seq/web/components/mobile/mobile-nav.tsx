"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Hand, Mic, Video, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/overview", label: "Нүүр", icon: Home },
  { href: "/dashboard/translator", label: "Дохио→Дуу", icon: Hand },
  { href: "/dashboard/voice", label: "Дуу→Бичвэр", icon: Mic },
  { href: "/dashboard/call", label: "Видео", icon: Video },
  { href: "/dashboard/settings", label: "Тохиргоо", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <ul className="mx-auto flex max-w-md justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-5 transition-transform", active && "scale-110")}
                  aria-hidden
                />
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
