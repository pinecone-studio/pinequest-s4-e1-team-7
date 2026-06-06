import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export function VideoPromo() {
  return (
    <Card title="Видео дуудлага" className="ov-promo">
      <p className="text-sm" style={{ color: "var(--text-2)", marginBottom: "12px" }}>
        Шууд хэлмэрчлэх
      </p>
      <div className="avs">
        <div className="pa"><Icon name="user" size={24} /></div>
        <div className="pa"><Icon name="user" size={24} /></div>
        <Link href="/dashboard/call" className="join">
          <Icon name="video" size={20} /> Нэгдэх
        </Link>
      </div>
    </Card>
  );
}
