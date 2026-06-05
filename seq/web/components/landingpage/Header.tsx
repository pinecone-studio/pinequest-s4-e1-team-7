"use client";

import Link from "next/link";
import { Logo } from "../Logo";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .lnav-links {
            display: none !important;
          }
        }
      `}</style>

      <header className="lnav" style={{ padding: "clamp(12px, 4vw, 16px) clamp(16px, 5vw, 32px)", gap: "clamp(12px, 3vw, 18px)" }}>
        <div className="lnav-logo" style={{ fontSize: "clamp(16px, 4vw, 21px)", gap: "clamp(8px, 2vw, 11px)" }}>
          <div className="m" style={{ width: "clamp(36px, 8vw, 40px)", height: "clamp(36px, 8vw, 40px)" }}>
            <Logo />
          </div>
          ДОХИО
        </div>
        <nav className="lnav-links">
          {[
            { label: "Боломжууд", href: "#features" },
            { label: "Хэрхэн ажилладаг", href: "#how-it-works" },
          ].map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="lnav-right">
          <button className="lnav-theme" onClick={toggleTheme} aria-label="Toggle theme" style={{ width: "clamp(40px, 10vw, 42px)", height: "clamp(40px, 10vw, 42px)" }}>
            {theme === "light" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          <Link href="/dashboard">
            <button className="db-pillbtn green lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Бүртгүүлэх
            </button>
          </Link>
        </div>
      </header>
    </>
  );
};