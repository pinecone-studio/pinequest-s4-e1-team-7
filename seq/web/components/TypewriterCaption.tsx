"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  /** When true, show full text immediately (no animation). */
  instant?: boolean;
  /** ms per character */
  charMs?: number;
  /** extra pause after space (word boundary) */
  wordPauseMs?: number;
};

export function TypewriterCaption({
  text,
  instant = false,
  charMs = 22,
  wordPauseMs = 48,
}: Props) {
  const [displayed, setDisplayed] = useState(instant ? text : "");
  const targetRef = useRef(text);
  const posRef = useRef(instant ? text.length : 0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    targetRef.current = text;

    if (instant) {
      setDisplayed(text);
      posRef.current = text.length;
      return;
    }

    if (!text) {
      setDisplayed("");
      posRef.current = 0;
      return;
    }

    // Append-only: keep already typed prefix; full replace → restart
    setDisplayed((prev) => {
      if (text.startsWith(prev)) {
        posRef.current = prev.length;
        return prev;
      }
      posRef.current = 0;
      return "";
    });
  }, [text, instant]);

  useEffect(() => {
    if (instant) return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = (delay: number) => {
      clearTimer();
      timerRef.current = setTimeout(tick, delay);
    };

    const tick = () => {
      if (!mountedRef.current) return;

      const target = targetRef.current;
      const pos = posRef.current;

      if (pos >= target.length) return;

      const nextPos = pos + 1;
      posRef.current = nextPos;
      setDisplayed(target.slice(0, nextPos));

      if (nextPos < target.length) {
        const ch = target[nextPos - 1];
        schedule(ch === " " ? charMs + wordPauseMs : charMs);
      }
    };

    if (posRef.current < targetRef.current.length) {
      schedule(charMs);
    }

    return clearTimer;
  }, [text, instant, charMs, wordPauseMs]);

  const isEmpty = !text;
  const isTyping = !instant && !isEmpty && displayed.length < text.length;

  return (
    <div className="relative min-h-[3.5rem] overflow-hidden rounded-xl border border-white/10 bg-black/70 px-5 py-4 text-xl leading-relaxed text-white shadow-xl backdrop-blur">
      <p className="whitespace-pre-wrap break-words">
        {isEmpty ? (
          <span className="text-zinc-500">...</span>
        ) : (
          <>
            <span>{displayed}</span>
            {isTyping && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-violet-400"
              />
            )}
          </>
        )}
      </p>
    </div>
  );
}
