"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Нүүр", icon: Home },
  { href: "/history", label: "Түүх", icon: History },
  { href: "/settings", label: "Тохиргоо", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
