"use client";
import { useRouter } from "next/navigation";
import { Overview } from "@/components/dashboard/Overview";
import type { DashboardSection } from "@/lib/types";

export default function OverviewPage() {
  const router = useRouter();
  const go = (s: DashboardSection) => router.push(`/dashboard/${s}`);
  return <Overview onGo={go} />;
}
