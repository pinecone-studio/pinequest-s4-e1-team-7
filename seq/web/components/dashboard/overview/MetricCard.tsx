import { Icon } from "@/components/ui/Icon";
import { DotMatrix } from "./DotMatrix";
import type { Stats } from "@/lib/types";

export function MetricCard({ stats }: { stats: Stats }) {
  return (
    <div className="db-card ov-metric">
      <div className="mleft">
        <div className="ov-mhead">
          <span className="ic"><Icon name="languages" size={22} /></span>
          <div>
            <span className="big">{stats.words}</span>
            <div className="ov-msub">хэлмэрчилсэн үг</div>
          </div>
        </div>
        <DotMatrix />
        <div className="ov-dotscale"><span>Өг</span><span>Өдөр</span><span>Орой</span></div>
      </div>
      <div className="ov-mside">
        <div className="ov-statbox" style={{ background: "var(--teal)" }}>
          <div className="top">
            <span className="l"><Icon name="hand" size={15} /> Дохио</span>
          </div>
          <div>
            <div className="v">{stats.sessions}</div>
            <div className="vs">Орчуулга</div>
          </div>
        </div>
        <div className="ov-statbox" style={{ background: "var(--teal-2)" }}>
          <div className="top">
            <span className="l"><Icon name="captions" size={15} /> Үг</span>
          </div>
          <div>
            <div className="v">{stats.words}</div>
            <div className="vs">Нийт</div>
          </div>
        </div>
      </div>
    </div>
  );
}
