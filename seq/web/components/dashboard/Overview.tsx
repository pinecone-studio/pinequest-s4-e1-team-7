"use client";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { greeting } from "@/lib/utils";
import { ProfileCard } from "./overview/ProfileCard";
import { MetricCard } from "./overview/MetricCard";
import { ActivityChart } from "./overview/ActivityChart";
import { TypeGauge } from "./overview/TypeGauge";
import { VideoPromo } from "./overview/VideoPromo";
import { RecentList } from "./overview/RecentList";
import { SummaryCard } from "./overview/SummaryCard";
import type { DashboardSection } from "@/lib/types";

export function Overview({ onGo }: { onGo: (s: DashboardSection) => void }) {
  const { user, stats } = useApp();
  const name = user?.name ?? "Хэрэглэгч";

  return (
    <section className="db-section">
      <div className="db-headrow">
        <div>
          <div className="db-crumb"><b>Портал</b> › Хяналтын самбар</div>
          <h1 className="db-h">{greeting(name)}</h1>
        </div>
        <div className="db-actions">
          <Button variant="ghost"><Icon name="calendar" size={16} /> Энэ долоо хоног</Button>
          <Button onClick={() => onGo("translator")}><Icon name="plus" size={16} /> Шинэ орчуулга</Button>
        </div>
      </div>

      <div className="ov-grid">
        <div className="ov-left">
          <div className="ov-row1">
            <ProfileCard name={name} onGo={onGo} />
            <MetricCard words={stats.words} />
          </div>
          <div className="ov-row2">
            <ActivityChart sessions={stats.sessions} />
            <TypeGauge total={stats.sessions} />
            <VideoPromo onJoin={onGo} />
          </div>
        </div>
        <div className="ov-rail">
          <RecentList items={stats.history.slice(0, 5)} />
          <SummaryCard stats={stats} />
        </div>
      </div>
    </section>
  );
}
