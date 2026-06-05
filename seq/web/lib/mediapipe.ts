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

async function build(): Promise<LandmarkBundle> {
  silenceBenignLogs();
  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
  );
  // GPU delegate cuts per-frame detection from ~25ms to ~6ms.
  // pose_landmarker_lite (6 MB) is ~3x faster than full with negligible accuracy loss.
  const gpuOrCpu = ((): "GPU" | "CPU" => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      return gl ? "GPU" : "CPU";
    } catch {
      return "CPU";
    }
  })();

  const [pose, hand] = await Promise.all([
    PoseLandmarker.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: "/models/pose_landmarker_lite.task",
        delegate: gpuOrCpu,
      },
      runningMode: "VIDEO",
      numPoses: 1,
    }),
    HandLandmarker.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: "/models/hand_landmarker.task",
        delegate: gpuOrCpu,
      },
      runningMode: "VIDEO",
      numHands: 2,
    }),
  ]);

  return {
    detect(source, ts): AllLandmarks {
      try {
        return {
          pose: pose.detectForVideo(source, ts),
          hand: hand.detectForVideo(source, ts),
        };
      } catch (e) {
        console.warn("detect error", e);
        return { pose: null, hand: null };
      }
    },
    close() {
      pose.close();
      hand.close();
    },
  };
}

export function getLandmarkers(): Promise<LandmarkBundle> {
  if (!cached) cached = build();
  return cached;
}
