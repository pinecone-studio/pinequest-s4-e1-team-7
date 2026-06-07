"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { TopNav } from "@/components/dashboard/TopNav";
import { MobileNav } from "@/components/mobile/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="flex h-dvh flex-col">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1380px] px-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:px-6 md:pb-12">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
