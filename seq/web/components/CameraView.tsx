"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getLandmarkers, type AllLandmarks } from "@/lib/mediapipe";

/** MediaPipe + TF target rate (lower = less CPU). */
const DETECT_HZ = 12;
const DETECT_INTERVAL_MS = 1000 / DETECT_HZ;
/** Downscale width for landmark detection (normalized coords unchanged). */
const DETECT_MAX_WIDTH = 384;
const MAX_DISPLAY_DPR = 1.25;

type Props = {
  onLandmarks?: (lm: AllLandmarks) => void;
  width?: number;
  height?: number;
  overlay?: ReactNode;
  mirror?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  drawSkeleton?: boolean;
  /** When false, only runs camera + landmarks (no canvas preview). */
  showPreview?: boolean;
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
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLmRef = useRef<AllLandmarks | null>(null);
  const lastDetectAtRef = useRef(0);
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;
  const onStreamReadyRef = useRef(onStreamReady);
  onStreamReadyRef.current = onStreamReady;
  const [status, setStatus] = useState("Камер ачаалж байна...");
  const [aspectRatio, setAspectRatio] = useState("4 / 3");

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

  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let bundle: Awaited<ReturnType<typeof getLandmarkers>> | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 15, max: 20 },
          },
          audio: false,
        });
        if (stopped || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        onStreamReadyRef.current?.(stream);
        setStatus("MediaPipe ачаалж байна...");

        bundle = await getLandmarkers();
        if (stopped) return;
        setStatus("");

        const tick = (now: number) => {
          if (stopped || !videoRef.current) return;
          const work = workRef.current;
          if (!work || !bundle) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (document.visibilityState === "hidden") {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          const v = videoRef.current;
          const vw = v.videoWidth;
          const vh = v.videoHeight;
          if (v.readyState < 2 || vw <= 0 || vh <= 0) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          const scale = Math.min(1, DETECT_MAX_WIDTH / vw);
          const dw = Math.max(1, Math.round(vw * scale));
          const dh = Math.max(1, Math.round(vh * scale));
          if (work.width !== dw) work.width = dw;
          if (work.height !== dh) work.height = dh;

          const shouldDetect = now - lastDetectAtRef.current >= DETECT_INTERVAL_MS;
          if (shouldDetect) {
            lastDetectAtRef.current = now;
            const wctx = work.getContext("2d", { alpha: false });
            if (wctx) {
              wctx.setTransform(1, 0, 0, 1, 0, 0);
              wctx.clearRect(0, 0, dw, dh);
              wctx.save();
              if (mirror) {
                wctx.translate(dw, 0);
                wctx.scale(-1, 1);
              }
              wctx.drawImage(v, 0, 0, vw, vh, 0, 0, dw, dh);
              wctx.restore();
            }
            lastLmRef.current = bundle.detect(work, now);
            onLandmarksRef.current?.(lastLmRef.current);
          }

          if (showPreview && canvasRef.current) {
            const c = canvasRef.current;
            const box = wrapRef.current;
            const displayW = box?.clientWidth ?? c.clientWidth;
            const displayH = box?.clientHeight ?? c.clientHeight;
            if (displayW > 0 && displayH > 0) {
              const dpr = Math.min(window.devicePixelRatio || 1, MAX_DISPLAY_DPR);
              const bw = Math.round(displayW * dpr);
              const bh = Math.round(displayH * dpr);
              if (c.width !== bw) c.width = bw;
              if (c.height !== bh) c.height = bh;
              const ctx = c.getContext("2d", { alpha: false });
              if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, displayW, displayH);
                ctx.drawImage(work, 0, 0, dw, dh, 0, 0, displayW, displayH);
                if (drawSkeleton && lastLmRef.current) {
                  drawSkeletonOverlay(ctx, displayW, displayH, lastLmRef.current);
                }
              }
            }
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        console.error(e);
        setStatus(`Алдаа: ${(e as Error).message}`);
      }
    })();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      bundle?.close();
    };
  }, [drawSkeleton, height, mirror, showPreview, width]);

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
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-zinc-200">
          {status}
        </div>
      )}
      {overlay && <div className="absolute inset-0">{overlay}</div>}
    </div>
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
