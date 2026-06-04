import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/lib/types";

const BARS = [60, 80, 45, 90, 55, 70, 40, 30];

export function VideoPromo({ onJoin }: { onJoin: (s: DashboardSection) => void }) {
  return (
    <Card title="Видео дуудлага" className="ov-promo">
      <div className="ov-promo-title">Шууд хэлмэрчлэх</div>
      <div className="avs">
        <div className="pa"><Icon name="user" size={24} /></div>
        <div className="pa"><Icon name="user" size={24} /></div>
        <button className="join" onClick={() => onJoin("call")}><Icon name="video" size={20} /> Нэгдэх</button>
      </div>
      <div className="bars">
        {BARS.map((h, i) => (
          <i key={i} style={{ height: `${h}%`, background: h < 45 ? "var(--border-2)" : "var(--olive-bright)" }} />
        ))}
      </div>
      <div className="lbl"><span>Холбогдсон</span><span>Хүлээгдэж буй</span></div>
    </Card>
  );
}
