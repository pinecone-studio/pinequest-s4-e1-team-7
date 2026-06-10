/** Web Audio ringtone — no external file needed. */
export function createIncomingCallRing() {
  let ctx: AudioContext | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;

  const unlock = () => {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  };

  const burst = () => {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const tones: [number, number, number][] = [
      [440, 0, 0.22],
      [520, 0.28, 0.22],
      [440, 0.62, 0.22],
      [520, 0.9, 0.22],
    ];
    for (const [freq, start, dur] of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + start);
      gain.gain.exponentialRampToValueAtTime(0.22, t0 + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    }
  };

  return {
    unlock,
    start() {
      unlock();
      burst();
      if (!timer) timer = setInterval(burst, 2200);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}
