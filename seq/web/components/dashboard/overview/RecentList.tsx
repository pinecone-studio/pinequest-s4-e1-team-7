import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { HistoryItem } from "@/lib/types";

export function RecentList({ items }: { items: HistoryItem[] }) {
  return (
    <Card title="Сүүлийн үйлдлүүд">
      {items.length === 0 ? (
        <div className="ov-rail-empty">Одоогоор үйлдэл алга. Хэрэгслүүдээ туршаад үзээрэй.</div>
      ) : (
        <div className="ov-list">
          {items.map((h, i) => (
            <div className="ri" key={i}>
              <div className={`av ${h.kind}`}>
                <Icon name={h.kind === "sign" ? "hand" : "captions"} size={18} />
              </div>
              <div className="info">
                <div className="t">{h.text}</div>
                <div className="s">{h.time}</div>
              </div>
              <div className={`bdg ${h.kind === "sign" ? "green" : "teal"}`}>
                {h.kind === "sign" ? "Дохио" : "Дуу"}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
