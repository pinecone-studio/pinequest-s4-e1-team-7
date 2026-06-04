import { Card } from "@/components/ui/Card";

const LEGEND = [
  { color: "var(--olive)", name: "Дохио → Дуу", value: "58%" },
  { color: "var(--teal)", name: "Дуу → Бичвэр", value: "30%" },
  { color: "var(--border-2)", name: "Видео дуудлага", value: "12%" },
];

export function TypeGauge({ total }: { total: number }) {
  return (
    <Card title="Орчуулгын төрөл" className="ov-gauge">
      <div className="gwrap">
        <svg viewBox="0 0 170 100">
          <path d="M15 95 A70 70 0 0 1 85 25" fill="none" stroke="var(--olive)" strokeWidth={16} strokeLinecap="round" />
          <path d="M85 25 A70 70 0 0 1 140 52" fill="none" stroke="var(--teal)" strokeWidth={16} strokeLinecap="round" />
          <path d="M140 52 A70 70 0 0 1 155 95" fill="none" stroke="var(--surface-2)" strokeWidth={16} strokeLinecap="round" />
        </svg>
        <div className="gnum"><div className="n">{total}</div><div className="t">Нийт орчуулга</div></div>
      </div>
      <div className="ov-legend">
        {LEGEND.map((l) => (
          <div className="ov-leg" key={l.name}>
            <span className="d" style={{ background: l.color }} />
            <span className="nm">{l.name}</span>
            <span className="v">{l.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
