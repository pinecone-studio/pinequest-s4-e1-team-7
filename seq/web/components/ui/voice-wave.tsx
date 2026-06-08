import type { CSSProperties } from "react";

const BAR_HEIGHTS = [10, 18, 26, 20, 30, 14, 24, 32, 16, 22, 28, 12, 20, 30, 18, 24, 14, 26, 20, 16];

export function VoiceWave({ active, color = "var(--olive)" }: { active: boolean; color?: string }) {
  return (
    <div className="flex h-9 items-end justify-center gap-[3px]">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full transition-all duration-300"
          style={{
            height: active ? undefined : "4px",
            background: active ? color : "var(--border-c)",
            "--wh": `${h}px`,
            animation: active ? `wave ${0.6 + (i % 5) * 0.15}s ease-in-out infinite` : "none",
            animationDelay: active ? `${(i * 0.06).toFixed(2)}s` : "0s",
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
