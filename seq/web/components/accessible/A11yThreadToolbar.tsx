"use client";

import {
  PhoneIcon,
  MicrophoneIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useA11yNav, type ThreadAction } from "@/lib/a11y-nav-context";
import { useA11yChatBridge } from "@/lib/a11y-chat-bridge";

const ACTIONS: { id: ThreadAction; label: string; Icon: typeof PhoneIcon }[] = [
  { id: "call", label: "Дуудлага", Icon: PhoneIcon },
  { id: "voice", label: "Дуу", Icon: MicrophoneIcon },
  { id: "typing", label: "Бичих", Icon: PencilSquareIcon },
];

/** Чат дотор — идэвхтэй үйлдлийг харуулна */
export function A11yThreadToolbar() {
  const nav = useA11yNav();
  const bridge = useA11yChatBridge();

  if (!nav || !bridge.routeConvId) return null;

  return (
    <div
      className="flex shrink-0 gap-2 border-b px-3 py-2 md:hidden"
      style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
    >
      {ACTIONS.map(({ id, label, Icon }) => {
        const active = nav.threadAction === id;
        const recording = id === "voice" && bridge.recording;
        return (
          <div
            key={id}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-2.5 transition-colors",
            )}
            style={{
              background: active
                ? "color-mix(in srgb, var(--olive) 20%, var(--surface-2))"
                : "var(--surface-2)",
              borderColor: active ? "var(--olive)" : "var(--border-c)",
              color: active ? "var(--olive)" : "var(--text-3)",
            }}
            aria-current={active ? "true" : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="text-[11px] font-bold">
              {recording ? "Бичиж…" : label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
