import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const POINTS = "0,52 34,40 68,46 102,28 136,34 170,18 204,30 240,20";

export function ActivityChart({ sessions }: { sessions: number }) {
  return (
    <Card title="Өдрийн идэвхжил" className="ov-line">
      <div className="top"><span className="num">{sessions}</span><span className="delta">+0.5%</span></div>
      <svg viewBox="0 0 240 70" preserveAspectRatio="none">
        <polyline fill="none" stroke="var(--olive)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" points={POINTS} />
        <circle cx={170} cy={18} r={5} fill="var(--olive)" />
      </svg>
      <div className="foot"><Icon name="info" size={13} /> Сүүлийн 7 хоног</div>
    </Card>
  );
}
