"use client";

import type { RefObject } from "react";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  sending: boolean;
  recording: boolean;
  editingId: number | null;
  editText: string;
  savingEdit: boolean;
  editError: string | null;
  editInputRef: RefObject<HTMLTextAreaElement>;
  onTextChange: (text: string) => void;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onSaveEdit: () => void;
};

export function ChatInputFooter({
  text,
  sending,
  recording,
  editingId,
  editText,
  savingEdit,
  editError,
  editInputRef,
  onTextChange,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelEdit,
  onEditTextChange,
  onSaveEdit,
}: Props) {
  return (
    <footer
      className="relative z-20 shrink-0 border-t px-3 py-3 md:px-5"
      style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
    >
      {editingId ? (
        <>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p
              className="text-[13px] font-bold"
              style={{ color: "var(--text)" }}
            >
              Мессеж засах
            </p>
            <button
              type="button"
              onClick={onCancelEdit}
              aria-label="Болих"
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ color: "var(--text-3)" }}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={editInputRef}
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSaveEdit();
                }
                if (e.key === "Escape") onCancelEdit();
              }}
              rows={2}
              placeholder="Мессеж..."
              className="max-h-32 min-h-[52px] flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] outline-none"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-c)",
                color: "var(--text)",
              }}
            />
            <button
              type="button"
              disabled={!editText.trim() || savingEdit}
              onClick={onSaveEdit}
              className="flex h-11 shrink-0 items-center justify-center rounded-2xl px-4 text-[14px] font-bold disabled:opacity-40"
              style={{ background: "var(--olive)", color: "#0d1e35" }}
            >
              {savingEdit ? "…" : "Хадгалах"}
            </button>
          </div>
          {editError && (
            <p className="mt-2 text-center text-[12px] font-medium text-[hsl(var(--destructive))]">
              {editError}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-end gap-2">
          <button
            type="button"
            aria-label={recording ? "Зогсоох" : "Яриа бичих"}
            onPointerDown={onStartRecording}
            onPointerUp={onStopRecording}
            onPointerLeave={onStopRecording}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all",
              recording && "scale-110 ring-4 ring-red-400/40",
            )}
            style={{
              background: recording ? "hsl(var(--destructive))" : "var(--surface-2)",
              color: recording ? "#fff" : "var(--text)",
            }}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Мессеж..."
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-c)",
              color: "var(--text)",
            }}
          />
          <button
            type="button"
            disabled={!text.trim() || sending}
            onClick={onSend}
            aria-label="Илгээх"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
            style={{ background: "var(--olive)", color: "#0d1e35" }}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </footer>
  );
}
