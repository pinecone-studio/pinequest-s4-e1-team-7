"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Show, UserButton } from "@clerk/nextjs";
import Switch from "./DarkLightButton";

const LINKS = [
  { href: "#features", label: "Онцлог" },
  { href: "#how", label: "Апп ашиглах заавар" },
];

export const Header = () => (
  <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 px-4 py-4 backdrop-blur md:px-8">
    <Link
      href="#top"
      className="flex items-center font-display text-xl font-bold"
    >
      <img src="/zurag.png" width={47} height={47} />
      Sing Bridge
    </Link>

    <div className="hidden gap-1 md:flex">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {l.label}
        </a>
      ))}
    </div>

    <div className="flex items-center gap-2.5">
      <Switch />

      <Show when="signed-out">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link href="/auth/login" className="text-md">
            Нэвтрэх
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/register">
            <UserPlus className="size-4" /> Бүртгүүлэх
          </Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard" className="text-md">
            Эхлэх
          </Link>
        </Button>
        <UserButton />
      </Show>
    </div>
  </nav>
);
