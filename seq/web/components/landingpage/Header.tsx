"use client";

import Link from "next/link";
import { Hand, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Show, UserButton } from "@clerk/nextjs";
import Switch from "./DarkLightButton";

const NAV_LINKS = [
  { href: "#features", label: "Онцлог" },
  { href: "#how", label: "Апп ашиглах заавар" },
];

export const Header = () => (
  <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-8">
    <Link
      href="/"
      className="flex"
    >
      <span className="size-12 place-items-center rounded-xl bg-transparent">
        <img src="/images/logo.png" alt="sign bridge logo image" sizes="20" />
      </span>
    </Link>

    <div className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-full px-4 py-2 text-md font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
          <Link href="/auth/login" className="text-md">Нэвтрэх</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/auth/register">
            <UserPlus className="size-4" /> Бүртгүүлэх
          </Link>
        </Button>
      </Show>

      <Show when="signed-in">
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard" className="text-md">Эхлэх</Link>
        </Button>
        <UserButton />
      </Show>
    </div>
  </nav>
);
