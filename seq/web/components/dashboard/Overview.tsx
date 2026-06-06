"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { greeting } from "@/lib/utils";
import { ProfileCard } from "./overview/ProfileCard";
import { MetricCard } from "./overview/MetricCard";
import { ActivityChart } from "./overview/ActivityChart";
import { TypeGauge } from "./overview/TypeGauge";
import { VideoPromo } from "./overview/VideoPromo";
import { RecentList } from "./overview/RecentList";
import { SummaryCard } from "./overview/SummaryCard";

export function Overview() {
  const { user } = useUser();
  const { stats } = useApp();
  const name = user?.firstName ?? "Хэрэглэгч";

  return (
    <section className="db-section">
      <div className="db-headrow">
        <div>
          <div className="db-crumb"><b>Портал</b> › Хяналтын самбар</div>
          <h1 className="db-h">{greeting(name)}</h1>
        </div>
        <div className="db-actions">
          <Button asChild>
            <Link href="/dashboard/translator">
              <Plus className="size-4" /> Шинэ орчуулга
            </Link>
          </Button>
        </div>
      </div>

      <div className="ov-grid">
        <div className="ov-left">
          <div className="ov-row1">
            <ProfileCard name={name} />
            <MetricCard stats={stats} />
          </div>
          <div className="ov-row2">
            <ActivityChart sessions={stats.sessions} />
            <TypeGauge stats={stats} />
            <VideoPromo />
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
