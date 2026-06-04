"use client";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/constants";
import { cx } from "@/lib/utils";
import { AvatarMenu } from "./AvatarMenu";
import type { DashboardSection } from "@/lib/types";

interface Props {
  active: DashboardSection;
  onSelect: (s: DashboardSection) => void;
}

export function TopNav({ active, onSelect }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <header className="dbnav">
      <div className="dbnav-l">
        <div className="dbnav-logo"><Icon name="hand" size={22} /></div>
        <nav className="dbtabs">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={cx("dbtab", active === item.id && "active")}
              onClick={() => onSelect(item.id)}
            >
              <Icon name={item.icon} size={17} /> {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="dbnav-r">
        <div className="dbsearch"><Icon name="search" size={17} /><input placeholder="Хайх…" /></div>
        <button className="dbic"><Icon name="bell" size={19} /><span className="badge" /></button>
        <button className="dbic" onClick={toggle}><Icon name={theme === "dark" ? "moon" : "sun"} size={19} /></button>
        <AvatarMenu onSettings={() => onSelect("settings")} />
      </div>
    </header>
  );
}
