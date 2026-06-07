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
export const LONG_VOWEL_BASES = ["А", "Э", "О", "У", "Ө", "Ү"] as const;
export const LONG_VOWEL_SUFFIX = " урт";

const MIN_SHOULDER_WIDTH = 1e-3;
const N_POINTS = N_POSE + N_HAND + N_HAND;

type Pt = { x: number; y: number };

export function isLongVowelSign(label: string): boolean {
  const s = label.trim();
  if (!s.endsWith(LONG_VOWEL_SUFFIX)) return false;
  const base = s.slice(0, -LONG_VOWEL_SUFFIX.length);
  return (LONG_VOWEL_BASES as readonly string[]).includes(base);
}

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

export const PACK_MIRROR_DETECT = {
  detectionOnMirroredPixels: true,
} as const satisfies PackRawOptions;

export const PACK_RAW_CAMERA = {
  detectionOnMirroredPixels: false,
} as const satisfies PackRawOptions;

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

const MIN_HAND_LM_ACTIVE = 8;

function handBlockActive(raw: Float32Array, base: number): boolean {
  let n = 0;
  for (let j = 0; j < N_HAND; j++) {
    const xi = base + j * N_COORDS;
    if (raw[xi] !== 0 || raw[xi + 1] !== 0) n++;
  }
  return n >= MIN_HAND_LM_ACTIVE;
}

export function isTwoHandMode(lm: AllLandmarks, raw: Float32Array): boolean {
  const hands = lm.hand?.landmarks as Pt[][] | undefined;
  if (!hands || hands.length < 2) return false;
  if (raw[LEFT_PRESENT_IDX] === 0 || raw[RIGHT_PRESENT_IDX] === 0) return false;

  const leftBase = N_POSE * N_COORDS;
  const rightBase = leftBase + N_HAND * N_COORDS;
  if (!handBlockActive(raw, leftBase) || !handBlockActive(raw, rightBase)) {
    return false;
  }

  const c0 = handCenter(hands[0]);
  const c1 = handCenter(hands[1]);
  return Math.hypot(c0.x - c1.x, c0.y - c1.y) >= 0.14;
}

export function frameIsTwoHand(raw: Float32Array): boolean {
  if (raw[LEFT_PRESENT_IDX] === 0 || raw[RIGHT_PRESENT_IDX] === 0) return false;
  const leftBase = N_POSE * N_COORDS;
  const rightBase = leftBase + N_HAND * N_COORDS;
  return handBlockActive(raw, leftBase) && handBlockActive(raw, rightBase);
}

export type PackRawOptions = {
  detectionOnMirroredPixels?: boolean;
};

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
