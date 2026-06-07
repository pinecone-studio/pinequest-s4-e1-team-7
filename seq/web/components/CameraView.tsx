"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getLandmarkers, type AllLandmarks } from "@/lib/mediapipe";

/** MediaPipe only — preview is live rAF from <video>. */
const DETECT_HZ = 8;
const DETECT_INTERVAL_MS = 1000 / DETECT_HZ;
const DETECT_MAX_WIDTH = 288;

type Props = {
  onLandmarks?: (lm: AllLandmarks) => void;
  width?: number;
  height?: number;
  overlay?: ReactNode;
  mirror?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  drawSkeleton?: boolean;
  showPreview?: boolean;
  manualStart?: boolean;
  onStarted?: () => void;
  onMediaPipeReady?: () => void;
  inferenceActive?: boolean;
};

export function CameraView({
  onLandmarks,
  width = 640,
  height = 480,
  overlay,
  mirror = true,
  onStreamReady,
  drawSkeleton = false,
  showPreview = true,
  manualStart = false,
  onStarted,
  onMediaPipeReady,
  inferenceActive = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const liveRafRef = useRef<number | null>(null);
  const lastLmRef = useRef<AllLandmarks | null>(null);
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;
  const onStreamReadyRef = useRef(onStreamReady);
  onStreamReadyRef.current = onStreamReady;
  const onStartedRef = useRef(onStarted);
  onStartedRef.current = onStarted;
  const onMediaPipeReadyRef = useRef(onMediaPipeReady);
  onMediaPipeReadyRef.current = onMediaPipeReady;
  const inferenceActiveRef = useRef(inferenceActive);
  inferenceActiveRef.current = inferenceActive;
  const [cameraOn, setCameraOn] = useState(!manualStart);
  const [bundleReady, setBundleReady] = useState(false);
  const [status, setStatus] = useState(
    manualStart ? "" : "Камер ачаалж байна..."
  );
  const [aspectRatio, setAspectRatio] = useState("4 / 3");
  const streamRef = useRef<MediaStream | null>(null);
  const bundleRef = useRef<Awaited<ReturnType<typeof getLandmarkers>> | null>(
    null
  );

  useEffect(() => {
    workRef.current = document.createElement("canvas");
    return () => {
      workRef.current = null;
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      if (v.videoWidth > 0 && v.videoHeight > 0) {
        setAspectRatio(`${v.videoWidth} / ${v.videoHeight}`);
      }
    };
    v.addEventListener("loadedmetadata", onMeta);
    onMeta();
    return () => v.removeEventListener("loadedmetadata", onMeta);
  }, []);

  /** Live camera preview — rAF, шууд <video> → canvas (MediaPipe-ээс тусдаа). */
  useEffect(() => {
    if (!cameraOn || !showPreview) return;

    let stopped = false;

    const drawLive = () => {
      if (stopped) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      const box = wrapRef.current;
      if (v && c && box && v.readyState >= 2) {
        const vw = v.videoWidth;
        const vh = v.videoHeight;
        if (vw > 0 && vh > 0) {
          const displayW = box.clientWidth;
          const displayH = box.clientHeight;
          if (displayW > 0 && displayH > 0) {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
            const bw = Math.round(displayW * dpr);
            const bh = Math.round(displayH * dpr);
            if (c.width !== bw) c.width = bw;
            if (c.height !== bh) c.height = bh;
            const ctx = c.getContext("2d", { alpha: false });
            if (ctx) {
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
              ctx.fillStyle = "#000";
              ctx.fillRect(0, 0, displayW, displayH);
              ctx.save();
              if (mirror) {
                ctx.translate(displayW, 0);
                ctx.scale(-1, 1);
              }
              ctx.drawImage(v, 0, 0, vw, vh, 0, 0, displayW, displayH);
              ctx.restore();
              if (drawSkeleton && lastLmRef.current) {
                drawSkeletonOverlay(ctx, displayW, displayH, lastLmRef.current);
              }
            }
          }
        }
      }
      liveRafRef.current = requestAnimationFrame(drawLive);
    };

    liveRafRef.current = requestAnimationFrame(drawLive);
    return () => {
      stopped = true;
      if (liveRafRef.current !== null) {
        cancelAnimationFrame(liveRafRef.current);
        liveRafRef.current = null;
      }
    };
  }, [cameraOn, drawSkeleton, mirror, showPreview]);

  /** MediaPipe + inference — preview-ийг блоклохгүй, TF дараагийн frame-д. */
  useEffect(() => {
    if (!bundleReady || !inferenceActive) return;

    let stopped = false;
    let detectBusy = false;

    const captureForDetect = (): boolean => {
      const v = videoRef.current;
      const work = workRef.current;
      if (!v || !work || v.readyState < 2) return false;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (vw <= 0 || vh <= 0) return false;

      const scale = Math.min(1, DETECT_MAX_WIDTH / vw);
      const dw = Math.max(1, Math.round(vw * scale));
      const dh = Math.max(1, Math.round(vh * scale));
      if (work.width !== dw) work.width = dw;
      if (work.height !== dh) work.height = dh;

      const wctx = work.getContext("2d", { alpha: false });
      if (!wctx) return false;
      wctx.setTransform(1, 0, 0, 1, 0, 0);
      wctx.clearRect(0, 0, dw, dh);
      wctx.save();
      if (mirror) {
        wctx.translate(dw, 0);
        wctx.scale(-1, 1);
      }
      wctx.drawImage(v, 0, 0, vw, vh, 0, 0, dw, dh);
      wctx.restore();
      return true;
    };

    const runDetect = () => {
      if (stopped || document.visibilityState === "hidden" || detectBusy) return;
      const bundle = bundleRef.current;
      if (!bundle || !captureForDetect()) return;
      detectBusy = true;
      const ts = performance.now();
      try {
        const lm = bundle.detect(workRef.current!, ts);
        lastLmRef.current = lm;
        // TF inference дараагийн frame — preview rAF түрүүлнэ.
        requestAnimationFrame(() => {
          if (!stopped) onLandmarksRef.current?.(lm);
          detectBusy = false;
        });
      } catch {
        detectBusy = false;
      }
    };

    const detectId = window.setInterval(runDetect, DETECT_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(detectId);
    };
  }, [bundleReady, inferenceActive, mirror]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    setCameraOn(true);
    setStatus("Камерын зөвшөөрөл хүлээж байна...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      v.playsInline = true;
      await v.play();
      onStreamReadyRef.current?.(stream);
      setStatus("MediaPipe: WASM...");

      const bundle = await Promise.race([
        getLandmarkers((stage) => setStatus(`MediaPipe: ${stage}...`)),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("MediaPipe ачаалах хэт удаан (60s)")),
            60_000
          )
        ),
      ]);
      bundleRef.current = bundle;
      setBundleReady(true);
      setStatus("Загвар ачаалж байна...");
      onMediaPipeReadyRef.current?.();
      onStartedRef.current?.();
    } catch (e) {
      console.error(e);
      setCameraOn(false);
      setBundleReady(false);
      const msg = (e as Error).message;
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setStatus(
          "Камерын зөвшөөрөл шаардлагатай — macOS: System Settings → Privacy → Camera → Chrome ON"
        );
      } else {
        setStatus(`Алдаа: ${msg}`);
      }
    }
  }, [height, width]);

  useEffect(() => {
    if (!cameraOn || manualStart) return;
    void startCamera();
  }, [cameraOn, manualStart, startCamera]);

  useEffect(() => {
    if (inferenceActive) setStatus("");
  }, [inferenceActive]);

  useEffect(() => {
    return () => {
      if (liveRafRef.current !== null) cancelAnimationFrame(liveRafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      bundleRef.current?.close();
    };
  }, []);

  if (!showPreview) {
    return (
      <video
        ref={videoRef}
        playsInline
        muted
        className="pointer-events-none absolute h-px w-px opacity-0"
        aria-hidden
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl bg-black"
        style={{ aspectRatio }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          className="pointer-events-none absolute h-px w-px opacity-0"
          aria-hidden
        />
        <canvas ref={canvasRef} className="block h-full w-full" />
        {manualStart && !cameraOn && !status && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
            <p className="text-sm text-zinc-300">
              Камер + дохио танилтыг эхлүүлэхийн тулд доорх товчийг дарна уу
            </p>
            <button
              type="button"
              onClick={() => void startCamera()}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-500"
            >
              📷 Камер асаах
            </button>
            <p className="text-xs text-zinc-500">
              macOS: System Settings → Privacy &amp; Security → Camera → Chrome ON
            </p>
          </div>
        )}
        {status && (
          <div
            className={
              cameraOn && !inferenceActive
                ? "absolute bottom-0 left-0 right-0 bg-black/75 px-3 py-2 text-center text-xs text-zinc-200"
                : "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center text-sm text-zinc-200"
            }
          >
            <p>{status}</p>
            {manualStart && !cameraOn && status.includes("зөвшөөрөл") && (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs text-white hover:bg-violet-500"
              >
                Дахин оролдох
              </button>
            )}
          </div>
        )}
        {overlay && <div className="absolute inset-0">{overlay}</div>}
      </div>
      <CameraCountdown />
    </div>
  );
}

const TIMER_SECONDS = 5;

function CameraCountdown() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [progress, setProgress] = useState(0);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);

  const start = () => {
    if (running) return;
    setRunning(true);
    setRemaining(TIMER_SECONDS);
    setProgress(0);
    startedAtRef.current = performance.now();
  };

  useEffect(() => {
    if (!running) return;

    const tick = (now: number) => {
      const elapsed = (now - startedAtRef.current) / 1000;
      if (elapsed >= TIMER_SECONDS) {
        setRunning(false);
        setRemaining(TIMER_SECONDS);
        setProgress(0);
        return;
      }
      setRemaining(TIMER_SECONDS - elapsed);
      setProgress((elapsed / TIMER_SECONDS) * 100);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const display = running ? Math.max(1, Math.ceil(remaining)) : TIMER_SECONDS;

  return (
    <button
      type="button"
      onClick={start}
      disabled={running}
      className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/60 disabled:cursor-default disabled:hover:bg-zinc-900/50"
      aria-label={running ? `${display} секунд үлдлээ` : "5 секундын тоолуур эхлүүлэх"}
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-lg tabular-nums text-violet-300">
        {display}
      </span>
      <span className="min-w-[3.5rem] text-xs text-zinc-500">
        {running ? "сек" : "Эхлэх"}
      </span>
    </button>
  );
}

type Pt = { x: number; y: number };

function drawSkeletonOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lm: AllLandmarks
): void {
  const xy = (p: Pt) => [p.x * w, p.y * h] as [number, number];

  const pose = lm.pose?.landmarks?.[0];
  if (pose) {
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    const edges: [number, number][] = [
      [11, 13], [13, 15], [12, 14], [14, 16], [11, 12],
    ];
    for (const [a, b] of edges) {
      if (!pose[a] || !pose[b]) continue;
      const [ax, ay] = xy(pose[a]);
      const [bx, by] = xy(pose[b]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }

  const hands = lm.hand?.landmarks;
  if (hands?.[0]) {
    const hand = hands[0];
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    const edges: [number, number][] = [
      [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
      [5, 6], [6, 7], [7, 8],
    ];
    for (const [a, b] of edges) {
      if (!hand[a] || !hand[b]) continue;
      const [ax, ay] = xy(hand[a]);
      const [bx, by] = xy(hand[b]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }
}
