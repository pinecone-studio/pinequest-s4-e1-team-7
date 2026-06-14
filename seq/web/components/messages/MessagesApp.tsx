"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useIncomingCall } from "@/context/IncomingCallContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import {
  buildCallLogs,
  callLogByAnchor,
  callLogMessageIds,
  type CallLogEntry,
} from "@/lib/call-log";
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
  markConversationRead,
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
import { useAuth } from "@/context/AuthContext";
import { fireChatNotification } from "@/lib/chat-notify";
import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { ChatThreadHeader } from "./components/ChatThreadHeader";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { MessagesList } from "./components/MessagesList";
import { ChatInputFooter } from "./components/ChatInputFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  A11yChatBridgeContext,
  type A11yChatBridge,
} from "@/lib/a11y-chat-bridge";
import { a11ySpeak } from "@/lib/a11y-speak";
import { A11yNavProvider } from "@/components/accessible/A11yNavProvider";
import { A11yThreadToolbar } from "@/components/accessible/A11yThreadToolbar";

const LS_READ_KEY = "sb-read-until";
function getReadUntil(convId: string): number | undefined {
  try {
    const raw = localStorage.getItem(LS_READ_KEY);
    if (!raw) return undefined;
    return (JSON.parse(raw) as Record<string, number>)[convId];
  } catch { return undefined; }
}
function setReadUntil(convId: string, msgId: number): void {
  try {
    const raw = localStorage.getItem(LS_READ_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    map[convId] = msgId;
    localStorage.setItem(LS_READ_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

function buildChatPath(base: string, conversationId: string) {
  return `${base}/${encodeURIComponent(conversationId)}`;
}

function persistChatPeer(conversationId: string, peer: ChatPeer) {
  try {
    sessionStorage.setItem(
      `sb-chat-peer:${conversationId}`,
      JSON.stringify(peer),
    );
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

function mergeMessages(
  prev: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  if (!incoming.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !seen.has(m.id));
  return added.length ? [...prev, ...added] : prev;
}

function prependMessages(
  prev: ChatMessage[],
  older: ChatMessage[],
): ChatMessage[] {
  if (!older.length) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const added = older.filter((m) => !seen.has(m.id));
  return added.length ? [...added, ...prev] : prev;
}

type MessagesAppProps = {
  initialConversations?: ConversationSummary[];
  initialMessages?: ChatMessage[];
  initialConvId?: string;
  chatBasePath?: string;
  settingsPath?: string;
  a11yMode?: boolean;
  hideInputFooter?: boolean;
};

export function MessagesApp({
  initialConversations,
  initialMessages,
  initialConvId,
  chatBasePath = "/dashboard/call",
  settingsPath = "/dashboard/settings",
  a11yMode = false,
  hideInputFooter = false,
}: MessagesAppProps = {}) {
  usePresenceHeartbeat();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const routeConvId = params?.id ? decodeURIComponent(String(params.id)) : null;
  const { user } = useAuth();
  const { markInCall, markAvailable } = useIncomingCall();
  const { connected: realtimeConnected, subscribe } = useChatRealtime();
  const hasServerConversations = initialConversations !== undefined;
  const hasServerMessages =
    initialMessages !== undefined &&
    !!initialConvId &&
    initialConvId === routeConvId;
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    () => initialConversations ?? [],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePeer, setActivePeer] = useState<ChatPeer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    hasServerMessages ? initialMessages! : [],
  );
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ChatPeer[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingList, setLoadingList] = useState(
    () => initialConversations === undefined,
  );
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showBraille, setShowBraille] = useState(false);
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
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const prevConvsRef = useRef<ConversationSummary[]>([]);

  const { entries: callLogEntries, hiddenIds: callHiddenIds } = useMemo(
    () => buildCallLogs(messages),
    [messages],
  );
  const callLogMap = useMemo(
    () => callLogByAnchor(callLogEntries),
    [callLogEntries],
  );

  // Detect new incoming messages and fire notifications + track unread.
  // prevConvsRef must only advance after both user and conversations are ready —
  // otherwise the initial-load unread scan never runs (user loads after conversations).
  useEffect(() => {
    if (!user?.id || !conversations.length) return;

    const prev = prevConvsRef.current;
    prevConvsRef.current = conversations;

    if (!prev.length) {
      // Initial load: use server-computed unread flag, skip currently open conversation
      const ids = conversations
        .filter((c) => c.unread && c.id !== routeConvId)
        .map((c) => c.id);
      if (ids.length) setUnreadIds(new Set(ids));
      return;
    }

    // Subsequent polls: detect newly arrived messages and fire toast/bell
    const newUnread: string[] = [];
    for (const conv of conversations) {
      const last = conv.lastMessage;
      if (!last || last.senderId === user.id) continue;
      const prevConv = prev.find((c) => c.id === conv.id);
      if (prevConv?.lastMessage?.id === last.id) continue;
      if (conv.id === routeConvId) continue;
      const seenId = getReadUntil(conv.id);
      if (seenId !== undefined && seenId >= last.id) continue;
      newUnread.push(conv.id);
      fireChatNotification(last.id, conv.id, last.kind, pathname, (href) =>
        router.push(href),
      );
    }
    if (newUnread.length) setUnreadIds((s) => new Set([...s, ...newUnread]));
  }, [conversations, user?.id, routeConvId, pathname, router]);

  // Mark conversation as read when user navigates into it
  useEffect(() => {
    if (!routeConvId) return;
    setUnreadIds((s) => {
      const n = new Set(s);
      n.delete(routeConvId);
      return n;
    });
    // Record last-seen messageId so remounts don't re-mark this conv as unread
    const conv = conversations.find((c) => c.id === routeConvId);
    if (conv?.lastMessage) setReadUntil(routeConvId, conv.lastMessage.id);
    markConversationRead(routeConvId);
  }, [routeConvId, conversations]);

  const openChat = useCallback(
    (convId: string, peer: ChatPeer) => {
      persistChatPeer(convId, peer);
      router.push(buildChatPath(chatBasePath, convId));
    },
    [router, chatBasePath],
  );

  const closeChat = useCallback(() => {
    router.push(chatBasePath);
  }, [router, chatBasePath]);

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
      const rows = await fetchOlderMessages(
        routeConvId,
        firstId,
        MESSAGE_PAGE_SIZE,
      );
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
  }, [
    initialConversations,
    initialMessages,
    initialConvId,
    hasServerMessages,
    routeConvId,
  ]);

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
  }, [
    refreshConversations,
    hasServerConversations,
    realtimeConnected,
    subscribe,
  ]);

  useEffect(() => {
    if (!pathname.startsWith(chatBasePath)) return;
    markAvailable();
  }, [pathname, markAvailable, chatBasePath]);

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
            lastMessageIdRef.current =
              merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
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

    const poller = createAdaptivePoller(pollNewMessages, () =>
      realtimeConnected ? null : FALLBACK_POLL_MS,
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

  const startWithPeer = useCallback(async (peer: ChatPeer) => {
    const conv = await openConversation(peer.id);
    setSearch("");
    setSearchResults([]);
    openChat(conv.id, conv.peer);
  }, [openChat]);

  const sendMessage = useCallback(async (body: string) => {
    if (!activeId || !body.trim()) return;
    setSending(true);
    try {
      const msg = await sendTextMessage(activeId, body.trim(), activePeer?.id);
      shouldScrollToBottomRef.current = true;
      setMessages((p) => {
        const merged = mergeMessages(p, [msg]);
        lastMessageIdRef.current =
          merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
        return merged;
      });
      setText("");
      if (a11yMode) a11ySpeak("Илгээгдлээ");
      void refreshConversations(true);
    } finally {
      setSending(false);
    }
  }, [activeId, activePeer?.id, a11yMode, refreshConversations]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;
    await sendMessage(text);
  }, [sendMessage, sending, text]);

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
    if (!activeId || editingId == null || !editText.trim() || savingEdit)
      return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await editMessage(activeId, editingId, editText.trim());
      setMessages((prev) =>
        prev.map((m) => (m.id === editingId ? updated : m)),
      );
      cancelEdit();
      void refreshConversations(true);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const startCall = useCallback(async () => {
    if (!activeId || !activePeer) return;
    markInCall();
    try {
      const msg = await sendCallInvite(activeId, activeId, activePeer?.id);
      shouldScrollToBottomRef.current = true;
      setMessages((p) => {
        const merged = mergeMessages(p, [msg]);
        lastMessageIdRef.current =
          merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
        return merged;
      });
      void refreshConversations(true);
    } catch {
      /* still open call screen */
    }
    router.push(
      `/call/${encodeURIComponent(activeId)}?as=host&returnTo=${encodeURIComponent(buildChatPath(chatBasePath, activeId))}`,
    );
  }, [activeId, activePeer, chatBasePath, markInCall, refreshConversations, router]);

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
          const msg = await sendVoiceMessage(
            activeId,
            blob,
            durationMs,
            activePeer?.id,
          );
          shouldScrollToBottomRef.current = true;
          setMessages((p) => {
            const merged = mergeMessages(p, [msg]);
            lastMessageIdRef.current =
              merged[merged.length - 1]?.id ?? lastMessageIdRef.current;
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

  // STT: mic button → speech recognized → message sent directly
  const handleSttResult = useCallback((t: string, final: boolean) => {
    if (final && t.trim()) {
      void sendMessage(t.trim());
    }
  }, [sendMessage]);
  const { listening, start: startStt, stop: stopStt } = useSpeechRecognition(handleSttResult);
  const toggleStt = useCallback(async () => {
    if (listening) { stopStt(); return; }
    await startStt();
  }, [listening, startStt, stopStt]);

  const showMobileChat = !!routeConvId;

  const a11yBridge = a11yMode
    ? {
        conversations,
        messages,
        activePeer,
        routeConvId,
        search,
        searchResults,
        text,
        setText,
        setSearch,
        openChat,
        closeChat,
        startWithPeer,
        sendText: handleSend,
        startCall,
        startRecording,
        stopRecording,
        recording,
      }
    : null;

  const content = (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Mobile page header — outside all cards, identical pattern to Translator */}
      {!showMobileChat && (
        <div className="shrink-0 px-4 md:hidden">
          <PageHeader
            title="Чат"
            right={
              <button
                type="button"
                onClick={() => router.push(settingsPath)}
                aria-label="Тохиргоо"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-c)",
                }}
              >
                <Cog6ToothIcon
                  className="h-5 w-5"
                  style={{ color: "var(--text)" }}
                />
              </button>
            }
          />
        </div>
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 gap-4 px-4 pb-3 md:gap-3 md:p-4 lg:px-10 lg:pb-4 xl:px-16",
          showMobileChat ? "pt-3" : "pt-0",
        )}
      >
        <div
          className={cn(
            "min-h-0 shrink-0 overflow-hidden rounded-[18px] w-full md:w-[min(340px,36vw)]",
            showMobileChat ? "hidden md:flex md:flex-col" : "flex flex-col",
          )}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
          }}
        >
          <ConversationSidebar
            conversations={conversations}
            search={search}
            searchResults={searchResults}
            searching={searching}
            loadingList={loadingList}
            showMobileChat={showMobileChat}
            unreadIds={unreadIds}
            onSearch={setSearch}
            onSelectConversation={selectConversation}
            onStartWithPeer={startWithPeer}
          />
        </div>

        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[18px]",
            !showMobileChat ? "hidden md:flex" : "flex",
          )}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
          }}
        >
          {!activeId || !activePeer ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-c)",
                }}
              >
                <ChatBubbleLeftRightIcon
                  className="h-9 w-9"
                  style={{ color: "var(--text-3)" }}
                />
              </div>
              <p
                className="text-[17px] font-bold"
                style={{ color: "var(--text)" }}
              >
                Sign Bridge Чат
              </p>
              <p
                className="max-w-sm text-[14px] leading-relaxed"
                style={{ color: "var(--text-3)" }}
              >
                Нэр эсвэл утасны дугаараар хайж, чат бичих, дуу илгээх, видео
                дуудлага хийнэ
              </p>
            </div>
          ) : (
            <>
              <ChatThreadHeader
                activePeer={activePeer}
                onClose={closeChat}
                onCall={() => void startCall()}
                hideCall={a11yMode}
              />
              <MessagesList
                messages={messages}
                callHiddenIds={callHiddenIds}
                callLogMap={callLogMap}
                activePeer={activePeer}
                editingId={editingId}
                loadingOlder={loadingOlder}
                scrollRef={messagesScrollRef}
                onScroll={handleMessagesScroll}
                onStartEdit={(id, body) => {
                  setEditingId(id);
                  setEditText(body);
                  setEditError(null);
                }}
                onDeleteMessage={(msg) => void handleDeleteMessage(msg)}
                onDeleteCallLog={(entry) => void handleDeleteCallLog(entry)}
                onCallAgain={() => void startCall()}
              />
              {a11yMode && <A11yThreadToolbar />}
              {!hideInputFooter && (
              <ChatInputFooter
                text={text}
                sending={sending}
                listening={listening}
                editingId={editingId}
                editText={editText}
                savingEdit={savingEdit}
                editError={editError}
                editInputRef={editInputRef}
                onTextChange={setText}
                onSend={() => void handleSend()}
                onToggleStt={() => void toggleStt()}
                onCancelEdit={cancelEdit}
                onEditTextChange={setEditText}
                onSaveEdit={() => void handleSaveEdit()}
              />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );

  if (a11yBridge) {
    return (
      <A11yChatBridgeContext.Provider value={a11yBridge}>
        <A11yNavProvider>{content}</A11yNavProvider>
      </A11yChatBridgeContext.Provider>
    );
  }

  return content;
}
