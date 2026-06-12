"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useA11yChatBridge } from "@/lib/a11y-chat-bridge";
import { A11yNavContext, type ThreadAction } from "@/lib/a11y-nav-context";
import { a11ySpeak, a11yStopSpeak } from "@/lib/a11y-speak";
import { playVoice } from "@/lib/play-voice";
import { useA11yGestures } from "@/lib/use-a11y-gestures";
import { A11yFocusBar } from "./A11yFocusBar";
import { BrailleInput } from "./BrailleInput";

const THREAD_ACTIONS: ThreadAction[] = ["call", "voice", "typing"];
const THREAD_LABELS: Record<ThreadAction, string> = {
  call: "Дуудлага хийх",
  voice: "Дуут зурвас",
  typing: "Бичих",
};

/**
 * Pre-chat жагсаалт:
 *   index 0       → "Хайлт"
 *   index 1..N    → conversations[index-1]  (хайлт байвал results[index-1])
 */
export function A11yNavProvider({ children }: { children: ReactNode }) {
  const bridge = useA11yChatBridge();

  const [preChatIndex, setPrechatIndex] = useState(0);
  const [threadAction, setThreadAction] = useState<ThreadAction>("call");
  const [brailleOpen, setBrailleOpen] = useState(false);
  const spokeRef = useRef("");

  const inThread = !!bridge.routeConvId;
  const hasSearch = bridge.search.trim().length >= 2;
  const list = hasSearch ? bridge.searchResults : bridge.conversations.map((c) => c.peer);
  const listLen = list.length;

  const brailleVisible =
    brailleOpen &&
    (inThread
      ? threadAction === "typing"
      : preChatIndex === 0);

  // ── Announce helpers ─────────────────────────────────────────────────────
  const speakOnce = useCallback((text: string) => {
    if (spokeRef.current === text) return;
    spokeRef.current = text;
    a11ySpeak(text);
    window.setTimeout(() => { spokeRef.current = ""; }, 1400);
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
    const peer = list[preChatIndex - 1];
    speakOnce(
      peer
        ? `${preChatIndex}. ${peer.name ?? peer.email}`
        : "Жагсаалтын төгсгөл",
    );
  }, [bridge.search, list, preChatIndex, speakOnce]);

  const announceThread = useCallback(() => {
    const peer = bridge.activePeer?.name ?? "Чат";
    speakOnce(`${peer}. ${THREAD_LABELS[threadAction]}`);
  }, [bridge.activePeer?.name, speakOnce, threadAction]);

  useEffect(() => {
    if (brailleOpen) return;
    if (inThread) announceThread();
    else announcePreChat();
  }, [inThread, preChatIndex, threadAction, brailleOpen, announceThread, announcePreChat]);

  // Reset when leaving thread
  useEffect(() => {
    if (!inThread) {
      setThreadAction("call");
      setBrailleOpen(false);
    }
  }, [inThread]);

  // Clamp index when list shrinks
  useEffect(() => {
    if (preChatIndex > 0 && preChatIndex > listLen) {
      setPrechatIndex(Math.max(0, listLen));
    }
  }, [listLen, preChatIndex]);

  // ── Activate ──────────────────────────────────────────────────────────────
  const activateThread = useCallback(async () => {
    if (threadAction === "call") {
      playVoice("Дуудлага");
      await bridge.startCall();
    } else if (threadAction === "voice") {
      if (bridge.recording) {
        bridge.stopRecording();
        playVoice("Дуу");
      } else {
        await bridge.startRecording();
        playVoice("Дуу");
      }
    } else {
      setBrailleOpen(true);
      playVoice("Бичих");
    }
  }, [bridge, threadAction]);

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
      const conv = bridge.conversations[preChatIndex - 1];
      if (conv) {
        playVoice("Чаат руу орлоо");
        bridge.openChat(conv.id, conv.peer);
      }
    }
  }, [bridge, hasSearch, preChatIndex]);

  // ── Gesture handlers ─────────────────────────────────────────────────────
  const onSwipe = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (inThread) {
        if (dir === "left" || dir === "right") {
          setThreadAction((cur) => {
            const idx = THREAD_ACTIONS.indexOf(cur);
            const next =
              dir === "right"
                ? (idx + 1) % THREAD_ACTIONS.length
                : (idx - 1 + THREAD_ACTIONS.length) % THREAD_ACTIONS.length;
            return THREAD_ACTIONS[next]!;
          });
        }
        return;
      }

      // Pre-chat: UP/DOWN → navigate flat list
      if (dir === "up" || dir === "down") {
        const total = listLen + 1; // +1 for search item at index 0
        setPrechatIndex((i) =>
          dir === "up"
            ? (i - 1 + total) % total
            : (i + 1) % total,
        );
      }
    },
    [inThread, listLen],
  );

  const onTwoFingerSwipe = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (dir === "right") {
        // 2-хуруу баруун = буцах
        if (inThread) {
          bridge.closeChat();
          playVoice("Буцлаа");
        } else {
          a11yStopSpeak();
          a11ySpeak("Нүүр хуудас");
        }
      }
    },
    [bridge, inThread],
  );

  const onDoubleTap = useCallback(() => {
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
      threadAction,
      brailleOpen,
      brailleVisible,
      setPrechatIndex,
      setThreadAction,
      setBrailleOpen,
    }),
    [brailleOpen, brailleVisible, preChatIndex, threadAction],
  );

  const gestureBottom = "calc(4.25rem + env(safe-area-inset-bottom) + 5rem)";

  return (
    <A11yNavContext.Provider value={navValue}>
      {children}

      {!brailleVisible && <A11yFocusBar />}

      {brailleVisible && (
        <BrailleInput
          label={inThread ? "Мессеж бичих" : "Хайлт бичих"}
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
            a11ySpeak("Буцлаа");
          }}
        />
      )}

      {!brailleVisible && (
        <div
          className="fixed inset-x-0 top-0 z-[60] touch-manipulation md:hidden"
          style={{ bottom: gestureBottom }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-hidden
        />
      )}
    </A11yNavContext.Provider>
  );
}
