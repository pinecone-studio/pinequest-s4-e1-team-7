import { BellIcon } from "@heroicons/react/24/outline";

export type Notification = { id: string; title: string; body: string; time: string };

const NOTIFS: Notification[] = [
  { id: "1", title: "Толь бичиг шинэчлэгдлээ", body: "Монгол дохионы хэлний 35 үсэг нэмэгдлээ.", time: "2 цаг өмнө" },
  { id: "2", title: "Видео дуудлага нэмэгдлээ", body: "Шууд дохио хэлмэрчлэлтэй видео дуудлага ашиглаарай.", time: "1 өдрийн өмнө" },
];

export const NOTIF_COUNT = NOTIFS.length;

export function NotifPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-c)", boxShadow: "var(--shadow)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Мэдэгдэл</p>
          <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--olive-soft)", color: "var(--olive)" }}>
            {NOTIFS.length} шинэ
          </span>
        </div>
        {NOTIFS.map((n, i) => (
          <div key={n.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderBottom: i < NOTIFS.length - 1 ? "1px solid var(--border-c)" : undefined }}>
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--olive-soft)" }}>
              <BellIcon className="h-4 w-4" style={{ color: "var(--olive)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--text)" }}>{n.title}</p>
              <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--text-2)" }}>{n.body}</p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--text-3)" }}>{n.time}</p>
            </div>
          </div>
        ))}
        <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid var(--border-c)" }}>
          <button onClick={onClose} className="text-[12px] font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--olive)" }}>
            Бүгдийг харсан гэж тэмдэглэх
          </button>
        </div>
      </div>
    </>
  );
}
