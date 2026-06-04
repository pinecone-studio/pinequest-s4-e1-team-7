import type { AllLandmarks } from "./mediapipe";

/**
 * Feature layout — MUST stay identical to seq/training/config.py.
 * Per-frame vector (FEATURE_DIM = 104):
 *   pose:  N_POSE * 2 (x,y)        indices 0..17
 *   left:  N_HAND * 2              indices 18..59
 *   right: N_HAND * 2              indices 60..101
 *   flags: left_present, right_present   indices 102, 103
 */
export const POSE_KEYPOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24] as const;
export const N_POSE = POSE_KEYPOINTS.length; // 9
export const N_HAND = 21;
export const N_COORDS = 2;
export const FEATURE_DIM = (N_POSE + N_HAND + N_HAND) * N_COORDS + 2; // 104
export const LEFT_PRESENT_IDX = (N_POSE + N_HAND + N_HAND) * N_COORDS; // 102
export const RIGHT_PRESENT_IDX = LEFT_PRESENT_IDX + 1; // 103
const MIN_SHOULDER_WIDTH = 1e-3;
const N_POINTS = N_POSE + N_HAND + N_HAND;

type Pt = { x: number; y: number };

/** Pose present is required to anchor normalization. */
export function hasPose(lm: AllLandmarks): boolean {
  return (lm.pose?.landmarks?.length ?? 0) > 0;
}

/** Permutation for horizontal mirror — mirrors dataset.horizontal_flip in Python. */
const FLIP_PERM = buildFlipPermutation();

function buildFlipPermutation(): number[] {
  const idx = Array.from({ length: FEATURE_DIM }, (_, i) => i);
  const posePairs = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ];
  for (const [a, b] of posePairs) {
    for (let c = 0; c < N_COORDS; c++) {
      const ac = a * N_COORDS + c;
      const bc = b * N_COORDS + c;
      const tmp = idx[ac];
      idx[ac] = idx[bc];
      idx[bc] = tmp;
    }
  }
  const lh = N_POSE * N_COORDS;
  const rh = lh + N_HAND * N_COORDS;
  const block = N_HAND * N_COORDS;
  for (let k = 0; k < block; k++) {
    const tmp = idx[lh + k];
    idx[lh + k] = idx[rh + k];
    idx[rh + k] = tmp;
  }
  const lp = idx[LEFT_PRESENT_IDX];
  idx[LEFT_PRESENT_IDX] = idx[RIGHT_PRESENT_IDX];
  idx[RIGHT_PRESENT_IDX] = lp;
  return idx;
}

/**
 * Map a packed vector from raw-camera detection into training space
 * (equivalent to cv2.flip + detect in record.py).
 */
export function mirrorPackedFrame(raw: Float32Array): Float32Array {
  const out = new Float32Array(FEATURE_DIM);
  for (let i = 0; i < FEATURE_DIM; i++) {
    out[i] = raw[FLIP_PERM[i]];
  }
  for (let p = 0; p < N_POINTS; p++) {
    const xi = p * N_COORDS;
    out[xi] *= -1;
  }
  return out;
}

/** Use when MediaPipe runs on the mirrored work buffer (record.py / CameraView). */
export const PACK_MIRROR_DETECT = {
  detectionOnMirroredPixels: true,
} as const satisfies PackRawOptions;

/** Map raw camera landmarks into the same space as record.py (flip + pack). */
export const PACK_RAW_CAMERA = {
  detectionOnMirroredPixels: false,
} as const satisfies PackRawOptions;

export type SigningHand = "left" | "right";

const HAND_BLOCK = N_HAND * N_COORDS;
const LEFT_BASE = N_POSE * N_COORDS;
const RIGHT_BASE = LEFT_BASE + HAND_BLOCK;

function handCenter(lms: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const p of lms) {
    if (!p) continue;
    sx += p.x;
    sy += p.y;
    n++;
  }
  return { x: sx / Math.max(n, 1), y: sy / Math.max(n, 1) };
}

/**
 * Live inference for clips recorded with the physical RIGHT hand after cv2.flip.
 *
 * Training vectors usually live in the LEFT hand block (indices 18–59) because
 * MediaPipe labels the mirrored right hand as "Left". Always take the
 * rightmost hand on screen (mirrored selfie) and write it into that block so
 * the live pose matches training — do not use the RIGHT block at inference.
 */
