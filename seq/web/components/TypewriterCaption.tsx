"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  /** When true, show full text immediately (lower CPU, no repeat typing). */
  instant?: boolean;
  speedMs?: number;
};

export function TypewriterCaption({
  text,
  instant = true,
  speedMs = 24,
}: Props) {
  const [shown, setShown] = useState(text);
  const targetRef = useRef(text);
  const idxRef = useRef(text.length);

  useEffect(() => {
    targetRef.current = text;
    if (instant) {
      setShown(text);
      idxRef.current = text.length;
      return;
    }
    if (!text.startsWith(shown)) {
      setShown("");
      idxRef.current = 0;
    }
  }, [text, instant, shown]);

  useEffect(() => {
    if (instant) return;
    const id = setInterval(() => {
      const target = targetRef.current;
      if (idxRef.current >= target.length) return;
      idxRef.current += 1;
      setShown(target.slice(0, idxRef.current));
    }, speedMs);
    return () => clearInterval(id);
  }, [instant, speedMs]);

  return (
    <div className="rounded-xl bg-black/70 px-5 py-4 text-xl leading-relaxed text-white shadow-xl backdrop-blur">
      <span>{shown}</span>
      {!instant && (
        <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-white align-middle" />
      )}
    </div>
  );
}
