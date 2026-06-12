"use client";

import { useCallback, useRef, type TouchList as RTouchList } from "react";

export type SwipeDir = "left" | "right" | "up" | "down";

type Options = {
  /** 1 хуруу swipe */
  onSwipe?: (dir: SwipeDir) => void;
  /** 2 хуруу swipe */
  onTwoFingerSwipe?: (dir: SwipeDir) => void;
  /** 1 хуруу давхар товших */
  onDoubleTap?: () => void;
  /** 2 хуруу давхар товших */
  onTwoFingerDoubleTap?: () => void;
  threshold?: number;
  tapMs?: number;
  enabled?: boolean;
};

function avgPoint(list: RTouchList): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (let i = 0; i < list.length; i++) {
    const t = list.item(i)!;
    x += t.clientX;
    y += t.clientY;
  }
  return { x: x / list.length, y: y / list.length };
}

/**
 * Gesture hook — харааны бэрхшээлтэй горимд ашиглах.
 * onTouchStart + onTouchEnd-ийг container div-д тавина.
 */
export function useA11yGestures({
  onSwipe,
  onTwoFingerSwipe,
  onDoubleTap,
  onTwoFingerDoubleTap,
  threshold = 48,
  tapMs = 320,
  enabled = true,
}: Options) {
  const startRef = useRef<{
    point: { x: number; y: number };
    fingers: number;
    t: number;
  } | null>(null);

  const lastOneTapAt = useRef(0);
  const lastTwoTapAt = useRef(0);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      const n = e.touches.length;
      if (n !== 1 && n !== 2) return;
      startRef.current = {
        point: avgPoint(e.touches),
        fingers: n,
        t: Date.now(),
      };
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !startRef.current) return;
      if (e.touches.length > 0) return;

      const start = startRef.current;
      startRef.current = null;

      const end =
        e.changedTouches.length > 0
          ? avgPoint(e.changedTouches)
          : start.point;

      const dx = end.x - start.point.x;
      const dy = end.y - start.point.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const elapsed = Date.now() - start.t;

      const isSwipe = Math.max(adx, ady) >= threshold;

      if (!isSwipe && elapsed < tapMs) {
        const now = Date.now();
        if (start.fingers === 1 && onDoubleTap) {
          if (now - lastOneTapAt.current < 380) {
            lastOneTapAt.current = 0;
            onDoubleTap();
          } else {
            lastOneTapAt.current = now;
          }
        } else if (start.fingers === 2 && onTwoFingerDoubleTap) {
          if (now - lastTwoTapAt.current < 440) {
            lastTwoTapAt.current = 0;
            onTwoFingerDoubleTap();
          } else {
            lastTwoTapAt.current = now;
          }
        }
        return;
      }

      if (!isSwipe) return;

      const dir: SwipeDir =
        adx > ady
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";

      if (start.fingers === 2) onTwoFingerSwipe?.(dir);
      else onSwipe?.(dir);
    },
    [enabled, onDoubleTap, onSwipe, onTwoFingerDoubleTap, onTwoFingerSwipe, tapMs, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