export function packTrainingParityFrame(lm: AllLandmarks): Float32Array | null {
  if (!hasPose(lm)) return null;

  const hands = lm.hand?.landmarks as Pt[][] | undefined;
  if (!hands?.length) return null;

  let pickIdx = 0;
  let pickX = handCenter(hands[0]).x;
  for (let i = 1; i < hands.length; i++) {
    const x = handCenter(hands[i]).x;
    if (x > pickX) {
      pickX = x;
      pickIdx = i;
    }
  }

  if (pickX < 0.45) return null;

  const pose = lm.pose?.landmarks?.[0] as Pt[];
  const vec = new Float32Array(FEATURE_DIM);
  for (let i = 0; i < N_POSE; i++) {
    const kp = POSE_KEYPOINTS[i];
    const p = pose[kp];
    if (!p) continue;
    vec[i * N_COORDS] = p.x;
    vec[i * N_COORDS + 1] = p.y;
  }

  writeHand(vec, LEFT_BASE, hands[pickIdx]);
  vec[LEFT_PRESENT_IDX] = 1;
  return vec;
}

export type PackRawOptions = {
  /**
   * true  — landmarks from a horizontally flipped image (record.py after cv2.flip).
   * false — landmarks from the raw camera frame; handedness is swapped per MediaPipe
   *         docs, then mirrorPackedFrame() maps into training space.
   */
  detectionOnMirroredPixels?: boolean;
};

/** Pack MediaPipe results into the raw (image-coord) FEATURE_DIM vector. */
export function packRawVector(
  lm: AllLandmarks,
  opts?: PackRawOptions
): Float32Array {
  const onMirrored = opts?.detectionOnMirroredPixels ?? false;
  const vec = packRawVectorFromImage(lm, !onMirrored);
  return onMirrored ? vec : mirrorPackedFrame(vec);
}

function packRawVectorFromImage(
  lm: AllLandmarks,
  swapHandedness: boolean
): Float32Array {
  const vec = new Float32Array(FEATURE_DIM);

  const pose = lm.pose?.landmarks?.[0] as Pt[] | undefined;
  if (pose) {
    for (let i = 0; i < N_POSE; i++) {
      const kp = POSE_KEYPOINTS[i];
      const p = pose[kp];
      if (!p) continue;
      vec[i * N_COORDS] = p.x;
      vec[i * N_COORDS + 1] = p.y;
    }
  }

  const { left, right } = splitHands(lm, swapHandedness);
  const poseBlock = N_POSE * N_COORDS;
  if (left) {
    writeHand(vec, poseBlock, left);
    vec[LEFT_PRESENT_IDX] = 1;
  }
  if (right) {
    writeHand(vec, poseBlock + N_HAND * N_COORDS, right);
    vec[RIGHT_PRESENT_IDX] = 1;
  }
  return vec;
}

function splitHands(
  lm: AllLandmarks,
  swapHandedness: boolean
): { left: Pt[] | null; right: Pt[] | null } {
  let left: Pt[] | null = null;
  let right: Pt[] | null = null;
  const hands = lm.hand?.landmarks as Pt[][] | undefined;
  const handed = lm.hand?.handedness;
  if (!hands?.length) return { left, right };
  for (let i = 0; i < hands.length; i++) {
    let label = "Right";
    try {
      label = handed?.[i]?.[0]?.categoryName ?? "Right";
    } catch {
      /* default */
    }
    if (swapHandedness) {
      label = label === "Left" ? "Right" : "Left";
    }
    if (label === "Left" && !left) left = hands[i];
    else if (!right) right = hands[i];
    else if (!left) left = hands[i];
  }
  return { left, right };
}

function writeHand(vec: Float32Array, base: number, lms: Pt[]): void {
  for (let j = 0; j < N_HAND; j++) {
    const p = lms[j];
    if (!p) continue;
    vec[base + j * N_COORDS] = p.x;
    vec[base + j * N_COORDS + 1] = p.y;
  }
}

/**
 * Normalize one raw frame in place into `out`: shoulder midpoint -> origin,
 * shoulder width -> unit scale. Mirrors landmarks.normalize() in Python.
 * Curated pose order: 0=nose, 1=L_shoulder, 2=R_shoulder, ...
 */
export function normalizeFrame(raw: Float32Array, out: Float32Array): void {
  const lsx = raw[2];
  const lsy = raw[3];
  const rsx = raw[4];
  const rsy = raw[5];
  const cx = (lsx + rsx) * 0.5;
  const cy = (lsy + rsy) * 0.5;
  const scale = Math.max(Math.hypot(lsx - rsx, lsy - rsy), MIN_SHOULDER_WIDTH);

  for (let p = 0; p < N_POINTS; p++) {
    const xi = p * N_COORDS;
    const yi = xi + 1;
    const present = raw[xi] !== 0 || raw[yi] !== 0;
    out[xi] = present ? (raw[xi] - cx) / scale : 0;
    out[yi] = present ? (raw[yi] - cy) / scale : 0;
  }
  out[LEFT_PRESENT_IDX] = raw[LEFT_PRESENT_IDX];
  out[RIGHT_PRESENT_IDX] = raw[RIGHT_PRESENT_IDX];
}
