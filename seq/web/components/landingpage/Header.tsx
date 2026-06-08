"use client";

import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#features", label: "Онцлог" },
  { href: "#how", label: "Апп ашиглах заавар" },
];

export const Header = () => {
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
    <nav className="lnav">
      <Link href="/" className="lnav-logo">
        <img 
          src={logoSrc}
          alt="Sign Bridge" 
          className="h-13 w-13 object-contain" 
        />
        <div className="flex gap-1 items-baseline ">
          <span style={{ color: "#ffbf00ff", fontWeight: 900, fontSize: "20px" }}>
            Sign
          </span>
          <span style={{ color: bridgeColor, fontWeight: 900, fontSize: "20px" }}>
            Bridge
          </span>
        </div>
      </Link>

      <div className="lnav-links">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </div>

      <div className="lnav-right">
        <ThemeToggle />

        <Show when="signed-out">
          <Link href="/?auth=login" className="db-pillbtn hidden sm:inline-flex">
            Нэвтрэх
          </Link>
          <Link href="/?auth=register" className="db-pillbtn green">
            <UserPlusIcon className="h-4 w-4" /> Бүртгүүлэх
          </Link>
        </Show>

        <Show when="signed-in">
          <Link href="/dashboard" className="db-pillbtn green">Эхлэх</Link>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
};