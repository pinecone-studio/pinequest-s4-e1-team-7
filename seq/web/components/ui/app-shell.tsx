import type { ReactNode } from "react";
import { MobileNav } from "../mobile/mobile-nav";
;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-24">
      {children}
      <MobileNav />
    </div>
  );
}
