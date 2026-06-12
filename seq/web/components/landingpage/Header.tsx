"use client";

import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useAppMode } from "@/context/AppModeContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#features", label: "Онцлог" },
  { href: "#how", label: "Апп ашиглах заавар" },
];

export const Header = () => {
  const { user } = useAuth();
  const { homePath } = useAppMode();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <nav className="lnav">
      <Link href="/" className="lnav-logo">
        <img src={logoSrc} alt="Sign Bridge" className="h-13 w-13 object-contain" />
        <div className="flex items-baseline gap-1">
          <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: "20px" }}>Sign</span>
          <span style={{ color: "var(--text)", fontWeight: 900, fontSize: "20px" }}>Bridge</span>
        </div>
      </Link>

      <nav className="lnav-links" aria-label="Үндсэн цэс">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>

      <div className="lnav-right">
        <ThemeToggle />
        <Link
          href={user ? "/accessible/chat" : "/auth/login?next=/accessible/chat"}
          className="db-pillbtn hidden sm:inline-flex"
          style={{ borderColor: "#ffbf00", color: "var(--text)" }}
        >
          Харааны бэрхшээлтэй
        </Link>
        {!user ? (
          <>
            <Link href="/auth/login" className="db-pillbtn hidden sm:inline-flex">Нэвтрэх</Link>
            <Link href="/auth/register" className="db-pillbtn green">
              <UserPlusIcon className="h-4 w-4" /> Бүртгүүлэх
            </Link>
          </>
        ) : (
          <Link href={homePath} className="db-pillbtn green">Эхлэх</Link>
        )}
      </div>
    </nav>
  );
};
