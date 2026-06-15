"use client";

import { useState } from "react";
import { SignLetterCard } from "./SignLetterCard";
import { SignViewer, type SignEntry } from "./SignViewer";

type Props = {
  text: string;
  signMap: Map<string, string>;
};

export function SignStrip({ text, signMap }: Props) {
  const letters = text.toUpperCase().split("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (letters.length === 0) return null;

  // Build the list of viewable (image-backed) letters and map each rendered
  // card to its position within that list so prev/next skip spaces.
  const viewable: SignEntry[] = [];
  const cardViewIndex = letters.map((letter) => {
    const url = letter === " " ? undefined : signMap.get(letter);
    if (!url) return -1;
    viewable.push({ letter, url });
    return viewable.length - 1;
  });

  return (
    <>
      <div
        className="-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {letters.map((letter, i) => {
          const url = letter === " " ? undefined : signMap.get(letter);
          const vIndex = cardViewIndex[i];
          return (
            <SignLetterCard
              key={i}
              letter={letter}
              url={url}
              size={60}
              onClick={vIndex >= 0 ? () => setViewerIndex(vIndex) : undefined}
            />
          );
        })}
      </div>

      {viewerIndex !== null && viewable[viewerIndex] && (
        <SignViewer
          entries={viewable}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
        />
      )}
    </>
  );
}
