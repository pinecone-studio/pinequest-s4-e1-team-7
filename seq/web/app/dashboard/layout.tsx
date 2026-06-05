"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { TopNav } from "@/components/dashboard/TopNav";

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
        <div className="mx-auto max-w-[1380px] px-4 pb-12 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
