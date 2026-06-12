

import { BellIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type StaticNotif = { id: string; title: string; body: string; time: string };

const STATIC: StaticNotif[] = [
  { id: "1", title: "Толь бичиг шинэчлэгдлээ", body: "Монгол дохионы хэлний 35 үсэг нэмэгдлээ.", time: "2 цаг өмнө" },
  { id: "2", title: "Видео дуудлага нэмэгдлээ", body: "Шууд дохио хэлмэрчлэлтэй видео дуудлага ашиглаарай.", time: "1 өдрийн өмнө" },
];

export const NOTIF_COUNT = STATIC.length;

export type ChatNotif = { messageId: number; peerName: string; body: string; href: string };

export const NotifPanel = ({ onClose, chatNotifs }: { onClose: () => void; chatNotifs: ChatNotif[] }) => {
  const total = chatNotifs.length + STATIC.length;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-c)", boxShadow: "var(--shadow)" }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-c)" }}>
          <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Мэдэгдэл</p>
          {total > 0 && (
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--olive-soft)", color: "var(--olive)" }}>
              {total} шинэ
            </span>
          )}
        </div>

        {chatNotifs.map((n) => (
          <Link
            key={n.messageId}
            href={n.href}
            onClick={onClose}
            className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderBottom: "1px solid var(--border-c)" }}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--olive-soft)" }}>
              <ChatBubbleLeftRightIcon className="h-4 w-4" style={{ color: "var(--olive)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{n.peerName}</p>
              <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-2)" }}>{n.body}</p>
            </div>
          </Link>
        ))}

        {STATIC.map((n, i) => (
          <div
            key={n.id}
            className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderBottom: i < STATIC.length - 1 ? "1px solid var(--border-c)" : undefined }}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--olive-soft)" }}>
              <BellIcon className="h-4 w-4" style={{ color: "var(--olive)" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{n.title}</p>
              <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-2)" }}>{n.body}</p>
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
};
