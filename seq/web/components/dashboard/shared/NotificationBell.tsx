"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { NotifPanel, type ChatNotif } from "./NotifPanel";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [chatNotifs, setChatNotifs] = useState<ChatNotif[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const onNotif = (e: Event) => {
      const detail = (e as CustomEvent<ChatNotif>).detail;
      setChatNotifs((prev) => [detail, ...prev].slice(0, 20));
      setUnread((n) => n + 1);
    };
    window.addEventListener("sb-chat-notif", onNotif);
    return () => window.removeEventListener("sb-chat-notif", onNotif);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Мэдэгдэл"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
        style={{ border: "1px solid var(--border-c)", background: "var(--surface)", color: "var(--text)" }}
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span
            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: "var(--olive)", color: "#0d1e35" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && <NotifPanel chatNotifs={chatNotifs} onClose={() => setOpen(false)} />}

    </div>
  );
};
