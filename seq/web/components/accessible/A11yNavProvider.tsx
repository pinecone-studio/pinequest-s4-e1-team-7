"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useA11yChatBridge } from "@/lib/a11y-chat-bridge";
import {
  buildHistoryItems,
  historyItemMessageId,
  readHistoryItem,
  stopHistoryPlayback,
  unlockHistoryAudio,
} from "@/lib/a11y-history";
import {
  defaultPreChatIndex,
  getContactNumber,
  playContactNumber,
  syncContactNumbers,
} from "@/lib/a11y-contact-numbers";
import { A11yNavContext, type ThreadAction } from "@/lib/a11y-nav-context";
import { a11yStopSpeak } from "@/lib/a11y-speak";
import { playVoice } from "@/lib/play-voice";
import { useA11yGestures } from "@/lib/use-a11y-gestures";
import { A11yFocusBar } from "./A11yFocusBar";
import { BrailleInput } from "./BrailleInput";

const THREAD_ACTIONS: ThreadAction[] = ["call", "voice", "typing", "history"];

/** Swipe хийхэд шууд уншигдах богино нэр */
const THREAD_NAV_VOICE: Record<ThreadAction, string> = {
  call: "Дуудлага",
  voice: "Дуу",
  typing: "Бичих",
  history: "чаатны түүх",
};

/** Хоёр дарж идэвхжүүлэхэд тоглуулах заавар */
const THREAD_ACTIVATE_VOICE: Record<Exclude<ThreadAction, "history">, string> = {
  call: "дуудлага дарлаа залгаж байна",
  voice: "mic-clicked",
  typing: "бичих дарлаа утасаа баруун тийш",
};

/**
 * Pre-chat жагсаалт:
 *   index 0       → "Хайлт"
 *   index 1..N    → numberedConversations[preChatIndex-1] (тогтмол дугаар)
 */
