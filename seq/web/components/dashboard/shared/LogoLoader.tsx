"use client";
import { useEffect, useState } from "react";

export function LogoLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true });
    return () => obs.disconnect();
  }, []);

  const img = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const text = size === "lg" ? 26 : size === "sm" ? 16 : 20;

  return (
    <div className="flex flex-col items-center gap-3">
      {mounted ? (
        <img
          src={isDark ? "/images/logoShar.png" : "/images/logoBlue.png"}
          alt="Sign Bridge"
          className={`${img} rounded-xl object-contain`}
        />
      ) : (
        <div className={`${img} animate-pulse rounded-xl`} style={{ background: "var(--surface-2)" }} />
      )}
      <div className="flex items-baseline gap-1">
        <span style={{ color: "#ffbf00", fontWeight: 900, fontSize: text }}>Sign</span>
        <span style={{ color: "var(--text)", fontWeight: 900, fontSize: text }}>Bridge</span>
      </div>
      <div className="flex gap-1.5 pt-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ background: "var(--olive)", animationDelay: `${i * 0.15}s`, display: "block" }}
          />
        ))}
      </div>
    </div>
  );
}
