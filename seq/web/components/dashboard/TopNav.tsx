"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Hand, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NAV_ITEMS } from "@/lib/constants";
import { AvatarMenu } from "./AvatarMenu";

export const TopNav = () => {
  const pathname = usePathname();
  const active = pathname.split("/")[2] ?? "overview";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link href="/">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Hand className="size-5" />
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border bg-card p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              size="sm"
              variant={active === id ? "default" : "ghost"}
              className="shrink-0 rounded-full"
              asChild
            >
              <Link href={`/dashboard/${id}`}>
                <Icon className="size-4" /> {label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="relative hidden lg:block">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Хайх…" className="w-44 rounded-full pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Bell />
        </Button>
        <ThemeToggle />
        <AvatarMenu />
      </div>
    </header>
  );
};
