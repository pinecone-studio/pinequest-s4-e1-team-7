"use client";
import Image from "next/image";
import { VideoCameraIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { BentoTile } from "./BentoTile";
import { OLIVE, NAVY, TILE_STYLE } from "./tileConsts";


export function VcallTile() {
  return (
    <BentoTile i={2} area="vcall" href="/dashboard/call" className="min-h-[220px]" style={TILE_STYLE}>
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <VideoCameraIcon className="h-8 w-8" style={{ color: OLIVE }} />
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(246,201,69,0.12)", border: "1px solid rgba(246,201,69,0.28)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: OLIVE }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: OLIVE, letterSpacing: "0.1em" }}>LIVE</span>
          </span>
        </div>
        <div className="relative mb-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-[#f0f0f0]">
          <Image
            src="/images/home-videocall.png"
            alt="Video Call UI"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <h3 className="text-[26px] font-black uppercase leading-none" style={{ color: "var(--text)" }}>
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
      <div className="flex h-full flex-col p-5">
        <div className="mb-3">
          <EyeSlashIcon className="h-8 w-8" style={{ color: OLIVE }} />
        </div>
        <div className="relative mb-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
          <Image
            src="/images/home-braille.png"
            alt="Mongolian Braille Alphabet"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <h3 className="text-[26px] font-black uppercase leading-none" style={{ color: "var(--text)" }}>
            Брайль
          </h3>
          <p className="font-black uppercase" style={{ color: "var(--text-2)", paddingBottom: "0.15em" }}>ҮСЭГ</p>
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
