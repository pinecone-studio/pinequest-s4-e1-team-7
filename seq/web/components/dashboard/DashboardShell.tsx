"use client";
import { usePathname, useRouter } from "next/navigation";
import { Overview } from "./Overview";
import { Translator } from "./Translator";
import { VoiceToText } from "./VoiceToText";
import { VideoCall } from "./VideoCall";
import { Dictionary } from "./Dictionary";
import { Settings } from "./Settings";
import type { DashboardSection } from "@/lib/types";

export const DashboardShell = () => {
  const pathname = usePathname();
  const router = useRouter();
  const section = (pathname.split("/")[2] ?? "overview") as DashboardSection;
  const go = (s: DashboardSection) => router.push(`/dashboard/${s}`);

  const views: Record<DashboardSection, React.ReactNode> = {
    overview: <Overview onGo={go} />,
    translator: <Translator />,
    voice: <VoiceToText />,
    call: <VideoCall />,
    dict: <Dictionary />,
    settings: <Settings />,
  };

  return <>{views[section]}</>;
};
