"use client";

import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
  PoseLandmarker,
  type FaceLandmarkerResult,
  type HandLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type AllLandmarks = {
  pose: PoseLandmarkerResult | null;
  hand: HandLandmarkerResult | null;
  face: FaceLandmarkerResult | null;
};

export type LandmarkBundle = {
  detect: (source: HTMLVideoElement | HTMLCanvasElement, ts: number) => AllLandmarks;
  close: () => void;
};

export type MediaPipeProgress = (stage: string) => void;

/** Local WASM — CDN биш, илүү хурдан/найдвартай. */
const WASM_PATH = "/mediapipe-wasm";
/** 3 GPU delegate зэрэг = Mac дээр CPU 100% + гацалт. Зөвхөн CPU. */
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
  await yieldToBrowser();

  onProgress?.("face");
  console.info("[MediaPipe] face...");
  const face = await FaceLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath: "/models/face_landmarker.task",
      delegate: DELEGATE,
    },
    runningMode: "VIDEO",
    numFaces: 1,
  });
  console.info("[MediaPipe] бэлэн");

  return {
    detect(source, ts): AllLandmarks {
      try {
        return {
          pose: pose.detectForVideo(source, ts),
          hand: hand.detectForVideo(source, ts),
          face: face.detectForVideo(source, ts),
        };
      } catch (e) {
        console.warn("detect error", e);
        return { pose: null, hand: null, face: null };
      }
    },
    close() {
      pose.close();
      hand.close();
      face.close();
    },
  };
}

export function getLandmarkers(
  onProgress?: MediaPipeProgress
): Promise<LandmarkBundle> {
  if (!cached) cached = build(onProgress);
  return cached;
}

/** Test/dev: дахин ачаалах. */
export function resetLandmarkersCache(): void {
  cached = null;
}
