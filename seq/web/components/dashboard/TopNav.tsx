"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Hand, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NAV_ITEMS, DICT_CATEGORIES } from "@/lib/constants";
import { AvatarMenu } from "./AvatarMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopNav = () => {
  const pathname = usePathname();
  const active = pathname.split("/")[2] ?? "overview";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href="/dashboard/overview" className="shrink-0">
          <img
            src="/images/logo.png"
            alt="logo"
            className="size-14 rounded-xl object-contain"
          />
        </Link>

        {/* Desktop nav — hidden on mobile (bottom nav handles navigation there) */}
        <nav className="hidden items-center gap-1 overflow-x-auto rounded-full border bg-card px-2 py-1.5 md:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.filter((item) => item.id !== "dict").map(
            ({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={active === id ? "default" : "ghost"}
                className="h-9 shrink-0"
                asChild
              >
                <Link href={`/dashboard/${id}`}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            ),
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active === "dict" ? "default" : "ghost"}
                className="h-9 shrink-0"
              >
                <Hand className="size-4" />
                Толь бичиг
                <ChevronDown className="ml-0.5 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {DICT_CATEGORIES.map((cat) => (
                <DropdownMenuItem key={cat.id} asChild>
                  <Link
                    href={`/dashboard/dict?cat=${cat.id}`}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="font-semibold">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.sub}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Desktop-only: search + bell + avatar */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Хайх…" className="w-48 rounded-full pl-10" />
        </div>
        <Button variant="outline" size="icon" className="hidden md:inline-flex">
          <Bell />
        </Button>
        {/* Always visible: theme toggle */}
        <ThemeToggle />
        <div className="hidden md:block">
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
};
