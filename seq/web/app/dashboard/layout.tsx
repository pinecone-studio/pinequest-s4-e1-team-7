"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { TopNav } from "@/components/dashboard/TopNav";
import { MobileNav } from "@/components/mobile/mobile-nav";
import { PageTransition } from "@/components/PageTransition";
import { releaseAllCameras } from "@/lib/camera-registry";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    return () => releaseAllCameras();
  }, [pathname]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="flex h-dvh flex-col">
      <TopNav />
      <main className="flex-1 min-h-0 overflow-hidden">
        <PageTransition>
          <div className="h-full">
            {children}
          </div>
        </PageTransition>
      </main>
      <MobileNav />
    </div>
  );
}
