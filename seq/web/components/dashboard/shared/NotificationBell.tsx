"use client";

import { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { NotifPanel, NOTIF_COUNT } from "./NotifPanel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setSeen(true);
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
        {!seen && NOTIF_COUNT > 0 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-[8px] w-[8px] items-center justify-center rounded-full"
            style={{ background: "var(--olive)" }}
          />
        )}
      </button>
      {open && <NotifPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
