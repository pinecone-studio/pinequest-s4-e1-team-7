/** Tab харагдаж байгаа эсэхийг шалгана. */
export function isTabVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

/**
 * Dynamic-interval poller. Tab нуугдахад зогсоно, харагдахад нэг удаа ажиллана.
 * getDelayMs() → null бол polling унтрана.
 */
export function createAdaptivePoller(
  fn: () => void | Promise<void>,
  getDelayMs: () => number | null,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const scheduleNext = () => {
    stop();
    const delay = getDelayMs();
    if (delay == null || !isTabVisible()) return;
    timer = setTimeout(() => {
      void Promise.resolve(fn()).finally(scheduleNext);
    }, delay);
  };

  const poke = () => {
    if (!isTabVisible()) return;
    void Promise.resolve(fn());
  };

  const start = () => {
    poke();
    scheduleNext();
  };

  const onVisibility = () => {
    if (isTabVisible()) start();
    else stop();
  };

  return { start, stop, poke, onVisibility };
}

/** Чат хуудас — идэвхтэй thread */
export const CHAT_MSG_POLL_MS = 12_000;

/** Чат жагсаалт */
export const CHAT_CONV_POLL_MS = 30_000;

/** Дуудлага ирэх эсэх — чат хуудсанд */
export const CALL_POLL_CHAT_MS = 8_000;

/** Дуудлага ирэх эсэх — бусад dashboard */
export const CALL_POLL_IDLE_MS = 30_000;

/** Host: decline шалгах */
export const CALL_DECLINE_POLL_MS = 5_000;

/** WebSocket тасарсан үед л — safety net */
export const FALLBACK_POLL_MS = 60_000;
