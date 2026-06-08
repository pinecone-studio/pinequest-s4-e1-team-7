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
      <main className="flex-1 overflow-y-auto">
        <PageTransition>
          <div className="mx-auto max-w-[1380px] px-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:px-6 md:pb-12">
            {children}
          </div>
        </PageTransition>
      </main>
      <MobileNav />
    </div>
  );
}
