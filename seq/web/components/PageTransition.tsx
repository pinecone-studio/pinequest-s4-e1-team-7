"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} style={{ animation: "page-slide 0.22s var(--ease) both" }}>
      {children}
    </div>
  );
}
