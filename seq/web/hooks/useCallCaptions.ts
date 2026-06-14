"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  appendDetectedWord,
  shouldAcceptWord,
} from "@/lib/caption-utils";

export type CaptionSpeaker = "me" | "them";

export type CaptionHistoryEntry = {
  id: string;
  speaker: CaptionSpeaker;
  text: string;
  at: number;
};

type ActiveCaption = {
  speaker: CaptionSpeaker;
  text: string;
};

const SUBTITLE_MAX_CHARS = 72;
const SUBTITLE_IDLE_MS = 3200;

let entrySeq = 0;
const nextId = () => `cap-${++entrySeq}-${Date.now()}`;

export function useCallCaptions(
  onCommit?: (speaker: CaptionSpeaker, text: string) => void,
) {
  const [active, setActive] = useState<ActiveCaption | null>(null);
  const [history, setHistory] = useState<CaptionHistoryEntry[]>([]);

  const myFullRef = useRef("");
  const theirFullRef = useRef("");
  const lastMyWordRef = useRef<{ word: string; at: number } | null>(null);
  const activeRef = useRef<ActiveCaption | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const commitToHistory = useCallback(
    (speaker: CaptionSpeaker, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setHistory((prev) => [
        ...prev,
        { id: nextId(), speaker, text: trimmed, at: Date.now() },
      ]);
      onCommitRef.current?.(speaker, trimmed);
    },
    []
  );

  const flushActive = useCallback(() => {
    const cur = activeRef.current;
    if (!cur?.text.trim()) {
      activeRef.current = null;
      setActive(null);
      return;
    }
    commitToHistory(cur.speaker, cur.text);
    activeRef.current = null;
    setActive(null);
  }, [commitToHistory]);

  const scheduleIdleFlush = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      flushActive();
    }, SUBTITLE_IDLE_MS);
  }, [clearIdleTimer, flushActive]);

  const pushWord = useCallback(
    (speaker: CaptionSpeaker, word: string) => {
      const w = word.trim();
      if (!w) return;

      const cur = activeRef.current;

      if (cur && cur.speaker !== speaker) {
        commitToHistory(cur.speaker, cur.text);
        activeRef.current = null;
        setActive(null);
      }

      const base = activeRef.current?.speaker === speaker ? activeRef.current.text : "";
      let next = appendDetectedWord(base, w);

      if (next.length > SUBTITLE_MAX_CHARS) {
        if (base.trim()) commitToHistory(speaker, base);
        next = w;
      }

      const updated: ActiveCaption = { speaker, text: next };
      activeRef.current = updated;
      setActive(updated);
      scheduleIdleFlush();
    },
    [commitToHistory, scheduleIdleFlush]
  );

  const onMyWord = useCallback(
    (word: string) => {
      const now = Date.now();
      if (!shouldAcceptWord(word, lastMyWordRef.current, now)) {
        return myFullRef.current;
      }
      lastMyWordRef.current = { word, at: now };
      myFullRef.current = appendDetectedWord(myFullRef.current, word);
      pushWord("me", word);
      return myFullRef.current;
    },
    [pushWord]
  );

  const onTheirCaption = useCallback(
    (full: string) => {
      const prev = theirFullRef.current;
      if (full === prev) return;

      let delta = "";
      if (full.startsWith(prev)) {
        delta = full.slice(prev.length).trim();
      } else {
        delta = full.trim();
      }
      theirFullRef.current = full;

      if (delta) pushWord("them", delta);
    },
    [pushWord]
  );

  const showPhrase = useCallback(
    (speaker: CaptionSpeaker, text: string) => {
      const t = text.trim();
      if (!t) return;

      const cur = activeRef.current;
      if (cur && cur.speaker !== speaker) {
        commitToHistory(cur.speaker, cur.text);
      }

      const updated: ActiveCaption = { speaker, text: t };
      activeRef.current = updated;
      setActive(updated);
      scheduleIdleFlush();
    },
    [commitToHistory, scheduleIdleFlush]
  );

  const onMyVoiceInterim = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      clearIdleTimer();

      const cur = activeRef.current;
      if (cur && cur.speaker !== "me") {
        commitToHistory(cur.speaker, cur.text);
      }

      const updated: ActiveCaption = { speaker: "me", text: t };
      activeRef.current = updated;
      setActive(updated);
    },
    [clearIdleTimer, commitToHistory]
  );

  const onMyVoiceFinal = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return "";
      showPhrase("me", t);
      return t;
    },
    [showPhrase]
  );

  const onTheirPhrase = useCallback(
    (text: string) => {
      showPhrase("them", text);
    },
    [showPhrase]
  );

  const reset = useCallback(() => {
    clearIdleTimer();
    activeRef.current = null;
    setActive(null);
    setHistory([]);
    myFullRef.current = "";
    theirFullRef.current = "";
    lastMyWordRef.current = null;
  }, [clearIdleTimer]);

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

  return {
    active,
    history,
    onMyWord,
    onTheirCaption,
    onMyVoiceInterim,
    onMyVoiceFinal,
    onTheirPhrase,
    reset,
  };
}
