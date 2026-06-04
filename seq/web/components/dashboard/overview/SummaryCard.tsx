import type { Stats } from "@/lib/types";

export function SummaryCard({ stats }: { stats: Stats }) {
  return (
    <div className="ov-summary">
      <div className="ov-sum-label">Өнөөдрийн дүн</div>
      <div className="ov-sum-title">Хэлмэрчилсэн ажил</div>
      <div className="pill"><span className="lab">Нарийвчлал</span><span className="num">98%</span></div>
      <div className="mini">
        <div className="mb"><div className="l">Орчуулга</div><div className="v">{stats.sessions}</div></div>
        <div className="mb"><div className="l">Дундаж саатал</div><div className="v">0.3с</div></div>
      </div>
      <div className="total">
        <div className="l">Нийт хэлмэрчилсэн үг</div>
        <div className="big">{stats.words}</div>
      </div>
    </div>
  );
}
