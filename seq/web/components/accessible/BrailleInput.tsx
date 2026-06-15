"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { charFromMask, maskFromSet, type BrailleDots } from "@/lib/braille-mn";
import { playVoice, stopVoice } from "@/lib/play-voice";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend?: () => void;
  onBack: () => void;
  label?: string;
  /** Нээгдэх үед тоглуулах заавар (preload дуусаагүй байсан ч ажиллана) */
  enterVoice?: string;
};

const SWIPE_THRESHOLD = 50;

/**
 * Брайль гар — утасыг ХӨНДЛӨН барьж ашиглана.
 *
 * Landscape layout (зурган дээрх шиг):
 *   [ Бүс 4 (зүүн дээд)  ] [ Бүс 1 (баруун дээд)  ]
 *   [ Бүс 5 (зүүн дунд)  ] [ Бүс 2 (баруун дунд)  ]
 *   [ Бүс 6 (зүүн доод)  ] [ Бүс 3 (баруун доод)  ]
 *   ↑ зүүн гар (4,5,6)       ↑ баруун гар (1,2,3)
 *
 * Chorded multi-touch: олон бүс зэрэг дарна → бүгд хуруугаа авах үед decode.
 *
 * Swipe (landscape координат — 1 хуруу):
 *   дээш  → зай
 *   доош  → backspace
 *   баруун → илгээх (хоосон бол буцах)
 *   зүүн  → буцах
 */
