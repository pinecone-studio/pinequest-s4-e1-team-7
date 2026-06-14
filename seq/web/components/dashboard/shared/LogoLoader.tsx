"use client";
import { useTheme } from "@/hooks/useTheme";

export function LogoLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { theme } = useTheme();

  const img = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const text = size === "lg" ? 26 : size === "sm" ? 16 : 20;
  const logoSrc = theme === "dark" ? "/images/logoShar.png" : "/images/logoBlue.png";

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={logoSrc}
        alt="Sign Bridge"
        className={`${img} rounded-xl object-contain`}
      />
      <div className="flex items-baseline gap-1">
        <span style={{ color: "var(--olive)", fontWeight: 900, fontSize: text }}>Sign</span>
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
