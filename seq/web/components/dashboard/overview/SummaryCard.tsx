import type { Stats } from "@/lib/types";

export function SummaryCard({ stats }: { stats: Stats }) {
  return (
    <div className="ov-summary">
      <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(238,244,240,0.6)", marginBottom: "4px" }}>
        Энэ сессийн дүн
      </div>
      <div style={{ fontSize: "17px", fontWeight: 700, color: "#eef4f0", marginBottom: "14px" }}>
        Хэлмэрчилсэн ажил
      </div>
      <div className="pill">
        <span className="lab">Орчуулга</span>
        <span className="num">{stats.sessions}</span>
      </div>
      <div className="mini">
        <div className="mb">
          <div className="l">Нийт үг</div>
          <div className="v">{stats.words}</div>
        </div>
        <div className="mb">
          <div className="l">Түүх</div>
          <div className="v">{stats.history.length}</div>
        </div>
      </div>
      <div className="total">
        <div className="l">Нийт хэлмэрчилсэн үг</div>
        <div className="big">{stats.words}</div>
      </div>
    </div>
  );
}
