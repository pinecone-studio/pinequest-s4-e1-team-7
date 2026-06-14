"""
Clip recorder — capture each sign as a short MOTION sequence (not a frozen
frame). Each SPACE / ENTER press records ~CLIP_SECONDS of landmarks and saves one clip.

Record many clips per sign (15-30+), varying speed / position / distance so the
temporal model generalizes.

Controls:
  SPACE / ENTER  start / stop a clip
  n / b          next / previous label
  d              delete the most recent clip of the current label (undo)
  q              quit

Saved layout:
  data/raw/<safe_label>/<label>_<timestamp>.npy   shape (frames, FEATURE_DIM)
  data/manifest.csv                                clip_path,label,frames,ts
"""
from __future__ import annotations

import csv
import os
import time
from datetime import datetime
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

import config as C
from config import safe_name
from landmarks import LandmarkExtractor

# SPACE (32), Enter / Return (13), keypad Enter (10 on some platforms)
_REC_KEYS = {ord(" "), 13, 10}


@lru_cache(maxsize=8)
def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.isfile(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def put_unicode_text(
    frame_bgr: np.ndarray,
    text: str,
    xy: tuple[int, int],
    *,
    size: int = 24,
    color: tuple[int, int, int] = (255, 255, 255),
) -> None:
    """Draw Unicode (Cyrillic) text on a BGR frame — cv2.putText cannot."""
    if not text:
        return
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)
    draw.text(xy, text, font=_load_font(size), fill=color)
    frame_bgr[:] = cv2.cvtColor(np.asarray(pil), cv2.COLOR_RGB2BGR)


def clip_count(label: str) -> int:
    d = os.path.join(C.RAW_DIR, safe_name(label))
    if not os.path.isdir(d):
        return 0
    return len([n for n in os.listdir(d) if n.endswith(".npy")])


def append_manifest(path: str, label: str, frames: int) -> None:
    os.makedirs(os.path.dirname(C.MANIFEST), exist_ok=True)
    new = not os.path.isfile(C.MANIFEST)
    with open(C.MANIFEST, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["clip_path", "label", "frames", "ts"])
        w.writerow([os.path.relpath(path, C.BASE_DIR), label, frames,
                    datetime.now().isoformat()])


def save_clip(label: str, frames: list[np.ndarray]) -> str | None:
    if len(frames) < C.MIN_CLIP_FRAMES:
        print(f"  ✗ хэт богино clip ({len(frames)} frame) — хадгалсангүй")
        return None
    arr = np.stack(frames).astype(np.float32)
    d = os.path.join(C.RAW_DIR, safe_name(label))
    os.makedirs(d, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    path = os.path.join(d, f"{safe_name(label)}_{ts}.npy")
    np.save(path, arr)
    append_manifest(path, label, len(arr))
    return path


def delete_last_clip(label: str) -> None:
    d = os.path.join(C.RAW_DIR, safe_name(label))
    if not os.path.isdir(d):
        return
    npys = sorted(n for n in os.listdir(d) if n.endswith(".npy"))
    if not npys:
        return
    os.remove(os.path.join(d, npys[-1]))
    print(f"  ↩ устгалаа: {npys[-1]}")


def draw_hud(frame, label, idx, total_labels, recording, n_clips, rec_frames, raw_vec):
    h, w = frame.shape[:2]
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 90), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)
    hand_mode = C.hand_mode_for(label)
    hand_txt = {0: "?", 1: "1 гар", 2: "2 гар"}.get(hand_mode, "?")
    side = C.hand_side_for(label)
    side_txt = {0: "аль ч", 1: "баруун", 2: "зүүн"}.get(side, "?")
    put_unicode_text(
        frame,
        f"[{idx + 1}/{total_labels}] {label}",
        (12, 6),
        size=26,
        color=(255, 255, 255),
    )
    put_unicode_text(
        frame,
        f"clips: {n_clips}   гар:{hand_txt}   тал:{side_txt}",
        (12, 38),
        size=16,
        color=(200, 200, 200),
    )
    put_unicode_text(
        frame,
        "SPACE/ENTER rec   n/b label   d undo   q quit",
        (12, 62),
        size=14,
        color=(160, 160, 160),
    )
    if recording:
        cv2.circle(frame, (w - 30, 30), 12, (0, 0, 255), -1)
        cv2.putText(frame, f"REC {rec_frames}", (w - 150, 36),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)


def draw_landmarks(frame, raw_vec):
    h, w = frame.shape[:2]
    n_body = C.N_POSE + C.N_HAND + C.N_HAND
    for p in range(n_body):
        x = raw_vec[p * C.N_COORDS]
        y = raw_vec[p * C.N_COORDS + 1]
        if x == 0 and y == 0:
            continue
        color = (0, 255, 255) if p < C.N_POSE else (255, 0, 200)
        cv2.circle(frame, (int(x * w), int(y * h)), 3, color, -1)


def _finish_recording(label: str, frames: list[np.ndarray]) -> list[np.ndarray]:
    path = save_clip(label, frames)
    if path:
        print(f"  ✓ {label}: clip {clip_count(label)} ({len(frames)} frame)")
    return []


def _toggle_recording(
    recording: bool,
    rec_start: float,
    frames: list[np.ndarray],
    label: str,
) -> tuple[bool, float, list[np.ndarray]]:
    if not recording:
        return True, time.time(), []
    return False, rec_start, _finish_recording(label, frames)


def main() -> None:
    labels = C.load_labels()
    extractor = LandmarkExtractor()
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise SystemExit("Камер нээгдсэнгүй")

    idx = 0
    recording = False
    rec_start = 0.0
    frames: list[np.ndarray] = []

    print("=" * 56)
    print(f"CLIP RECORDER — {len(labels)} label, FEATURE_DIM={C.FEATURE_DIM}")
    print("  Хуучин clip (104 dim) ашиглахгүй — бүгдийг шинээр бичнэ.")
    for i, l in enumerate(labels):
        print(f"  {i}: {l}  ({clip_count(l)} clips)")
    print("=" * 56)

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)  # selfie mirror (same as web)
            rgb = cv2.cvtColor(cv2.resize(frame, (640, 360)), cv2.COLOR_BGR2RGB)
            raw_vec, pose_present = extractor.raw_vector(rgb)

            if recording and pose_present:
                frames.append(raw_vec.copy())
                if time.time() - rec_start >= C.CLIP_SECONDS:
                    recording = False
                    frames = _finish_recording(labels[idx], frames)

            draw_landmarks(frame, raw_vec)
            draw_hud(frame, labels[idx], idx, len(labels), recording,
                     clip_count(labels[idx]), len(frames), raw_vec)
            cv2.imshow("Clip Recorder", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break
            elif key in _REC_KEYS:
                recording, rec_start, frames = _toggle_recording(
                    recording, rec_start, frames, labels[idx]
                )
            elif key == ord("n"):
                recording = False
                frames = []
                idx = (idx + 1) % len(labels)
            elif key == ord("b"):
                recording = False
                frames = []
                idx = (idx - 1) % len(labels)
            elif key == ord("d"):
                delete_last_clip(labels[idx])
    finally:
        cap.release()
        cv2.destroyAllWindows()
        extractor.close()
        print("Дууслаа.")


if __name__ == "__main__":
    main()
