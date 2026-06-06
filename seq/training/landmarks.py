"""
MediaPipe landmark extraction + normalization.

The normalization math here is the contract with the web client
(seq/web/lib/landmarks.ts). Keep them byte-for-byte equivalent.

Pipeline per frame:
  1. Mirror the frame horizontally (selfie view) — done by the caller.
  2. Detect pose + both hands + face.
  3. Pack RAW image-normalized (x, y) coords into a FEATURE_DIM vector.
  4. (later, at train/infer time) normalize: shoulder midpoint -> origin,
     shoulder width -> unit scale.
"""
from __future__ import annotations

import os
import numpy as np

import config as C


def _require_models() -> None:
    missing = [p for p in (C.POSE_TASK, C.HAND_TASK, C.FACE_TASK) if not os.path.isfile(p)]
    if missing:
        msg = "\n".join(f"  {p}" for p in missing)
        raise SystemExit(
            f"MediaPipe task файл олдсонгүй:\n{msg}\n\n"
            "Татах: python3 download_models.py"
        )


class LandmarkExtractor:
    """Wraps MediaPipe PoseLandmarker + HandLandmarker + FaceLandmarker (Tasks API)."""

    def __init__(self) -> None:
        _require_models()
        import mediapipe as mp

        base = mp.tasks.BaseOptions
        vision = mp.tasks.vision
        self._mp = mp

        self.pose = vision.PoseLandmarker.create_from_options(
            vision.PoseLandmarkerOptions(
                base_options=base(model_asset_path=C.POSE_TASK),
                running_mode=vision.RunningMode.IMAGE,
                num_poses=1,
            )
        )
        self.hands = vision.HandLandmarker.create_from_options(
            vision.HandLandmarkerOptions(
                base_options=base(model_asset_path=C.HAND_TASK),
                running_mode=vision.RunningMode.IMAGE,
                num_hands=2,
            )
        )
        self.face = vision.FaceLandmarker.create_from_options(
            vision.FaceLandmarkerOptions(
                base_options=base(model_asset_path=C.FACE_TASK),
                running_mode=vision.RunningMode.IMAGE,
                num_faces=1,
            )
        )

    def close(self) -> None:
        self.pose.close()
        self.hands.close()
        self.face.close()

    def raw_vector(self, rgb: np.ndarray) -> tuple[np.ndarray, bool]:
        """
        rgb: HxWx3 uint8 RGB image (already mirrored by caller).
        Returns (raw_vec[FEATURE_DIM], pose_present).
        """
        mp_img = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb)
        pose_res = self.pose.detect(mp_img)
        hand_res = self.hands.detect(mp_img)
        face_res = self.face.detect(mp_img)
        return pack_raw_vector(pose_res, hand_res, face_res)


def pack_raw_vector(pose_res, hand_res, face_res=None) -> tuple[np.ndarray, bool]:
    """Pack MediaPipe results into the raw FEATURE_DIM layout."""
    vec = np.zeros(C.FEATURE_DIM, dtype=np.float32)

    pose_present = bool(pose_res.pose_landmarks)
    if pose_present:
        lm = pose_res.pose_landmarks[0]
        for i, kp in enumerate(C.POSE_KEYPOINTS):
            base = i * C.N_COORDS
            vec[base] = lm[kp].x
            vec[base + 1] = lm[kp].y

    left, right = _split_hands(hand_res)
    pose_block = C.N_POSE * C.N_COORDS
    if left is not None:
        _write_hand(vec, pose_block, left)
        vec[C.LEFT_PRESENT_IDX] = 1.0
    if right is not None:
        _write_hand(vec, pose_block + C.N_HAND * C.N_COORDS, right)
        vec[C.RIGHT_PRESENT_IDX] = 1.0

    if face_res is not None and face_res.face_landmarks:
        flm = face_res.face_landmarks[0]
        face_base = (C.N_POSE + C.N_HAND + C.N_HAND) * C.N_COORDS
        for i, kp in enumerate(C.FACE_KEYPOINTS):
            base = face_base + i * C.N_COORDS
            vec[base] = flm[kp].x
            vec[base + 1] = flm[kp].y
        vec[C.FACE_PRESENT_IDX] = 1.0

    return vec, pose_present


