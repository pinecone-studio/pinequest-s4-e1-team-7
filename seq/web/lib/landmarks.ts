import type { AllLandmarks } from "./mediapipe";

/**
 * Feature layout — MUST stay identical to seq/training/config.py.
 * Per-frame vector (FEATURE_DIM = 125):
 *   pose:  N_POSE * 2 (x,y)        indices 0..17
 *   left:  N_HAND * 2              indices 18..59
 *   right: N_HAND * 2              indices 60..101
 *   face:  N_FACE * 2              indices 102..121
 *   flags: left_present, right_present, face_present   indices 122..124
 */
export const POSE_KEYPOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24] as const;
export const FACE_KEYPOINTS = [1, 61, 291, 33, 263, 13, 14, 78, 308, 152] as const;
export const N_POSE = POSE_KEYPOINTS.length; // 9
export const N_HAND = 21;
export const N_FACE = FACE_KEYPOINTS.length; // 10
export const N_COORDS = 2;
export const FEATURE_DIM =
  (N_POSE + N_HAND + N_HAND + N_FACE) * N_COORDS + 3; // 125
export const LEFT_PRESENT_IDX = (N_POSE + N_HAND + N_HAND + N_FACE) * N_COORDS; // 122
export const RIGHT_PRESENT_IDX = LEFT_PRESENT_IDX + 1; // 123
export const FACE_PRESENT_IDX = RIGHT_PRESENT_IDX + 1; // 124
export const LONG_VOWEL_BASES = ["А", "Э", "О", "У", "Ө", "Ү"] as const;
export const LONG_VOWEL_SUFFIX = " урт";

const MIN_SHOULDER_WIDTH = 1e-3;
const N_POINTS = N_POSE + N_HAND + N_HAND + N_FACE;

export const CHEST_HIGH_MARGIN = 0.06;
export const CHEST_MID_FRAC = 0.15;
export const CHEST_LOW_EXTRA = 0.10;

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
  const faceBase = (N_POSE + N_HAND + N_HAND) * N_COORDS;
  const facePairs = [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ];
  for (const [a, b] of facePairs) {
    for (let c = 0; c < N_COORDS; c++) {
      const ac = faceBase + a * N_COORDS + c;
      const bc = faceBase + b * N_COORDS + c;
      const tmp = idx[ac];
      idx[ac] = idx[bc];
      idx[bc] = tmp;
    }
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
const FACE_BASE = (N_POSE + N_HAND + N_HAND) * N_COORDS;

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

/** Min landmark points active in a hand block to count as "present". */
const MIN_HAND_LM_ACTIVE = 8;

function handBlockActive(raw: Float32Array, base: number): boolean {
  let n = 0;
  for (let j = 0; j < N_HAND; j++) {
    const xi = base + j * N_COORDS;
    if (raw[xi] !== 0 || raw[xi + 1] !== 0) n++;
  }
  return n >= MIN_HAND_LM_ACTIVE;
}

function activeHandY(raw: Float32Array): number | null {
  for (const [base, presentIdx] of [
    [LEFT_BASE, LEFT_PRESENT_IDX],
    [RIGHT_BASE, RIGHT_PRESENT_IDX],
  ] as const) {
    if (raw[presentIdx] === 0) continue;
    let sy = 0;
    let n = 0;
    for (let j = 0; j < N_HAND; j++) {
      const xi = base + j * N_COORDS;
      if (raw[xi] !== 0 || raw[xi + 1] !== 0) {
        sy += raw[xi + 1];
        n++;
      }
    }
    if (n > 0) return sy / n;
  }
  for (const yi of [11, 13]) {
    if (raw[yi - 1] !== 0 || raw[yi] !== 0) return raw[yi];
  }
  return null;
}

/** 1=above chest, 2=at chest, 3=below, 0=unknown. Mirrors landmarks.detect_chest_zone. */
export function detectChestZone(raw: Float32Array): number {
  const lsY = raw[3];
  const rsY = raw[5];
  if (lsY === 0 && rsY === 0) return 0;
  const shoulderY = (lsY + rsY) * 0.5;
  const lhY = raw[15];
  const rhY = raw[17];
  const hipY = lhY > 0 && rhY > 0 ? (lhY + rhY) * 0.5 : shoulderY + 0.35;

  const handY = activeHandY(raw);
  if (handY === null) return 0;

  const chestLow = shoulderY + CHEST_MID_FRAC * (hipY - shoulderY);
  const highThresh = shoulderY - CHEST_HIGH_MARGIN;
  const lowThresh = chestLow + CHEST_LOW_EXTRA;

  if (handY < highThresh) return 1;
  if (handY > lowThresh) return 3;
  return 2;
}

export const CHEST_ZONE_NAMES = ["?", "дээш", "мөрөн", "доош"] as const;

/**
 * True only when MediaPipe sees 2 separate hands (not 1-hand sign + noise).
 * Default inference mode is ONE hand — avoids masking out 1-hand labels.
 */
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

/** Frame in buffer has two real hand blocks (not phantom flags). */
export function frameIsTwoHand(raw: Float32Array): boolean {
  if (raw[LEFT_PRESENT_IDX] === 0 || raw[RIGHT_PRESENT_IDX] === 0) return false;
  const leftBase = N_POSE * N_COORDS;
  const rightBase = leftBase + N_HAND * N_COORDS;
  return handBlockActive(raw, leftBase) && handBlockActive(raw, rightBase);
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

  const face = lm.face?.faceLandmarks?.[0] as Pt[] | undefined;
  if (face) {
    for (let i = 0; i < N_FACE; i++) {
      const kp = FACE_KEYPOINTS[i];
      const p = face[kp];
      if (!p) continue;
      vec[FACE_BASE + i * N_COORDS] = p.x;
      vec[FACE_BASE + i * N_COORDS + 1] = p.y;
    }
    vec[FACE_PRESENT_IDX] = 1;
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

  // MUST match landmarks.py _split_hands (training clips use this layout).
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
  out[FACE_PRESENT_IDX] = raw[FACE_PRESENT_IDX];
}
