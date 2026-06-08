import type { ReactNode } from "react";

export function SectionHeader({
  crumb,
  title,
  subtitle,
  action,
}: {
  crumb: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="db-headrow">
      <div>
        <div className="db-crumb"><b>Нүүр</b> › {crumb}</div>
        <h1 className="db-h">{title}</h1>
        <p className="db-sub db-sub-tight">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
