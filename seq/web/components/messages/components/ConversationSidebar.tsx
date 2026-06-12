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

type Props = {
  conversations: ConversationSummary[];
  activeId: string | null;
  search: string;
  searchResults: ChatPeer[];
  searching: boolean;
  loadingList: boolean;
  showMobileChat: boolean;
  unreadIds: Set<string>;
  onSearch: (value: string) => void;
  onSelectConversation: (conv: ConversationSummary) => void;
  onStartWithPeer: (peer: ChatPeer) => Promise<void>;
};

export function ConversationSidebar({
  conversations,
  activeId,
  search,
  searchResults,
  searching,
  loadingList,
  showMobileChat,
  unreadIds,
  onSearch,
  onSelectConversation,
  onStartWithPeer,
}: Props) {
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
          {searchResults.map((peer) => (
            <button
              key={peer.id}
              type="button"
              onClick={() => void onStartWithPeer(peer)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
              <UserAvatar
                name={peer.name ?? peer.email}
                avatarUrl={peer.avatarUrl}
                size={40}
              />
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
          ))}
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

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
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
          conversations.map((conv) => {
            const isUnread = unreadIds.has(conv.id);
            const isActive = activeId === conv.id;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv)}
                className="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-all"
                style={
                  isUnread
                    ? { background: "rgba(245,197,24,0.13)", border: "1px solid rgba(245,197,24,0.3)" }
                    : { background: "var(--surface-2)", border: "1px solid var(--border-c)" }
                }
              >
                <UserAvatar
                  name={conv.peer.name ?? conv.peer.email}
                  avatarUrl={conv.peer.avatarUrl}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={cn("truncate text-[15px]", isUnread ? "font-bold" : "font-semibold")}
                      style={{ color: "var(--text)" }}
                    >
                      {conv.peer.name ?? conv.peer.email}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {conv.lastAt && (
                        <span
                          className="text-[11px]"
                          style={{ color: isUnread ? "var(--olive)" : "var(--text-3)" }}
                        >
                          {formatTime(conv.lastAt)}
                        </span>
                      )}
                      {isUnread && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: "var(--olive)" }}
                        />
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
