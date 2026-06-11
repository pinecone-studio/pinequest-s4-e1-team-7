"use client";
import { LogoLoader } from "./LogoLoader";

export function DashboardSkeleton() {
  return (
    <div className="flex h-dvh flex-col" style={{ background: "var(--bg)" }}>
      {/* TopNav placeholder */}
      <div
        className="hidden h-[72px] shrink-0 md:block"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-c)" }}
      />
      <div className="flex flex-1 items-center justify-center">
        <LogoLoader size="lg" />
      </div>
    </div>
  );
}