export function BrailleInput({
  value,
  onChange,
  onSend,
  onBack,
  label = "Брайль",
  enterVoice,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visualDots, setVisualDots] = useState<Set<BrailleDots>>(new Set());
  // true = OS rotated (orientation lock succeeded); false = CSS rotation fallback
  const [isLandscape, setIsLandscape] = useState(
    () => typeof window !== "undefined" && window.innerWidth > window.innerHeight,
  );

  const touchedDots = useRef<Set<BrailleDots>>(new Set());
  const touchStarts = useRef<Map<number, { x: number; y: number }>>(new Map());
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onSendRef = useRef(onSend);
  const onBackRef = useRef(onBack);
  const isLandscapeRef = useRef(isLandscape);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSendRef.current = onSend;
    onBackRef.current = onBack;
  }, [onChange, onSend, onBack]);

  useEffect(() => {
    isLandscapeRef.current = isLandscape;
  }, [isLandscape]);

  useEffect(() => {
    if (!enterVoice) return;
    const t = window.setTimeout(() => playVoice(enterVoice), 80);
    return () => clearTimeout(t);
  }, [enterVoice]);

  // Orientation lock + fallback CSS rotation
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    // Try to lock OS to landscape so the screen physically rotates
    (screen.orientation as { lock?: (t: string) => Promise<void> })
      .lock?.("landscape")
      .catch(() => {
        // Lock not supported (iOS etc.) → CSS rotation fallback stays
      });

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      (screen.orientation as { unlock?: () => void }).unlock?.();
      stopVoice();
    };
  }, []);

  /**
   * Touch цэгийг брайль бүс (dot) рүү хөрвүүлнэ.
   *
   * isLandscape=true (OS rotation): дэлгэц физикийн хувьд landscape →
   *   relX (зүүн↔баруун) = column, relY (дээд↔доод) = row → шууд mapping.
   *
   * isLandscape=false (CSS rotate 90deg fallback): портрайт дэлгэцийг
   *   CSS-ээр 90° эргүүлсэн тул координатуудыг хөрвүүлэх шаардлагатай:
   *   • Portrait-ийн X тэнхлэг → landscape-ийн ROW (дээд↔доод)
   *   • Portrait-ийн Y тэнхлэг → landscape-ийн COLUMN (зүүн↔баруун):
   *       Y > 0.5 (доод тал) = landscape-ийн зүүн тал (col 0 = 4,5,6)
   *       Y < 0.5 (дээд тал) = landscape-ийн баруун тал (col 1 = 1,2,3)
   */
  const getDotFromPoint = useCallback(
    (cx: number, cy: number): BrailleDots | null => {
      const el = containerRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const rx = (cx - r.left) / r.width;
      const ry = (cy - r.top) / r.height;
      if (rx < 0 || rx > 1 || ry < 0 || ry > 1) return null;

      let col: number, row: number;
      if (isLandscape) {
        // OS rotation: дэлгэц landscape → шууд mapping
        col = rx < 0.5 ? 0 : 1;
        row = ry < 1 / 3 ? 0 : ry < 2 / 3 ? 1 : 2;
      } else {
        // CSS rotate(-90deg CCW) fallback (утсыг CW барих = home баруун):
        //   Portrait Y том (доод, ry>0.5) = landscape зүүн col 0 (4,5,6)
        //   Portrait Y жижиг (дээд, ry<0.5) = landscape баруун col 1 (1,2,3)
        //   Portrait X жижиг (зүүн, rx<1/3) = landscape дээд row 0
        //   Portrait X том (баруун, rx>2/3)  = landscape доод row 2
        col = ry > 0.5 ? 0 : 1;
        row = rx < 1 / 3 ? 0 : rx < 2 / 3 ? 1 : 2;
      }
      // col 0 → 4,5,6; col 1 → 1,2,3
      return (col === 0 ? 4 + row : 1 + row) as BrailleDots;
    },
    [isLandscape],
  );

  const commitDots = useCallback((dots: Set<BrailleDots>) => {
    if (dots.size === 0) return;
    const ch = charFromMask(maskFromSet(dots));
    if (ch === null) {
      // Танигдаагүй хослол — дуугүй өнгөрнө
    } else {
      onChangeRef.current(valueRef.current + ch.toLowerCase());
      playVoice(ch);
    }
  }, []);

  // Native touch events (prevent scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onStart(e: TouchEvent) {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i)!;
        touchStarts.current.set(t.identifier, { x: t.clientX, y: t.clientY });
        const dot = getDotFromPoint(t.clientX, t.clientY);
        if (dot && !touchedDots.current.has(dot)) {
          touchedDots.current.add(dot);
          setVisualDots(new Set(touchedDots.current));
        }
      }
    }

    function onEnd(e: TouchEvent) {
      e.preventDefault();

      let maxMove = 0;
      let swipeDx = 0;
      let swipeDy = 0;
      const fingerCount = touchStarts.current.size;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i)!;
        const s = touchStarts.current.get(t.identifier);
        if (s) {
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxMove) {
            maxMove = dist;
            swipeDx = dx;
            swipeDy = dy;
          }
          touchStarts.current.delete(t.identifier);
        }
      }

      if (e.touches.length > 0) return;

      const snap = new Set(touchedDots.current);
      touchedDots.current.clear();
      setVisualDots(new Set());

      if (maxMove >= SWIPE_THRESHOLD) {
        if (fingerCount === 1) {
          const landscape = isLandscapeRef.current;
          // CSS -90deg: landscape X (баруун/зүүн) = portrait Y, landscape Y = portrait X
          const effH = landscape ? swipeDx : -swipeDy;
          const effV = landscape ? swipeDy : swipeDx;
          const effAH = Math.abs(effH);
          const effAV = Math.abs(effV);
          const text = valueRef.current;

          if (effAH > effAV) {
            // Хэвтээ swipe (утасны дээш/доош): зай, хасах
            if (effH > 0) {
              onChangeRef.current(`${text} `);
              playVoice("зай");
            } else if (text.length > 0) {
              onChangeRef.current(text.slice(0, -1));
              playVoice("хасах");
            }
          } else if (effV > 0) {
            // Босоо swipe (утасны баруун): илгээх
            if (text.trim() && onSendRef.current) {
              onSendRef.current();
            } else {
              onBackRef.current();
              playVoice("Буцлаа");
            }
          } else {
            // Босоо swipe (утасны зүүн): гарах
            onBackRef.current();
            playVoice("Буцлаа");
          }
        }
        return;
      }

      commitDots(snap);
    }

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    el.addEventListener("touchcancel", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [commitDots, getDotFromPoint]);

  // OS rotation succeeded → normal full-screen; otherwise → CSS rotation trick
  const containerStyle: React.CSSProperties = isLandscape
    ? { background: "var(--bg)" }
    : {
        background: "var(--bg)",
        width: "100dvh",
        height: "100dvw",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-90deg)",
        transformOrigin: "center center",
      };

  const ZONES: { dot: BrailleDots; label: string }[] = [
    { dot: 4, label: "Зүүн дээд" },
    { dot: 1, label: "Баруун дээд" },
    { dot: 5, label: "Зүүн дунд" },
    { dot: 2, label: "Баруун дунд" },
    { dot: 6, label: "Зүүн доод" },
    { dot: 3, label: "Баруун доод" },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed z-[90] select-none touch-manipulation"
      style={isLandscape ? { inset: 0, ...containerStyle } : containerStyle}
      role="group"
      aria-label={label}
    >
      {/* Бичиж буй текст */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-center px-6"
        style={{
          background: "color-mix(in srgb, var(--surface) 95%, transparent)",
          borderBottom: "1px solid var(--border-c)",
        }}
        aria-live="polite"
      >
        {value ? (
          <p className="truncate text-base font-semibold" style={{ color: "var(--text)" }}>
            {value}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Хуруугаа зэрэг дарж үсэг бичнэ
          </p>
        )}
      </div>

      {/* 2 × 3 grid */}
      <div
        className="absolute inset-x-0 bottom-0 grid"
        style={{
          top: "2.5rem",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gridTemplateAreas: `"z4 z1" "z5 z2" "z6 z3"`,
        }}
      >
        {ZONES.map(({ dot, label: zLabel }) => {
          const on = visualDots.has(dot);
          return (
            <div
              key={dot}
              style={{
                gridArea: `z${dot}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: on
                  ? "color-mix(in srgb, var(--olive) 32%, var(--surface))"
                  : "var(--surface)",
                border: `2px solid ${on ? "var(--olive)" : "var(--border-c)"}`,
                transition: "background 0.06s",
              }}
              aria-label={`Бүс ${dot} — ${zLabel}`}
            >
              <span
                style={{
                  fontSize: "clamp(2.5rem, 14vw, 6rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: on ? "var(--olive)" : "var(--text)",
                  userSelect: "none",
                }}
              >
                {dot}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
