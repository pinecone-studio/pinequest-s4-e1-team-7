"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TopNav } from "@/components/dashboard/shared/TopNav";
import { MobileNav } from "@/components/mobile/mobile-nav";
import { PageTransition } from "@/components/PageTransition";
import { DashboardSkeleton } from "@/components/dashboard/shared/DashboardSkeleton";
import { a11yStopSpeak } from "@/lib/a11y-speak";

export default function AccessibleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?next=/accessible/chat");
    return () => a11yStopSpeak();
  }, [loading, user, router]);

  if (loading) return <DashboardSkeleton />;
  if (!user) return null;

  return (
    <div className="flex h-dvh flex-col" data-accessible-mode>
      <TopNav />
      <main className="min-h-0 flex-1 overflow-hidden">
        <PageTransition>
          <div className="h-full">{children}</div>
        </PageTransition>
      </main>
      <MobileNav />
    </div>
  );
}
