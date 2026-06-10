"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useIncomingCall } from "@/context/IncomingCallContext";
import { CallLogCard } from "@/components/messages/CallLogCard";
import { buildCallLogs, callLogByAnchor, callLogMessageIds, type CallLogEntry } from "@/lib/call-log";
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  MicrophoneIcon,
  XMarkIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileAvatarButton } from "@/components/dashboard/ProfileAvatarButton";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import {
  type ChatMessage,
  type ChatPeer,
  type ConversationSummary,
  deleteMessage,
  editMessage,
  fetchConversations,
  fetchMessages,
  fetchOlderMessages,
  fetchRecentMessages,
  MESSAGE_PAGE_SIZE,
  openConversation,
  searchUsers,
  sendCallInvite,
  sendTextMessage,
  sendVoiceMessage,
} from "@/lib/chat-api";
import {
  readCachedConversations,
  readCachedMessages,
  writeCachedConversations,
  writeCachedMessages,
} from "@/lib/chat-cache";
import { cn } from "@/lib/utils";
import { useChatRealtime } from "@/context/ChatRealtimeContext";
import { createAdaptivePoller, FALLBACK_POLL_MS } from "@/lib/poll-schedule";

function chatPath(conversationId: string) {
  return `/dashboard/call/${encodeURIComponent(conversationId)}`;
}

function persistChatPeer(conversationId: string, peer: ChatPeer) {
  try {
    sessionStorage.setItem(`sb-chat-peer:${conversationId}`, JSON.stringify(peer));
  } catch {
    /* ignore */
  }
}

function loadStoredChatPeer(conversationId: string): ChatPeer | null {
  try {
    const raw = sessionStorage.getItem(`sb-chat-peer:${conversationId}`);
    return raw ? (JSON.parse(raw) as ChatPeer) : null;
  } catch {
    return null;
  }
}

function ChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-4xl shadow-sm"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
      >
        💬
      </div>
      <p className="text-[17px] font-bold" style={{ color: "var(--text)" }}>
        Чат эхлүүлэх
      </p>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("mn-MN", { month: "short", day: "numeric" });
}

function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  return added.length ? [...prev, ...added] : prev;
}

