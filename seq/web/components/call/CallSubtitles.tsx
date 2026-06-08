"use client";

import { TypewriterCaption } from "@/components/TypewriterCaption";

type Props = {
  myText: string;
  theirText: string;
};

/** Кино subtitle — видео дээр шууд, хайрцаггүй */
export function CallSubtitles({ myText, theirText }: Props) {
  if (!myText && !theirText) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex flex-col items-center gap-1.5 px-6 text-center"
      style={{ bottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}
    >
      {theirText && (
        <TypewriterCaption
          variant="subtitle"
          tone="white"
          text={theirText}
          charMs={14}
          wordPauseMs={24}
        />
      )}
      {myText && (
        <TypewriterCaption
          variant="subtitle"
          tone="yellow"
          text={myText}
          charMs={14}
          wordPauseMs={24}
        />
      )}
    </div>
  );
}
