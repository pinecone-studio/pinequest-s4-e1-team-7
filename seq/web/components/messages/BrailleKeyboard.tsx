"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const BRAILLE_MAP: Record<string, string> = {
  "1": "а",
  "12": "б",
  "2456": "в",
  "1245": "г",
  "145": "д",
  "15": "е",
  "246": "ё",
  "245": "ж",
  "1356": "з",
  "24": "и",
  "12456": "й",
  "13": "к",
  "123": "л",
  "134": "м",
  "1345": "н",
  "135": "о",
  "1236": "ө",
  "1234": "п",
  "1235": "р",
  "234": "с",
  "2345": "т",
  "136": "у",
  "1456": "ү",
  "124": "ф",
  "125": "х",
  "14": "ц",
  "12345": "ч",
  "156": "ш",
  "1346": "щ",
  "12346": "ъ",
  "2346": "ы",
  "23456": "ь",
  "26": "э",
  "1256": "ю",
  "1246": "я",
  "": " ",
};

const DOTS: [number, number][] = [
  [1, 4],
  [2, 5],
  [3, 6],
];

type Props = {
  onChar: (c: string) => void;
  onDelete: () => void;
};

export function BrailleKeyboard({ onChar, onDelete }: Props) {
  const [active, setActive] = useState<Set<number>>(new Set());
  const key = [...active].sort((a, b) => a - b).join("");
  const preview = BRAILLE_MAP[key];

  const toggle = (dot: number) =>
    setActive((p) => {
      const n = new Set(p);
      n.has(dot) ? n.delete(dot) : n.add(dot);
      return n;
    });

  const commit = () => {
    if (preview !== undefined) {
      onChar(preview);
      setActive(new Set());
    }
  };

  return (
    <div
      className="mb-2 rounded-2xl p-3"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-c)",
      }}
    >
      <div className="mb-3 mx-auto w-fit space-y-2">
        {DOTS.map(([left, right]) => (
          <div key={left} className="flex gap-3">
            {[left, right].map((dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => toggle(dot)}
                className={cn(
                  "h-12 w-12 rounded-full text-[13px] font-bold transition-all",
                  active.has(dot) ? "scale-110 text-[#0d1e35]" : "opacity-70",
                )}
                style={{
                  background: active.has(dot)
                    ? "var(--olive)"
                    : "var(--surface)",
                  border: "2px solid var(--border-c)",
                }}
              >
                {dot}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-2 text-center">
        <span
          className="text-[28px] font-extrabold"
          style={{ color: "var(--text)" }}
        >
          {preview !== undefined
            ? preview === " "
              ? "␣"
              : preview.toUpperCase()
            : "?"}
        </span>
        <span className="ml-2 text-[11px]" style={{ color: "var(--text-3)" }}>
          {[...active].sort((a, b) => a - b).join(",") || "—"}
        </span>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={commit}
          disabled={preview === undefined}
          className="rounded-xl px-4 py-2 text-[14px] font-bold disabled:opacity-40"
          style={{ background: "var(--olive)", color: "#0d1e35" }}
        >
          Нэмэх
        </button>
        <button
          type="button"
          onClick={() => setActive(new Set())}
          className="rounded-xl px-4 py-2 text-[14px]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
            color: "var(--text)",
          }}
        >
          Цэвэрлэх
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl px-4 py-2 text-[14px]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-c)",
            color: "var(--text)",
          }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
