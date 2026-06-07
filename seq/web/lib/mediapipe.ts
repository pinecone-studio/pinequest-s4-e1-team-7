"use client";

import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type HandLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type AllLandmarks = {
  pose: PoseLandmarkerResult | null;
  hand: HandLandmarkerResult | null;
};

export type LandmarkBundle = {
  detect: (source: HTMLVideoElement | HTMLCanvasElement, ts: number) => AllLandmarks;
  close: () => void;
};

export type MediaPipeProgress = (stage: string) => void;

const WASM_PATH = "/mediapipe-wasm";
const DELEGATE = "CPU" as const;

let cached: Promise<LandmarkBundle> | null = null;

let consoleFiltered = false;
function silenceBenignLogs(): void {
  if (consoleFiltered || typeof window === "undefined") return;
  consoleFiltered = true;
  const benign = [
    "INFO: Created TensorFlow Lite XNNPACK delegate",
    "inference_feedback_manager.cc",
    "landmark_projection_calculator.cc",
    "gl_context.cc",
    "Aborted(",
    "Packet timestamp mismatch",
  ];
  const isBenign = (a: unknown[]) =>
    a.length > 0 &&
    typeof a[0] === "string" &&
    benign.some((p) => (a[0] as string).includes(p));
  const e = console.error.bind(console);
  const w = console.warn.bind(console);
  console.error = (...a: unknown[]) => (isBenign(a) ? undefined : e(...a));
  console.warn = (...a: unknown[]) => (isBenign(a) ? undefined : w(...a));
}

function yieldToBrowser(ms = 50): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function build(onProgress?: MediaPipeProgress): Promise<LandmarkBundle> {
  silenceBenignLogs();
  onProgress?.("WASM");
  console.info("[MediaPipe] WASM ачаалж байна...");
  const wasm = await FilesetResolver.forVisionTasks(WASM_PATH);
  await yieldToBrowser();

  onProgress?.("pose");
  console.info("[MediaPipe] pose...");
  const pose = await PoseLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_lite.task",
      delegate: DELEGATE,
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
  await yieldToBrowser();

  onProgress?.("hand");
  console.info("[MediaPipe] hand...");
  const hand = await HandLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath: "/models/hand_landmarker.task",
      delegate: DELEGATE,
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  console.info("[MediaPipe] бэлэн (pose + hand)");

  // VIDEO mode: timestamps must be strictly monotonically increasing (ms).
  let lastTs = 0;
  let busy = false;

  function nextTs(requested: number): number {
    const t = Math.max(lastTs + 1, Math.floor(requested));
    lastTs = t;
    return t;
  }

  return {
    detect(source, ts): AllLandmarks {
      if (busy) return { pose: null, hand: null };
      busy = true;
      try {
        const poseTs = nextTs(ts);
        const handTs = nextTs(ts);
        let poseResult: PoseLandmarkerResult | null = null;
        let handResult: HandLandmarkerResult | null = null;
        try {
          poseResult = pose.detectForVideo(source, poseTs);
        } catch (e) {
          console.warn("[MediaPipe] pose detect", e);
        }
        try {
          handResult = hand.detectForVideo(source, handTs);
        } catch (e) {
          console.warn("[MediaPipe] hand detect", e);
        }
        return { pose: poseResult, hand: handResult };
      } finally {
        busy = false;
      }
    },
    close() {
      pose.close();
      hand.close();
    },
  };
}

export function getLandmarkers(
  onProgress?: MediaPipeProgress
): Promise<LandmarkBundle> {
  if (!cached) cached = build(onProgress);
  return cached;
}

export function resetLandmarkersCache(): void {
  cached = null;
}
