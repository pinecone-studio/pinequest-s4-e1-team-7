import { Card } from "@/components/ui/Card";
import type { Stats } from "@/lib/types";

const LEGEND = [
  { color: "var(--olive)", name: "Дохио → Дуу" },
  { color: "var(--teal)", name: "Дуу → Бичвэр" },
  { color: "var(--border-2)", name: "Видео дуудлага" },
];

export function TypeGauge({ stats }: { stats: Stats }) {
  return (
    <Card title="Орчуулгын төрөл" className="ov-gauge">
      <div className="gwrap">
        <svg viewBox="0 0 170 100">
          <path d="M15 95 A70 70 0 0 1 85 25" fill="none" stroke="var(--olive)" strokeWidth={16} strokeLinecap="round" />
          <path d="M85 25 A70 70 0 0 1 140 52" fill="none" stroke="var(--teal)" strokeWidth={16} strokeLinecap="round" />
          <path d="M140 52 A70 70 0 0 1 155 95" fill="none" stroke="var(--surface-2)" strokeWidth={16} strokeLinecap="round" />
        </svg>
        <div className="gnum">
          <div className="n">{stats.sessions}</div>
          <div className="t">Нийт орчуулга</div>
        </div>
      </div>
      <div className="ov-legend">
        {LEGEND.map((l) => (
          <div className="ov-leg" key={l.name}>
            <span className="d" style={{ background: l.color }} />
            <span className="nm">{l.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
