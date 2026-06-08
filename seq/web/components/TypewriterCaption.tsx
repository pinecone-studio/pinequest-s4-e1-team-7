"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  instant?: boolean;
  charMs?: number;
  wordPauseMs?: number;
  /** box = card UI, subtitle = кино subtitle (no background) */
  variant?: "box" | "subtitle";
  /** subtitle variant өнгө */
  tone?: "white" | "yellow";
};

export function TypewriterCaption({
  text,
  instant = false,
  charMs = 22,
  wordPauseMs = 48,
  variant = "box",
  tone = "white",
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

    if (posRef.current < targetRef.current.length) schedule(charMs);
    return clearTimer;
  }, [text, instant, charMs, wordPauseMs]);

  const isTyping = !instant && text && displayed.length < text.length;

  const subtitleClass =
    tone === "yellow"
      ? "text-[#FFE566] text-[17px] font-semibold leading-snug tracking-wide sm:text-[19px]"
      : "text-white/90 text-[15px] font-medium leading-snug sm:text-[17px]";

  const shadowStyle = {
    textShadow:
      "0 1px 2px #000, 0 2px 8px #000, 0 0 24px rgba(0,0,0,0.85), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
  };

  const content = (
    <>
      <span>{displayed}</span>
      {isTyping && (
        <span
          aria-hidden
          className={`ml-0.5 inline-block h-[1em] w-[2px] animate-pulse ${
            tone === "yellow" ? "bg-[#FFE566]" : "bg-white"
          }`}
        />
      )}
    </>
  );

  if (variant === "subtitle") {
    if (!text) return null;
    return (
      <p
        className={`max-w-[min(92vw,36rem)] whitespace-pre-wrap break-words [text-wrap:balance] ${subtitleClass}`}
        style={shadowStyle}
      >
        {content}
      </p>
    );
  }

  return (
    <div className="relative min-h-[3.5rem] overflow-hidden rounded-xl border border-white/10 bg-black/70 px-5 py-4 text-xl leading-relaxed text-white shadow-xl backdrop-blur">
      <p className="whitespace-pre-wrap break-words">
        {text ? content : <span className="text-zinc-500">...</span>}
      </p>
    </div>
  );
}