export function A11yNavProvider({ children }: { children: ReactNode }) {
  const bridge = useA11yChatBridge();

  const [preChatIndex, setPrechatIndex] = useState(0);
  const [threadAction, setThreadAction] = useState<ThreadAction>("call");
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyFocusId, setHistoryFocusId] = useState<number | null>(null);
  const [brailleOpen, setBrailleOpen] = useState(false);
  const spokeRef = useRef("");
  const pendingHistoryReadRef = useRef<number | null>(null);
  const historyIndexRef = useRef(0);
  const preChatInitializedRef = useRef(false);
  const wasInThreadRef = useRef(false);

  const inThread = !!bridge.routeConvId;
  const hasSearch = bridge.search.trim().length >= 2;

  const contactNumbers = useMemo(
    () =>
      syncContactNumbers([
        ...bridge.conversations.map((c) => c.peer.id),
        ...bridge.searchResults.map((p) => p.id),
      ]),
    [bridge.conversations, bridge.searchResults],
  );

  const numberedConversations = useMemo(
    () =>
      [...bridge.conversations].sort((a, b) => {
        const na = contactNumbers[a.peer.id] ?? Number.MAX_SAFE_INTEGER;
        const nb = contactNumbers[b.peer.id] ?? Number.MAX_SAFE_INTEGER;
        return na - nb;
      }),
    [bridge.conversations, contactNumbers],
  );

  const preChatListLen = hasSearch
    ? bridge.searchResults.length
    : numberedConversations.length;

  const preChatContactNumber = useMemo(() => {
    if (preChatIndex < 1) return null;
    if (hasSearch) {
      const peer = bridge.searchResults[preChatIndex - 1];
      return peer ? getContactNumber(peer.id, contactNumbers) ?? null : null;
    }
    const conv = numberedConversations[preChatIndex - 1];
    return conv ? getContactNumber(conv.peer.id, contactNumbers) ?? null : null;
  }, [
    contactNumbers,
    hasSearch,
    numberedConversations,
    preChatIndex,
    bridge.searchResults,
  ]);

  const historyItems = useMemo(
    () => buildHistoryItems(bridge.messages),
    [bridge.messages],
  );
  const historyLen = historyItems.length;
  const peerName =
    bridge.activePeer?.name ?? bridge.activePeer?.email ?? "Хэрэглэгч";

  const brailleVisible =
    brailleOpen &&
    (inThread
      ? threadAction === "typing"
      : preChatIndex === 0);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const scrollToHistoryMessage = useCallback((messageId: number) => {
    setHistoryFocusId(messageId);
    const run = () => {
      document
        .getElementById(`a11y-msg-${messageId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
    window.setTimeout(run, 120);
  }, []);

  const readHistoryAt = useCallback(
    (index: number) => {
      const item = historyItems[index];
      if (!item) return;
      scrollToHistoryMessage(historyItemMessageId(item));
      void readHistoryItem(item, peerName);
    },
    [historyItems, peerName, scrollToHistoryMessage],
  );

  useEffect(() => {
    const pending = pendingHistoryReadRef.current;
    if (pending === null || historyLen === 0) return;
    pendingHistoryReadRef.current = null;
    const idx = Math.min(pending, historyLen - 1);
    setHistoryIndex(idx);
    readHistoryAt(idx);
  }, [historyLen, historyItems, readHistoryAt]);

  // ── Announce helpers ─────────────────────────────────────────────────────
  const speakOnce = useCallback((text: string) => {
    if (spokeRef.current === text) return;
    spokeRef.current = text;
    playVoice(text);
    window.setTimeout(() => { spokeRef.current = ""; }, 1400);
  }, []);

  const announceThreadNav = useCallback((action: ThreadAction) => {
    stopHistoryPlayback();
    playVoice(THREAD_NAV_VOICE[action]);
  }, []);

  const announcePreChat = useCallback(() => {
    if (preChatIndex === 0) {
      speakOnce(
        bridge.search.trim()
          ? `Хайлт: ${bridge.search}. Хоёр дарж хайна.`
          : "Хайлт. Хоёр дарж бичнэ.",
      );
      return;
    }
    if (preChatContactNumber != null) {
      playContactNumber(preChatContactNumber);
      return;
    }
    speakOnce("Жагсаалтын төгсгөл");
  }, [bridge.search, preChatContactNumber, preChatIndex, speakOnce]);

  useEffect(() => {
    if (inThread) {
      wasInThreadRef.current = true;
      return;
    }
    if (hasSearch || brailleOpen) return;
    if (numberedConversations.length === 0) return;

    const shouldPickDefault =
      !preChatInitializedRef.current || wasInThreadRef.current;
    if (shouldPickDefault) {
      setPrechatIndex(defaultPreChatIndex(numberedConversations, contactNumbers));
      preChatInitializedRef.current = true;
      wasInThreadRef.current = false;
    }
  }, [
    brailleOpen,
    contactNumbers,
    hasSearch,
    inThread,
    numberedConversations,
  ]);

  useEffect(() => {
    if (brailleOpen) return;
    if (!inThread) announcePreChat();
  }, [inThread, preChatIndex, brailleOpen, announcePreChat]);

  useEffect(() => {
    if (historyLen === 0) {
      setHistoryIndex(0);
      return;
    }
    setHistoryIndex((i) => Math.min(i, historyLen - 1));
  }, [historyLen]);

  useEffect(() => {
    if (threadAction !== "history") setHistoryFocusId(null);
  }, [threadAction]);

  // Reset when leaving thread
  useEffect(() => {
    if (!inThread) {
      setThreadAction("call");
      setBrailleOpen(false);
      setHistoryIndex(0);
      setHistoryFocusId(null);
      pendingHistoryReadRef.current = null;
      stopHistoryPlayback();
    }
  }, [inThread]);

  // Clamp index when list shrinks
  useEffect(() => {
    if (preChatIndex > 0 && preChatIndex > preChatListLen) {
      setPrechatIndex(Math.max(0, preChatListLen));
    }
  }, [preChatListLen, preChatIndex]);

  // ── Activate ──────────────────────────────────────────────────────────────
  const activateThread = useCallback(async () => {
    unlockHistoryAudio();

    if (threadAction === "history") {
      stopHistoryPlayback();
      const latest = Math.max(0, historyLen - 1);
      setHistoryIndex(latest);
      readHistoryAt(latest);
      return;
    }

    if (threadAction === "call") {
      stopHistoryPlayback();
      playVoice(THREAD_ACTIVATE_VOICE.call);
      await bridge.startCall({ audioOnly: true });
    } else if (threadAction === "voice") {
      if (bridge.recording) {
        bridge.stopRecording();
        playVoice("Дуу");
      } else {
        stopHistoryPlayback();
        playVoice(THREAD_ACTIVATE_VOICE.voice);
        await bridge.startRecording();
      }
    } else {
      stopHistoryPlayback();
      setBrailleOpen(true);
    }
  }, [bridge, historyLen, readHistoryAt, threadAction]);

  const activatePreChat = useCallback(() => {
    if (preChatIndex === 0) {
      setBrailleOpen(true);
      playVoice("Бичих");
      return;
    }
    if (hasSearch) {
      const peer = bridge.searchResults[preChatIndex - 1];
      if (peer) {
        playVoice("Чаат руу орлоо");
        void bridge.startWithPeer(peer);
      }
    } else {
      const conv = numberedConversations[preChatIndex - 1];
      if (conv) {
        playVoice("Чаат руу орлоо");
        bridge.openChat(conv.id, conv.peer);
      }
    }
  }, [bridge, hasSearch, numberedConversations, preChatIndex]);

  const moveHistory = useCallback(
    (dir: "up" | "down") => {
      unlockHistoryAudio();
      if (historyLen === 0) return;

      const cur = historyIndexRef.current;

      if (dir === "down") {
        if (cur >= historyLen - 1) return;
        const next = cur + 1;
        setHistoryIndex(next);
        readHistoryAt(next);
        return;
      }

      // Дээш = хуучин мессеж
      if (cur > 0) {
        const next = cur - 1;
        setHistoryIndex(next);
        readHistoryAt(next);
        return;
      }

      if (bridge.loadingOlder || !bridge.hasMoreOlder) return;

      void bridge.loadOlderMessages().then((added) => {
        if (added > 0) {
          pendingHistoryReadRef.current = added - 1;
        }
      });
    },
    [bridge, historyLen, readHistoryAt],
  );

  // ── Gesture handlers ─────────────────────────────────────────────────────
  const onSwipe = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (inThread) {
        if (threadAction === "history" && (dir === "up" || dir === "down")) {
          moveHistory(dir);
          return;
        }
        if (dir === "left" || dir === "right") {
          setThreadAction((cur) => {
            const idx = THREAD_ACTIONS.indexOf(cur);
            const next =
              dir === "right"
                ? (idx + 1) % THREAD_ACTIONS.length
                : (idx - 1 + THREAD_ACTIONS.length) % THREAD_ACTIONS.length;
            const action = THREAD_ACTIONS[next]!;
            announceThreadNav(action);
            if (action === "history" && historyLen > 0) {
              setHistoryIndex(historyLen - 1);
            }
            return action;
          });
        }
        return;
      }

      // Pre-chat: UP/DOWN → navigate flat list
      if (dir === "up" || dir === "down") {
        const total = preChatListLen + 1; // +1 for search item at index 0
        setPrechatIndex((i) =>
          dir === "up"
            ? (i - 1 + total) % total
            : (i + 1) % total,
        );
      }
    },
    [announceThreadNav, historyLen, inThread, moveHistory, preChatListLen, threadAction],
  );

  const onTwoFingerSwipe = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (dir === "right") {
        // 2-хуруу баруун = буцах
        if (inThread) {
          stopHistoryPlayback();
          bridge.closeChat();
          playVoice("Буцлаа");
        } else {
          a11yStopSpeak();
          playVoice("Буцлаа");
        }
      }
    },
    [bridge, inThread],
  );

  const onDoubleTap = useCallback(() => {
    unlockHistoryAudio();
    if (inThread) void activateThread();
    else activatePreChat();
  }, [activatePreChat, activateThread, inThread]);

  const { onTouchStart, onTouchEnd } = useA11yGestures({
    onSwipe,
    onTwoFingerSwipe,
    onDoubleTap,
    enabled: !brailleVisible,
  });

  // ── Context value ─────────────────────────────────────────────────────────
  const navValue = useMemo(
    () => ({
      preChatIndex,
      preChatContactNumber,
      contactNumbers,
      numberedConversations,
      threadAction,
      brailleOpen,
      brailleVisible,
      historyFocusId,
      setPrechatIndex,
      setThreadAction,
      setBrailleOpen,
    }),
    [
      brailleOpen,
      brailleVisible,
      contactNumbers,
      historyFocusId,
      numberedConversations,
      preChatContactNumber,
      preChatIndex,
      threadAction,
    ],
  );

  const gestureBottom = "calc(4.25rem + env(safe-area-inset-bottom))";

  return (
    <A11yNavContext.Provider value={navValue}>
      {children}

      {!brailleVisible && <A11yFocusBar />}

      {brailleVisible && (
        <BrailleInput
          label={inThread ? "Мессеж бичих" : "Хайлт бичих"}
          enterVoice={inThread ? THREAD_ACTIVATE_VOICE.typing : undefined}
          value={inThread ? bridge.text : bridge.search}
          onChange={inThread ? bridge.setText : bridge.setSearch}
          onSend={
            inThread
              ? () => {
                  void bridge.sendText();
                  setBrailleOpen(false);
                }
              : undefined
          }
          onBack={() => {
            setBrailleOpen(false);
            playVoice("Буцлаа");
          }}
        />
      )}

      {!brailleVisible && (
        <div
          className="fixed inset-x-0 top-0 z-[60] touch-manipulation md:hidden"
          style={{ bottom: gestureBottom }}
          onTouchStart={(e) => {
            if (inThread && threadAction === "history") unlockHistoryAudio();
            onTouchStart(e);
          }}
          onTouchEnd={onTouchEnd}
          aria-hidden
        />
      )}
    </A11yNavContext.Provider>
  );
}
