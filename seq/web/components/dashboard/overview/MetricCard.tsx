import { Icon } from "@/components/ui/Icon";
import { DotMatrix } from "./DotMatrix";

const STATS = [
  { label: "Дохио", value: "80%", sub: "Дохио → Дуу", bg: "var(--teal)" },
  { label: "Бичвэр", value: "20%", sub: "Дуу → Бичвэр", bg: "var(--teal-2)" },
];

export function MetricCard({ words }: { words: number }) {
  return (
    <div className="db-card ov-metric">
      <div className="mleft">
        <div className="ov-mhead">
          <span className="ic"><Icon name="languages" size={22} /></span>
          <div>
            <div className="ov-mtop"><span className="big">{words}</span><span className="delta">+0.5%</span></div>
            <div className="ov-msub">хэлмэрчилсэн үг</div>
          </div>
        </div>
        <DotMatrix />
        <div className="ov-dotscale"><span>Өг</span><span>Өдөр</span><span>Орой</span></div>
      </div>
      <div className="ov-mside">
        {STATS.map((s) => (
          <div className="ov-statbox" key={s.label} style={{ background: s.bg }}>
            <div className="top">
              <span className="l"><Icon name="hand" size={15} /> {s.label}</span>
              <span className="dl"><Icon name="arrow-up" size={13} /> 2.6%</span>
            </div>
            <div><div className="v">{s.value}</div><div className="vs">{s.sub}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
