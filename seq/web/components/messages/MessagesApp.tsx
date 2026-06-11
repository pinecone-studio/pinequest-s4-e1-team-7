"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useIncomingCall } from "@/context/IncomingCallContext";
import { buildCallLogs, callLogByAnchor, callLogMessageIds, type CallLogEntry } from "@/lib/call-log";
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
import { chatPath, persistChatPeer, loadStoredChatPeer, mergeMessages, prependMessages } from "./utils/chatHelpers";
import { ConversationSidebar } from "./components/ConversationSidebar";
import { ChatThreadHeader } from "./components/ChatThreadHeader";
import { MessagesList } from "./components/MessagesList";
import { ChatInputFooter } from "./components/ChatInputFooter";

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
    el.scrollTo({ top: el.scrollHeight, behavior: instant ? "auto" : "smooth" });
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
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        search={search}
        searchResults={searchResults}
        searching={searching}
        loadingList={loadingList}
        showMobileChat={showMobileChat}
        onSearch={setSearch}
        onSelectConversation={selectConversation}
        onStartWithPeer={startWithPeer}
      />

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
            <ChatThreadHeader
              activePeer={activePeer}
              onClose={closeChat}
              onCall={() => void startCall()}
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
            <ChatInputFooter
              text={text}
              sending={sending}
              recording={recording}
              editingId={editingId}
              editText={editText}
              savingEdit={savingEdit}
              editError={editError}
              editInputRef={editInputRef}
              onTextChange={setText}
              onSend={() => void handleSend()}
              onStartRecording={() => void startRecording()}
              onStopRecording={stopRecording}
              onCancelEdit={cancelEdit}
              onEditTextChange={setEditText}
              onSaveEdit={() => void handleSaveEdit()}
            />
          </>
        )}
      </section>
    </div>
  );
}
