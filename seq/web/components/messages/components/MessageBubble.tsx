"use client";

import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { VoiceBubble } from "./VoiceBubble";
import { formatTime } from "../utils/chatHelpers";
import type { ChatMessage } from "@/lib/chat-api";

type Props = {
  msg: ChatMessage;
  editing: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
};

export function MessageBubble({ msg, editing, onStartEdit, onDelete }: Props) {
  const canEdit = msg.mine && msg.kind === "text";
  const canDelete = msg.mine && (msg.kind === "text" || msg.kind === "voice");
  const showMenu = canEdit || canDelete;

  return (
    <div
      className={cn(
        "group flex min-w-0 items-end gap-1",
        msg.mine ? "justify-end" : "justify-start",
      )}
    >
      {showMenu && !editing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Үйлдэл"
              className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-60 data-[state=open]:opacity-100"
              style={{ color: "var(--text-3)" }}
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={msg.mine ? "end" : "start"}>
            {canEdit && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onStartEdit();
                }}
              >
                <PencilIcon />
                Засах
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-[#e53535] focus:text-[#e53535]"
              >
                <TrashIcon />
                Устгах
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div
        id={editing ? `msg-edit-${msg.id}` : undefined}
        className={cn(
          "min-w-0 max-w-[85%] overflow-hidden rounded-2xl px-4 py-2.5 shadow-sm",
          editing &&
            "ring-2 ring-[var(--olive)] ring-offset-2 ring-offset-[var(--bg)]",
          msg.mine
            ? "rounded-br-md bg-[var(--olive)] text-[#0d1e35]"
            : "rounded-bl-md bg-[var(--surface-2)]",
        )}
        style={!msg.mine ? { border: "1px solid var(--border-c)" } : undefined}
      >
        {msg.kind === "voice" && msg.voiceUrl ? (
          <VoiceBubble
            url={msg.voiceUrl}
            durationMs={msg.voiceDurationMs}
            mine={msg.mine}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed [overflow-wrap:anywhere]">
            {msg.body}
          </p>
        )}
        <p
          className={cn(
            "mt-1 text-[10px] opacity-60",
            msg.mine ? "text-right" : "text-left",
          )}
        >
          {editing ? "Засаж байна…" : formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}
