"use client";

import Link from "next/link";
import { ArrowRight, Hand, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Switch from "./DarkLightButton";
import { Show, UserButton } from "@clerk/nextjs";

const LINKS = [
  { href: "#features", label: "Боломжууд" },
  { href: "#how", label: "Хэрхэн ажилладаг" },
];

export const Header = () => (
  <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 px-4 py-4 backdrop-blur md:px-8">
    <Link
      href="#top"
      className="flex items-center gap-3 font-display text-xl font-bold"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Hand className="size-5" />
      </span>
      Sign-Bridge
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
      <ThemeToggle />
      <Switch />

      <Show when="signed-out">
        <Button asChild variant="outline" size="sm">
          <Link href="/auth/login">Нэвтрэх</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/register">
            <UserPlus className="size-4" /> Бүртгүүлэх
          </Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild size="sm">
          <Link href="/dashboard">
            Эхлэх <ArrowRight className="size-4" />
          </Link>
        </Button>
        <UserButton />
      </Show>
    </div>
  </nav>
);
