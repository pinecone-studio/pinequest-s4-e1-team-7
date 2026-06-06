import { randomBytes } from "crypto";
import Link from "next/link";
import { Video } from "lucide-react";

export const dynamic = "force-dynamic";

export function VideoCall() {
  const roomId = randomBytes(2).toString("hex");

  return (
    <section className="db-section">
      <div className="db-headrow">
        <div>
          <div className="db-crumb"><b>Портал</b> › Видео дуудлага</div>
          <h1 className="db-h">Видео дуудлага</h1>
          <p className="db-sub">Дохионы хэлийг бодит цагт хэлмэрчлэн видео дуудлага хийнэ.</p>
        </div>
      </div>

      <div style={{ maxWidth: "480px" }}>
        <Link
          href={`/call/${roomId}`}
          className="db-card flex flex-col items-center gap-4 py-10 text-center transition hover:border-primary/40 hover:shadow-md"
        >
          <span
            className="grid size-16 place-items-center rounded-2xl"
            style={{ background: "var(--olive-soft)", color: "var(--olive)" }}
          >
            <Video size={32} />
          </span>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Шинэ дуудлага эхлүүлэх
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
              Өрөөний дугаар: <code style={{ color: "var(--olive)" }}>{roomId}</code>
            </p>
          </div>
          <span
            className="rounded-full px-5 py-2 text-sm font-bold text-white"
            style={{ background: "var(--olive)" }}
          >
            Нэгдэх
          </span>
        </Link>
      </div>
    </section>
  );
}
