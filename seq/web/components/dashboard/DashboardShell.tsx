"use client";
import { useState } from "react";
import { TopNav } from "./TopNav";
import { Overview } from "./Overview";
import { Translator } from "./Translator";
import { VoiceToText } from "./VoiceToText";
import { VideoCall } from "./VideoCall";
import { Dictionary } from "./Dictionary";
import { Settings } from "./Settings";
import type { DashboardSection } from "@/lib/types";

export function DashboardShell() {
  const [section, setSection] = useState<DashboardSection>("overview");

  const views: Record<DashboardSection, React.ReactNode> = {
    overview: <Overview onGo={setSection} />,
    translator: <Translator />,
    voice: <VoiceToText />,
    call: <VideoCall />,
    dict: <Dictionary />,
    settings: <Settings />,
  };

  return (
    <div className="dbx">
      <TopNav active={section} onSelect={setSection} />
      <main className="dbmain">
        <div className="db-content">{views[section]}</div>
      </main>
    </div>
  );
}
