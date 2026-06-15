"use client";
import { HandRaisedIcon, MicrophoneIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import { BentoTile } from "./BentoTile";
import { OLIVE, NAVY, TILE_STYLE } from "./tileConsts";

export function StripTile() {
  return (
    <BentoTile
      i={1} area="strip" href="/dashboard/translator"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border-c)",
        borderRight: "1px solid var(--border-c)",
        borderBottom: "1px solid var(--border-c)",
        borderLeft: "3px solid var(--olive)",
      }}
    >
      <div className="flex h-full items-center justify-between px-5 py-3">
        <HandRaisedIcon className="h-6 w-6 shrink-0" style={{ color: OLIVE }} />
        <div className="flex flex-1 items-center px-3">
          <h3
            className="text-[13px] font-black leading-snug md:text-[20px]"
            style={{ color: "var(--text)", paddingBottom: "0.15em" }}
          >
            Дохионы хэлнээс яриа руу сонсох
          </h3>
        </div>
        <span className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: OLIVE, color: NAVY }}>
          Эхлэх
        </span>
      </div>
    </BentoTile>
  );
}

export function VoiceTile() {
  return (
    <BentoTile i={4} area="voice" href="/dashboard/voice" style={TILE_STYLE}>
      <div className="flex h-full flex-col justify-between px-4 py-4 md:flex-row md:items-center md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <MicrophoneIcon className="h-5 w-5 shrink-0 md:h-6 md:w-6" style={{ color: OLIVE }} />
          <div className="min-w-0">
            <h3
              className="text-[13px] font-black leading-snug md:text-[20px]"
              style={{ color: "var(--text)", paddingBottom: "0.15em" }}
            >
              Ярианаас бичвэр болгох
            </h3>
            <p className="hidden text-[11px] font-medium md:block" style={{ color: "var(--text-3)" }}>
              Монгол дохионы хэлний зураг үзэх
            </p>
          </div>
        </div>
        <span
          className="mt-3 self-start rounded-full px-3 py-1.5 text-[11px] font-bold md:ml-4 md:mt-0 md:shrink-0"
          style={{ background: OLIVE, color: NAVY }}
        >
          Эхлэх
        </span>
      </div>
    </BentoTile>
  );
}

export function DictTile() {
  return (
    <BentoTile i={5} area="dict" href="/dashboard/dict" style={TILE_STYLE}>
      <div className="flex h-full flex-col justify-between px-4 py-4 md:flex-row md:items-center md:px-5">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="h-6 w-6 shrink-0" style={{ color: OLIVE }} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--text-3)" }}>
              Толь бичиг
            </p>
            <p className="text-[22px] font-black leading-none md:text-[28px]" style={{ color: "var(--text)" }}>
              А-Я болон тоо
            </p>
          </div>
        </div>
        <span
          className="mt-3 self-start rounded-full px-3 py-1.5 text-[11px] font-bold md:mt-0 md:shrink-0"
          style={{ background: OLIVE, color: NAVY }}
        >
          Нээх
        </span>
      </div>
    </BentoTile>
  );
}