function prependMessages(prev: ChatMessage[], older: ChatMessage[]): ChatMessage[] {
  if (!older.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = older.filter((m) => !seen.has(m.id));
  return added.length ? [...added, ...prev] : prev;
}

function VoiceBubble({ url, durationMs, mine }: { url: string; durationMs: number | null; mine: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const secs = durationMs ? Math.round(durationMs / 1000) : null;

  return (
    <button
      type="button"
      onClick={() => {
        const el = ref.current;
        if (!el) return;
        if (playing) {
          el.pause();
        } else {
          void el.play();
        }
      }}
      className={cn(
        "flex min-w-[140px] items-center gap-2 rounded-2xl px-3 py-2 text-left",
        mine ? "bg-[var(--olive)] text-[#0d1e35]" : "bg-[var(--surface-2)]",
      )}
    >
      <span className="text-lg">{playing ? "⏸" : "▶"}</span>
      <span className="text-[13px] font-semibold">{secs ? `${secs}s` : "Дуу"}</span>
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    </button>
  );
}

function MessageBubble({
  msg,
  editing,
  onStartEdit,
  onDelete,
}: {
  msg: ChatMessage;
  editing: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
}) {
  const canEdit = msg.mine && msg.kind === "text";
  const canDelete = msg.mine && (msg.kind === "text" || msg.kind === "voice");
  const showMenu = canEdit || canDelete;

  return (
    <div className={cn("group flex min-w-0 items-end gap-1", msg.mine ? "justify-end" : "justify-start")}>
      {showMenu && !editing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Үйлдэл"
              className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
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
              <DropdownMenuItem onClick={onDelete} className="text-[#e53535] focus:text-[#e53535]">
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
          editing && "ring-2 ring-[var(--olive)] ring-offset-2 ring-offset-[var(--bg)]",
          msg.mine ? "rounded-br-md bg-[var(--olive)] text-[#0d1e35]" : "rounded-bl-md bg-[var(--surface-2)]",
        )}
        style={!msg.mine ? { border: "1px solid var(--border-c)" } : undefined}
      >
        {msg.kind === "voice" && msg.voiceUrl ? (
          <VoiceBubble url={msg.voiceUrl} durationMs={msg.voiceDurationMs} mine={msg.mine} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed [overflow-wrap:anywhere]">
            {msg.body}
          </p>
        )}
        <p className={cn("mt-1 text-[10px] opacity-60", msg.mine ? "text-right" : "text-left")}>
          {editing ? "Засаж байна…" : formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

type MessagesAppProps = {
  initialConversations?: ConversationSummary[];
  initialMessages?: ChatMessage[];
  initialConvId?: string;
};

export function MessagesApp({
  initialConversations,
  initialMessages,
  initialConvId,
}: MessagesAppProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const routeConvId = params?.id ? decodeURIComponent(String(params.id)) : null;
  const { markInCall, markAvailable } = useIncomingCall();
  const { connected: realtimeConnected, subscribe } = useChatRealtime();
  const hasServerConversations = initialConversations !== undefined;
  const hasServerMessages =
    initialMessages !== undefined && !!initialConvId && initialConvId === routeConvId;
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    () => initialConversations ?? [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePeer, setActivePeer] = useState<ChatPeer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => (hasServerMessages ? initialMessages! : []),
  );
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ChatPeer[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingList, setLoadingList] = useState(() => initialConversations === undefined);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const pendingEnterScrollRef = useRef(false);
  const loadingOlderRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const shouldScrollToBottomRef = useRef(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const lastMessageIdRef = useRef(
    hasServerMessages && initialMessages!.length
      ? initialMessages![initialMessages!.length - 1]!.id
      : 0,
  );
  const skippedInitialMsgLoadRef = useRef(hasServerMessages);

  const { entries: callLogEntries, hiddenIds: callHiddenIds } = useMemo(
    () => buildCallLogs(messages),
    [messages],
  );
  const callLogMap = useMemo(() => callLogByAnchor(callLogEntries), [callLogEntries]);

  const openChat = useCallback((convId: string, peer: ChatPeer) => {
    persistChatPeer(convId, peer);
    router.push(chatPath(convId));
  }, [router]);

  const closeChat = useCallback(() => {
    router.push("/dashboard/call");
  }, [router]);

  const refreshConversations = useCallback(async (silent = true) => {
    if (!silent) setLoadingList(true);
    try {
      const list = await fetchConversations();
      setConversations(list);
      writeCachedConversations(list);
    } catch {
      if (!silent) setConversations([]);
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, []);

  const loadRecentMessages = useCallback(async (convId: string) => {
    const rows = await fetchRecentMessages(convId, MESSAGE_PAGE_SIZE);
    setMessages(rows);
    writeCachedMessages(convId, rows);
    lastMessageIdRef.current = rows[rows.length - 1]?.id ?? 0;
    setHasMoreOlder(rows.length >= MESSAGE_PAGE_SIZE);
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!routeConvId || loadingOlderRef.current || !hasMoreOlder) return;
    const firstId = messages[0]?.id;
    if (!firstId) return;

    const el = messagesScrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const prevTop = el?.scrollTop ?? 0;

    loadingOlderRef.current = true;
    setLoadingOlder(true);
    try {
      const rows = await fetchOlderMessages(routeConvId, firstId, MESSAGE_PAGE_SIZE);
      if (!rows.length) {
        setHasMoreOlder(false);
        return;
      }
      setMessages((prev) => {
        const merged = prependMessages(prev, rows);
        writeCachedMessages(routeConvId, merged);
        return merged;
      });
      setHasMoreOlder(rows.length >= MESSAGE_PAGE_SIZE);
      requestAnimationFrame(() => {
        if (!el) return;
        el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [hasMoreOlder, messages, routeConvId]);

  useEffect(() => {
    if (initialConversations) writeCachedConversations(initialConversations);
    if (initialMessages && initialConvId) {
      writeCachedMessages(initialConvId, initialMessages);
      if (initialMessages.length >= MESSAGE_PAGE_SIZE) setHasMoreOlder(true);
    }

    if (initialConversations === undefined) {
      const cached = readCachedConversations();
      if (cached?.length) {
        setConversations(cached);
        setLoadingList(false);
      }
    }

    if (!hasServerMessages && routeConvId) {
      const cached = readCachedMessages(routeConvId);
      if (cached?.length) {
        setMessages(cached);
        lastMessageIdRef.current = cached[cached.length - 1]!.id;
        setHasMoreOlder(cached.length >= MESSAGE_PAGE_SIZE);
        skippedInitialMsgLoadRef.current = true;
      }
    }
  }, [initialConversations, initialMessages, initialConvId, hasServerMessages, routeConvId]);

  useEffect(() => {
    void refreshConversations(!hasServerConversations);
    const poller = createAdaptivePoller(
      () => refreshConversations(true),
      () => (realtimeConnected ? null : FALLBACK_POLL_MS),
    );
    poller.start();
    document.addEventListener("visibilitychange", poller.onVisibility);
    window.addEventListener("focus", poller.poke);

    const unsub = subscribe(() => {
      void refreshConversations(true);
    });

    return () => {
      unsub();
      document.removeEventListener("visibilitychange", poller.onVisibility);
      window.removeEventListener("focus", poller.poke);
      poller.stop();
    };
  }, [refreshConversations, hasServerConversations, realtimeConnected, subscribe]);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard/call")) return;
    markAvailable();
  }, [pathname, markAvailable]);

  useEffect(() => {
    if (!routeConvId) {
      setActiveId(null);
      setActivePeer(null);
      setMessages([]);
      lastMessageIdRef.current = 0;
      setHasMoreOlder(true);
      return;
    }

    setHasMoreOlder(true);
    isNearBottomRef.current = true;

    setActiveId(routeConvId);
    const fromList = conversations.find((c) => c.id === routeConvId);
    if (fromList) {
      setActivePeer(fromList.peer);
      persistChatPeer(routeConvId, fromList.peer);
      return;
    }

    const stored = loadStoredChatPeer(routeConvId);
    if (stored) setActivePeer(stored);
  }, [routeConvId, conversations]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      void refreshConversations(true);
      if (activeId) {
        shouldScrollToBottomRef.current = isNearBottomRef.current;
        void fetchMessages(activeId, lastMessageIdRef.current).then((rows) => {
          if (!rows.length) return;
          setMessages((prev) => {
            const merged = mergeMessages(prev, rows);
            lastMessageIdRef.current = merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
            writeCachedMessages(activeId, merged);
            return merged;
          });
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [activeId, refreshConversations]);

  useEffect(() => {
    if (!routeConvId) return;

    if (skippedInitialMsgLoadRef.current) {
      skippedInitialMsgLoadRef.current = false;
    } else {
      lastMessageIdRef.current = 0;
      void loadRecentMessages(routeConvId);
    }

    const pollNewMessages = () => {
      const afterId = lastMessageIdRef.current;
      if (!afterId) return;
      void fetchMessages(routeConvId, afterId)
        .then((rows) => {
          if (!rows.length) return;
          shouldScrollToBottomRef.current = isNearBottomRef.current;
          setMessages((prev) => {
            const merged = mergeMessages(prev, rows);
            lastMessageIdRef.current = merged[merged.length - 1]?.id ?? afterId;
            writeCachedMessages(routeConvId, merged);
            return merged;
          });
        })
        .catch(() => {});
    };

    const poller = createAdaptivePoller(
      pollNewMessages,
      () => (realtimeConnected ? null : FALLBACK_POLL_MS),
    );
    poller.start();
    document.addEventListener("visibilitychange", poller.onVisibility);
    window.addEventListener("focus", poller.poke);

    const unsub = subscribe((event) => {
      if (event.conversationId === routeConvId) pollNewMessages();
    });

    return () => {
      unsub();
      document.removeEventListener("visibilitychange", poller.onVisibility);
      window.removeEventListener("focus", poller.poke);
      poller.stop();
    };
  }, [routeConvId, loadRecentMessages, realtimeConnected, subscribe]);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 120;
    if (el.scrollTop < 80 && hasMoreOlder && !loadingOlderRef.current) {
      void loadOlderMessages();
    }
  }, [hasMoreOlder, loadOlderMessages]);

  const scrollToBottom = useCallback((instant = false) => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: instant ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    if (!routeConvId) {
      pendingEnterScrollRef.current = false;
      return;
    }
    pendingEnterScrollRef.current = true;
  }, [routeConvId]);

  useEffect(() => {
    if (editingId || !routeConvId || messages.length === 0) return;
    if (loadingOlderRef.current) return;

    const instant = pendingEnterScrollRef.current;
    const shouldScroll =
      instant || shouldScrollToBottomRef.current || isNearBottomRef.current;
    if (instant) pendingEnterScrollRef.current = false;
    shouldScrollToBottomRef.current = false;
    if (!shouldScroll) return;

    const run = () => scrollToBottom(instant);
    run();
    const raf = requestAnimationFrame(() => requestAnimationFrame(run));
    const t = instant ? setTimeout(run, 80) : undefined;

    return () => {
      cancelAnimationFrame(raf);
      if (t) clearTimeout(t);
    };
  }, [messages, editingId, routeConvId, scrollToBottom]);

  useEffect(() => {
    if (!editingId) return;
    const el = document.getElementById(`msg-edit-${editingId}`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const t = setTimeout(() => editInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [editingId]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText("");
    setEditError(null);
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setSearchResults(await searchUsers(search.trim()));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const selectConversation = (conv: ConversationSummary) => {
    setSearch("");
    setSearchResults([]);
    openChat(conv.id, conv.peer);
  };

  const startWithPeer = async (peer: ChatPeer) => {
    const conv = await openConversation(peer.id);
    setSearch("");
    setSearchResults([]);
    openChat(conv.id, conv.peer);
  };

  const handleSend = async () => {
    if (!activeId || !text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendTextMessage(activeId, text.trim(), activePeer?.id);
      shouldScrollToBottomRef.current = true;
      setMessages((p) => {
        const merged = mergeMessages(p, [msg]);
        lastMessageIdRef.current = merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
        return merged;
      });
      setText("");
      void refreshConversations(true);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msg: ChatMessage) => {
    if (!activeId) return;
    try {
      await deleteMessage(activeId, msg.id);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      if (editingId === msg.id) {
        setEditingId(null);
        setEditText("");
      }
      void refreshConversations(true);
    } catch {
      /* ignore */
    }
  };

  const handleDeleteCallLog = async (entry: CallLogEntry) => {
    if (!activeId) return;
    const ids = callLogMessageIds(entry);
    try {
      await Promise.all(ids.map((id) => deleteMessage(activeId, id)));
      setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
      void refreshConversations(true);
    } catch {
      /* ignore */
    }
  };

  const handleSaveEdit = async () => {
    if (!activeId || editingId == null || !editText.trim() || savingEdit) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await editMessage(activeId, editingId, editText.trim());
      setMessages((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      cancelEdit();
      void refreshConversations(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа");
    } finally {
      setSavingEdit(false);
    }
  };

  const startCall = async () => {
    if (!activeId || !activePeer) return;
    markInCall();
    try {
      const msg = await sendCallInvite(activeId, activeId, activePeer?.id);
      shouldScrollToBottomRef.current = true;
      setMessages((p) => {
        const merged = mergeMessages(p, [msg]);
        lastMessageIdRef.current = merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
        return merged;
      });
      void refreshConversations(true);
    } catch {
      /* still open call screen */
    }
    router.push(
      `/call/${encodeURIComponent(activeId)}?as=host&returnTo=${encodeURIComponent(chatPath(activeId))}`,
    );
  };

  const startRecording = async () => {
    if (!activeId || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const durationMs = Date.now() - recordStartRef.current;
        if (blob.size > 0 && activeId) {
          const msg = await sendVoiceMessage(activeId, blob, durationMs, activePeer?.id);
          shouldScrollToBottomRef.current = true;
          setMessages((p) => {
            const merged = mergeMessages(p, [msg]);
            lastMessageIdRef.current = merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
            return merged;
          });
          void refreshConversations(true);
        }
        setRecording(false);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
  };

  const showMobileChat = !!routeConvId;

  return (
    <div className="flex h-full min-h-0" style={{ background: "var(--bg)" }}>
      {/* Sidebar — conversation list */}
      <aside
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col border-r md:w-[min(380px,38vw)]",
          showMobileChat ? "hidden md:flex" : "flex",
        )}
        style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
      >
        <div className="px-4 pb-3 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              Чат
            </h1>
            <div className="md:hidden">
              <ProfileAvatarButton size={36} />
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
          >
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0" style={{ color: "var(--text-3)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, утас, email..."
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
              style={{ color: "var(--text)" }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Цэвэрлэх">
                <XMarkIcon className="h-4 w-4" style={{ color: "var(--text-3)" }} />
              </button>
            )}
          </div>
        </div>

        {search.trim().length >= 2 && (
          <div className="border-b px-2 pb-2" style={{ borderColor: "var(--border-c)" }}>
            <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {searching ? "Хайж байна..." : "Хэрэглэгч"}
            </p>
            {searchResults.map((peer) => (
              <button
                key={peer.id}
                type="button"
                onClick={() => void startWithPeer(peer)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <UserAvatar
                  name={peer.name ?? peer.email}
                  avatarUrl={peer.avatarUrl}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold" style={{ color: "var(--text)" }}>
                    {peer.name ?? "Хэрэглэгч"}
                  </p>
                  <p className="truncate text-[12px]" style={{ color: "var(--text-3)" }}>
                    {peer.phone ?? peer.email}
                  </p>
                </div>
                <UserPlusIcon className="h-5 w-5 shrink-0" style={{ color: "var(--olive)" }} />
              </button>
            ))}
            {!searching && searchResults.length === 0 && (
              <p className="px-3 py-2 text-[13px]" style={{ color: "var(--text-3)" }}>Олдсонгүй</p>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {loadingList ? (
            <p className="p-4 text-center text-[13px]" style={{ color: "var(--text-3)" }}>Ачааллаж байна...</p>
          ) : conversations.length === 0 ? (
            <p className="p-6 text-center text-[14px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              Хайлтаар найз олоод чат эхлүүлнэ үү
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => selectConversation(conv)}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                  activeId === conv.id ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]/70",
                )}
              >
                <UserAvatar
                  name={conv.peer.name ?? conv.peer.email}
                  avatarUrl={conv.peer.avatarUrl}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[15px] font-semibold" style={{ color: "var(--text)" }}>
                      {conv.peer.name ?? conv.peer.email}
                    </p>
                    {conv.lastAt && (
                      <span className="shrink-0 text-[11px]" style={{ color: "var(--text-3)" }}>
                        {formatTime(conv.lastAt)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[13px]" style={{ color: "var(--text-3)" }}>
                    {conv.lastPreview ?? "—"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat thread */}
      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          !showMobileChat ? "hidden md:flex" : "flex",
        )}
        style={{ background: "var(--bg)" }}
      >
        {!activeId || !activePeer ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-c)" }}
            >
              💬
            </div>
            <p className="text-[17px] font-bold" style={{ color: "var(--text)" }}>
              Sign Bridge Чат
            </p>
            <p className="max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              Нэр эсвэл утасны дугаараар хайж, чат бичих, дуу илгээх, видео дуудлага хийнэ
            </p>
          </div>
        ) : (
          <>
            <header
              className="flex shrink-0 items-center gap-3 border-b px-3 py-3 md:px-5"
              style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
            >
              <button
                type="button"
                className="md:hidden"
                onClick={closeChat}
                aria-label="Буцах"
              >
                <ChevronLeftIcon className="h-6 w-6" style={{ color: "var(--text)" }} />
              </button>
              <UserAvatar
                name={activePeer.name ?? activePeer.email}
                avatarUrl={activePeer.avatarUrl}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold" style={{ color: "var(--text)" }}>
                  {activePeer.name ?? "Хэрэглэгч"}
                </p>
                <p className="truncate text-[12px]" style={{ color: "var(--text-3)" }}>
                  {activePeer.phone ?? activePeer.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void startCall()}
                aria-label="Дуудлага"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
                style={{ background: "var(--olive)", color: "#0d1e35" }}
              >
                <PhoneIcon className="h-5 w-5" />
              </button>
            </header>

            <div
              ref={messagesScrollRef}
              onScroll={handleMessagesScroll}
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-y-auto",
                editingId && "pb-28",
              )}
            >
              {messages.length === 0 ? (
                <ChatEmptyState />
              ) : (
                <div className="space-y-3 px-3 py-4 md:px-6">
                  {loadingOlder && (
                    <p
                      className="py-2 text-center text-[12px]"
                      style={{ color: "var(--text-3)" }}
                    >
                      Хуучин мессеж уншиж байна…
                    </p>
                  )}
                  {messages.map((m) => {
                    if (callHiddenIds.has(m.id)) return null;
                    const log = callLogMap.get(m.id);
                    if (log && activePeer) {
                      return (
                        <CallLogCard
                          key={m.id}
                          entry={log}
                          peer={activePeer}
                          onCallAgain={() => void startCall()}
                          onDelete={() => void handleDeleteCallLog(log)}
                        />
                      );
                    }
                    return (
                      <MessageBubble
                        key={m.id}
                        msg={m}
                        editing={editingId === m.id}
                        onStartEdit={() => {
                          setEditingId(m.id);
                          setEditText(m.body ?? "");
                          setEditError(null);
                        }}
                        onDelete={() => void handleDeleteMessage(m)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <footer
              className="relative z-20 shrink-0 border-t px-3 py-3 pb-[max(env(safe-area-inset-bottom),12px)] md:px-5"
              style={{ borderColor: "var(--border-c)", background: "var(--surface)" }}
            >
              {editingId ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>
                      Мессеж засах
                    </p>
                    <button
                      type="button"
                      onClick={cancelEdit}
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
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSaveEdit();
                        }
                        if (e.key === "Escape") cancelEdit();
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
                      onClick={() => void handleSaveEdit()}
                      className="flex h-11 shrink-0 items-center justify-center rounded-2xl px-4 text-[14px] font-bold disabled:opacity-40"
                      style={{ background: "var(--olive)", color: "#0d1e35" }}
                    >
                      {savingEdit ? "…" : "Хадгалах"}
                    </button>
                  </div>
                  {editError && (
                    <p className="mt-2 text-center text-[12px] font-medium text-[#e53535]">{editError}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      aria-label={recording ? "Зогсоох" : "Дуу бичих"}
                      onPointerDown={() => void startRecording()}
                      onPointerUp={stopRecording}
                      onPointerLeave={stopRecording}
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all",
                        recording && "scale-110 ring-4 ring-red-400/40",
                      )}
                      style={{ background: recording ? "#e53535" : "var(--surface-2)", color: recording ? "#fff" : "var(--text)" }}
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
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
                      onClick={() => void handleSend()}
                      aria-label="Илгээх"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
                      style={{ background: "var(--olive)", color: "#0d1e35" }}
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