def _split_hands(hand_res):
    """Return (left_landmarks, right_landmarks) by handedness label.

    MUST match seq/web/lib/landmarks.ts splitHands() — training/live parity.
    """
    left = right = None
    if not hand_res.hand_landmarks:
        return left, right
    for i, lms in enumerate(hand_res.hand_landmarks):
        label = "Right"
        try:
            label = hand_res.handedness[i][0].category_name
        except Exception:
            pass
        if label == "Left" and left is None:
            left = lms
        elif right is None:
            right = lms
        elif left is None:
            left = lms
    return left, right


def _write_hand(vec: np.ndarray, base: int, lms) -> None:
    for j in range(C.N_HAND):
        vec[base + j * C.N_COORDS] = lms[j].x
        vec[base + j * C.N_COORDS + 1] = lms[j].y


def _active_hand_y(raw: np.ndarray) -> float | None:
    """Average y of the primary signing hand (prefers left block)."""
    pose_block = C.N_POSE * C.N_COORDS
    hand_block = C.N_HAND * C.N_COORDS
    for base, present_idx in (
        (pose_block, C.LEFT_PRESENT_IDX),
        (pose_block + hand_block, C.RIGHT_PRESENT_IDX),
    ):
        if raw[present_idx] == 0:
            continue
        ys = []
        for j in range(C.N_HAND):
            yi = base + j * C.N_COORDS + 1
            if raw[yi - 1] != 0 or raw[yi] != 0:
                ys.append(raw[yi])
        if ys:
            return float(np.mean(ys))
    # Fallback: pose wrists (curated indices 5, 6)
    for yi in (11, 13):
        if raw[yi - 1] != 0 or raw[yi] != 0:
            return float(raw[yi])
    return None


def detect_chest_zone(raw: np.ndarray) -> int:
    """Return 1=above chest, 2=at chest, 3=below, 0=unknown."""
    ls_y, rs_y = raw[3], raw[5]
    if ls_y == 0 and rs_y == 0:
        return 0
    shoulder_y = (ls_y + rs_y) * 0.5
    lh_y, rh_y = raw[15], raw[17]
    if lh_y > 0 and rh_y > 0:
        hip_y = (lh_y + rh_y) * 0.5
    else:
        hip_y = shoulder_y + 0.35

    hand_y = _active_hand_y(raw)
    if hand_y is None:
        return 0

    chest_low = shoulder_y + C.CHEST_MID_FRAC * (hip_y - shoulder_y)
    high_thresh = shoulder_y - C.CHEST_HIGH_MARGIN
    low_thresh = chest_low + C.CHEST_LOW_EXTRA

    if hand_y < high_thresh:
        return 1
    if hand_y > low_thresh:
        return 3
    return 2


CHEST_ZONE_NAMES = ("?", "дээш", "мөрөн", "доош")


# =========================================================================
# NORMALIZATION  (mirror exactly in landmarks.ts)
# =========================================================================
def normalize(raw: np.ndarray) -> np.ndarray:
    """
    raw: (FEATURE_DIM,) or (T, FEATURE_DIM) raw image coords.
    Returns same shape, normalized so shoulder midpoint = origin and
    shoulder width = 1. Presence flags pass through unchanged.
    """
    single = raw.ndim == 1
    arr = raw[None, :] if single else raw
    out = arr.copy()

    ls_x, ls_y = arr[:, 2], arr[:, 3]
    rs_x, rs_y = arr[:, 4], arr[:, 5]
    cx = (ls_x + rs_x) * 0.5
    cy = (ls_y + rs_y) * 0.5
    scale = np.maximum(
        np.hypot(ls_x - rs_x, ls_y - rs_y), C.MIN_SHOULDER_WIDTH
    )

    n_points = C.N_POSE + C.N_HAND + C.N_HAND + C.N_FACE
    for p in range(n_points):
        xi = p * C.N_COORDS
        yi = xi + 1
        present = (arr[:, xi] != 0) | (arr[:, yi] != 0)
        nx = (arr[:, xi] - cx) / scale
        ny = (arr[:, yi] - cy) / scale
        out[:, xi] = np.where(present, nx, 0.0)
        out[:, yi] = np.where(present, ny, 0.0)

    for flag in (C.LEFT_PRESENT_IDX, C.RIGHT_PRESENT_IDX, C.FACE_PRESENT_IDX):
        out[:, flag] = arr[:, flag]
    return out[0] if single else out
