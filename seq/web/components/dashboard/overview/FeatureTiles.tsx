"use client";
import { VideoCameraIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { BentoTile } from "./BentoTile";
import { OLIVE, NAVY, TILE_STYLE } from "./tileConsts";

const BRAILLE = [true, false, true, true, false, false];

export function VcallTile() {
  return (
    <BentoTile i={2} area="vcall" href="/dashboard/call" className="min-h-[220px]" style={TILE_STYLE}>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <VideoCameraIcon className="h-8 w-8" style={{ color: OLIVE }} />
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(246,201,69,0.12)", border: "1px solid rgba(246,201,69,0.28)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: OLIVE }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: OLIVE, letterSpacing: "0.1em" }}>LIVE</span>
          </span>
        </div>
        <div>
          <h3 className="text-[28px] font-black uppercase leading-none" style={{ color: "var(--text)" }}>
            ВИДЕО болон ДУУДЛАГА
          </h3>
          <p className="font-black uppercase" style={{ color: "var(--text-2)", paddingBottom: "0.15em" }}>хийх</p>
          <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--text-3)" }}>Шууд холбогдох</p>
          <span
            className="mt-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-bold"
            style={{ background: OLIVE, color: NAVY }}
          >
            Эхлэх
          </span>
        </div>
      </div>
    </BentoTile>
  );
}

export function KboardTile() {
  return (
    <BentoTile i={3} area="kboard" href="/dashboard/voice" className="min-h-[220px]" style={TILE_STYLE}>
      <div className="flex h-full flex-col justify-between p-5">
        <EyeSlashIcon className="h-8 w-8" style={{ color: OLIVE }} />
        <div>
          <h3 className="text-[26px] font-black uppercase leading-none" style={{ color: "var(--text)" }}>
            Брайль
          </h3>
          <p className="font-black uppercase" style={{ color: "var(--text-2)", paddingBottom: "0.15em" }}>ҮСЭГ</p>
          <div className="mt-3 grid grid-cols-2 gap-[5px]" style={{ width: 32 }}>
            {BRAILLE.map((filled, j) => (
              <div
                key={j}
                style={{ width: 9, height: 9, borderRadius: "50%", background: filled ? OLIVE : "var(--border-c)" }}
              />
            ))}
          </div>
          <span
            className="mt-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-bold"
            style={{ background: OLIVE, color: NAVY }}
          >
            Эхлэх
          </span>
        </div>
      </div>
    </BentoTile>
  );
}
