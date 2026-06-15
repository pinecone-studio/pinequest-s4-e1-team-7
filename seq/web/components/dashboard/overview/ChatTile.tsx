"use client";
import { BentoTile } from "./BentoTile";
import { BentoChatPreview } from "./BentoChatPreview";
import { OLIVE, NAVY, TILE_STYLE } from "./tileConsts";

export function ChatTile() {
  return (
    <BentoTile
      i={0} area="chat" href="/dashboard/translator"
      className="min-h-[260px] md:min-h-[340px]"
      style={TILE_STYLE}
    >
      <div className="flex h-full flex-col p-4 md:p-5">
        <div className="mb-3 flex shrink-0 items-start justify-between">
          <h2 className="text-[17px] font-black" style={{ color: "var(--text)" }}>
            Чат болон дуудлага хийх
          </h2>
          <span
            className="mt-0.5 shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{ background: OLIVE, color: NAVY }}
          >
            Эхлэх
          </span>
        </div>
        <div className="relative min-h-[170px] flex-1 overflow-hidden rounded-xl">
          <BentoChatPreview />
        </div>
      </div>
    </BentoTile>
  );
}
