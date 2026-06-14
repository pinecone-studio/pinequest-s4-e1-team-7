"use client";

import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserAvatar } from "@/components/dashboard/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { formatTime } from "../utils/chatHelpers";
import type { ChatPeer, ConversationSummary } from "@/lib/chat-api";
import { useA11yNav } from "@/lib/a11y-nav-context";
import { useEffect, useRef } from "react";

type Props = {
  conversations: ConversationSummary[];
  openConvId: string | null;
  search: string;
  searchResults: ChatPeer[];
  searching: boolean;
  loadingList: boolean;
  showMobileChat: boolean;
  onSearch: (value: string) => void;
  onSelectConversation: (conv: ConversationSummary) => void;
  onStartWithPeer: (peer: ChatPeer) => Promise<void>;
};

export function ConversationSidebar({
  conversations,
  openConvId,
  search,
  searchResults,
  searching,
  loadingList,
  showMobileChat,
  onSearch,
  onSelectConversation,
  onStartWithPeer,
}: Props) {
  const a11yNav = useA11yNav();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!a11yNav || a11yNav.preChatIndex < 1) return;
    const el = listRef.current?.children[a11yNav.preChatIndex - 1] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [a11yNav?.preChatIndex]);

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col",
        showMobileChat ? "hidden md:flex" : "flex",
      )}
    >
      <div className="px-2 pb-3 pt-4 md:pt-5">
        <h1
          className="mb-4 text-[22px] font-extrabold tracking-tight hidden md:block"
          style={{ color: "var(--text)" }}
        >
          Чат
        </h1>

        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-c)",
          }}
        >
          <MagnifyingGlassIcon
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--text-3)" }}
          />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Нэр, утас, email..."
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: "var(--text)" }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              aria-label="Цэвэрлэх"
            >
              <XMarkIcon
                className="h-4 w-4"
                style={{ color: "var(--text-3)" }}
              />
            </button>
          )}
        </div>
      </div>

      {search.trim().length >= 2 && (
        <div
          className="border-b px-4 pb-2"
          style={{ borderColor: "var(--border-c)" }}
        >
          <p
            className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
          >
            {searching ? "Хайж байна..." : "Хэрэглэгч"}
          </p>
          {searchResults.map((peer, idx) => {
            const a11yFocused = a11yNav?.preChatIndex === idx + 1;
            return (
            <button
              key={peer.id}
              type="button"
              onClick={() => void onStartWithPeer(peer)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]",
                a11yFocused && "ring-2 ring-[var(--olive)]",
              )}
              style={
                a11yFocused
                  ? { background: "color-mix(in srgb, var(--olive) 15%, var(--surface-2))" }
                  : undefined
              }
            >
              <div className="relative shrink-0">
                <UserAvatar
                  name={peer.name ?? peer.email}
                  avatarUrl={peer.avatarUrl}
                  size={40}
                />
                <span
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface)]"
                  style={{ background: peer.isOnline ? "#22c55e" : "#ef4444" }}
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[15px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {peer.name ?? "Хэрэглэгч"}
                </p>
                <p
                  className="truncate text-[12px]"
                  style={{ color: "var(--text-3)" }}
                >
                  {peer.phone ?? peer.email}
                </p>
              </div>
              <UserPlusIcon
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--olive)" }}
              />
            </button>
          );
          })}
          {!searching && searchResults.length === 0 && (
            <p
              className="px-3 py-2 text-[13px]"
              style={{ color: "var(--text-3)" }}
            >
              Олдсонгүй
            </p>
          )}
        </div>
      )}

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loadingList ? (
          <p
            className="p-4 text-center text-[13px]"
            style={{ color: "var(--text-3)" }}
          >
            Ачааллаж байна...
          </p>
        ) : conversations.length === 0 ? (
          <p
            className="p-6 text-center text-[14px] leading-relaxed"
            style={{ color: "var(--text-3)" }}
          >
            Хайлтаар найз олоод чат эхлүүлнэ үү
          </p>
        ) : (
          conversations.map((conv, idx) => {
            const isUnread =
              conv.id !== openConvId && !!conv.unread;
            const a11yFocused = a11yNav?.preChatIndex === idx + 1;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  "relative mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-all overflow-hidden",
                  a11yFocused && "ring-2 ring-[var(--olive)]",
                )}
                style={
                  a11yFocused
                    ? { background: "color-mix(in srgb, var(--olive) 18%, var(--surface-2))", border: "2px solid var(--olive)" }
                    : isUnread
                    ? { background: "rgba(245,197,24,0.18)", border: "1.5px solid rgba(245,197,24,0.5)" }
                    : { background: "var(--surface-2)", border: "1px solid var(--border-c)" }
                }
              >
                {/* left accent stripe for unread */}
                {isUnread && (
                  <span
                    className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                    style={{ background: "var(--olive)" }}
                  />
                )}

                <div className="relative shrink-0">
                  <UserAvatar
                    name={conv.peer.name ?? conv.peer.email}
                    avatarUrl={conv.peer.avatarUrl}
                    size={44}
                  />
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-[var(--surface)]"
                    style={{ background: conv.peer.isOnline ? "#22c55e" : "#ef4444" }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn("truncate text-[15px]", isUnread ? "font-bold" : "font-semibold")}
                      style={{ color: "var(--text)" }}
                    >
                      {conv.peer.name ?? conv.peer.email}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {conv.lastAt && (
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: isUnread ? "var(--olive)" : "var(--text-3)" }}
                        >
                          {formatTime(conv.lastAt)}
                        </span>
                      )}
                      {isUnread && (
                        <span
                          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold"
                          style={{ background: "var(--olive)", color: "#0d1e35" }}
                        >
                          •
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={cn("truncate text-[13px]", isUnread ? "font-semibold" : "")}
                    style={{ color: isUnread ? "var(--text)" : "var(--text-3)" }}
                  >
                    {conv.lastPreview ?? "—"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
