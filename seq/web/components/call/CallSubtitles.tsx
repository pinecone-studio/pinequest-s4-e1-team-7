"use client";

import { TypewriterCaption } from "@/components/TypewriterCaption";
import type { CaptionSpeaker } from "@/hooks/useCallCaptions";

type Props = {
  speaker: CaptionSpeaker | null;
  text: string;
  /** desktop sidebar байвал subtitle-ийг дээшлүүлнэ */
  hasHistory?: boolean;
  /** mobile = камерын доод ирмэг дээр */
  layout?: "mobile" | "desktop";
};

/** Нэг идэвхтэй subtitle — тодорхой урт, дараа нь алга болно */
export function CallSubtitles({
  speaker,
  text,
  hasHistory = false,
  layout = "desktop",
}: Props) {
  if (!text) return null;

  if (layout === "mobile") {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center px-4 text-center">
        <TypewriterCaption
          variant="subtitle"
          tone={speaker === "me" ? "yellow" : "white"}
          text={text}
          charMs={12}
          wordPauseMs={20}
        />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-30 hidden justify-center px-6 text-center md:right-[min(34vw,280px)] md:flex ${
        hasHistory ? "md:bottom-[calc(8rem+env(safe-area-inset-bottom))]" : ""
      }`}
    >
      <TypewriterCaption
        variant="subtitle"
        tone={speaker === "me" ? "yellow" : "white"}
        text={text}
        charMs={12}
        wordPauseMs={20}
      />
    </div>
  );
}
