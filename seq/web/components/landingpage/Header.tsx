"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { HeaderUserMenu } from "./HeaderUserMenu";

export const Header = ({ landing }: { landing?: boolean } = {}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [thresh, setThresh]   = useState(300);

  const { scrollY } = useScroll();
  const wmarkOp = useTransform(scrollY, [thresh * 0.6, thresh], [0, 1]);

  useEffect(() => {
    setMounted(true);
    setThresh(window.innerHeight * 0.55);
  }, []);

  if (!mounted) return null;

  const logoSrc = landing ? "/images/logoShar.png" : (theme === "dark" ? "/images/logoShar.png" : "/images/logoBlue.png");

  return (
    <nav className="lnav overflow-visible">
      <m.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center bg-white/15"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <Link href="/" className="lnav-logo overflow-visible">
        <img src={logoSrc} alt="Sign Bridge" className="h-13 w-13 object-contain" />
        <m.div style={{ opacity: wmarkOp }} className="flex items-baseline gap-1">
          <span style={{ color: "#fff", fontWeight: 900, fontSize: "20px" }}>Sign</span>
          <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: "20px" }}>Bridge</span>
        </m.div>
      </Link>

      <div className="lnav-right">
        {!landing && <ThemeToggle />}
        {!user ? (
          <>
            <Link href="/auth/login" className="db-pillbtn hidden sm:inline-flex">Нэвтрэх</Link>
            <Link href="/auth/register" className="db-pillbtn green">Бүртгүүлэх</Link>
          </>
        ) : (
          <HeaderUserMenu />
        )}
      </div>
    </nav>
  );
};
