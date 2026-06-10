"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { TopNav } from "@/components/dashboard/TopNav";
import { MobileNav } from "@/components/mobile/mobile-nav";
import { PageTransition } from "@/components/PageTransition";
import { releaseAllCameras } from "@/lib/camera-registry";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    return () => releaseAllCameras();
  }, [pathname]);

  if (loading) return <DashboardSkeleton />;
  if (!user) return null;

  const inChatThread = pathname.startsWith("/dashboard/call/");

  return (
    <div className="flex h-dvh flex-col">
      <TopNav />
      <main className="flex-1 min-h-0 overflow-hidden">
        <PageTransition>
          <div className="h-full">{children}</div>
        </PageTransition>
      </main>
      {!inChatThread && <MobileNav />}
    </div>
  );
}
