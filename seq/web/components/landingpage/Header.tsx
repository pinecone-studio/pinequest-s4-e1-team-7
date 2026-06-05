"use client"
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import Switch from "./DarkLightButton";
import { User } from "lucide-react";

export const Header = () => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark = saved === "dark";
    if (checkboxRef.current) checkboxRef.current.checked = isDark;
    document.documentElement.setAttribute("data-theme", saved || "light");
  }, []);

  useEffect(() => {
    const checkbox = document.getElementById("input") as HTMLInputElement;
    if (!checkbox) return;

    const handleChange = () => {
      const next = checkbox.checked ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    };

    checkbox.addEventListener("change", handleChange);
    return () => checkbox.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .lnav-links { display: none !important; }
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
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="lnav-right">
          <Switch />
          <Link href="/dashboard">
            <button className="db-pillbtn green sm">
              <User style={{ marginRight: "4px" }} />
              Эхлэх
            </button>
          </Link>
        </div>
      </header>
    </>
  );
};