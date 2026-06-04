"""
Single source of truth for the sequence (temporal) sign recognizer.

CRITICAL: every constant that affects the feature vector (selected pose
landmarks, sequence length, normalization) MUST be mirrored exactly in
the web client (seq/web/lib/landmarks.ts). If you change one, change both.
"""
from __future__ import annotations

import os
import re

_BAD_FS_CHARS = re.compile(r'[\\/:*?"<>|\x00-\x1f]+')


def safe_name(label: str) -> str:
    """Filesystem-safe folder/file name that PRESERVES unicode (Cyrillic).

    Only strips path-dangerous characters and spaces — so distinct Mongolian
    labels never collide (the bug that maps everything to '______').
    """
    s = _BAD_FS_CHARS.sub("_", label).strip().replace(" ", "_")
    return s or "label"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEQ_DIR = os.path.dirname(BASE_DIR)                       # seq/
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")                   # data/raw/<label>/<clip>.npy
MANIFEST = os.path.join(DATA_DIR, "manifest.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")             # MediaPipe .task files
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")       # trained keras model + reports
LABELS_FILE = os.path.join(BASE_DIR, "labels.txt")

# Where the exported TFJS model is written (served by the web app).
WEB_MODEL_DIR = os.path.join(SEQ_DIR, "web", "public", "models", "seq")

# MediaPipe task files (shared with rf/ — same models).
POSE_TASK = os.path.join(MODELS_DIR, "pose_landmarker_full.task")
HAND_TASK = os.path.join(MODELS_DIR, "hand_landmarker.task")

# =========================================================================
# FEATURE LAYOUT  (mirror in landmarks.ts)
# =========================================================================
# Curated upper-body pose points. Index = MediaPipe Pose landmark id.
POSE_KEYPOINTS = [
    0,    # nose
    11,   # left shoulder
    12,   # right shoulder
    13,   # left elbow
    14,   # right elbow
    15,   # left wrist
    16,   # right wrist
    23,   # left hip
    24,   # right hip
]
N_POSE = len(POSE_KEYPOINTS)          # 9
N_HAND = 21                           # MediaPipe hand landmarks per hand

# Per-frame feature vector:
#   pose:  N_POSE * 2 (x,y)
#   left:  N_HAND * 2
#   right: N_HAND * 2
#   flags: left_present, right_present
N_COORDS = 2
FEATURE_DIM = (N_POSE + N_HAND + N_HAND) * N_COORDS + 2   # 9*2+21*2+21*2+2 = 104

# Index of presence flags inside the per-frame vector.
LEFT_PRESENT_IDX = (N_POSE + N_HAND + N_HAND) * N_COORDS       # 102
RIGHT_PRESENT_IDX = LEFT_PRESENT_IDX + 1                       # 103

# Normalization: shoulder midpoint = origin, shoulder width = unit scale.
MIN_SHOULDER_WIDTH = 1e-3

# =========================================================================
# SEQUENCE / WINDOW
# =========================================================================
SEQ_LEN = 20                  # frames fed to the model (resampled per clip)
RECORD_FPS = 24               # capture rate while recording clips
CLIP_SECONDS = 1.8            # nominal clip length while recording
MIN_CLIP_FRAMES = 5           # clips shorter than this are dropped

# Live inference window (web): slide over the most recent frames.
LIVE_WINDOW = SEQ_LEN
LIVE_STRIDE = 1               # run the model every N frames (stride=1 → every frame)

# =========================================================================
# TRAINING
# =========================================================================
VAL_SPLIT = 0.2               # held out by CLIP, never by frame
BATCH_SIZE = 32
EPOCHS = 80
LEARNING_RATE = 1e-3
SEED = 42

NEUTRAL_LABEL = "neutral"     # idle / no-sign. Never shown as a caption.


def load_labels() -> list[str]:
    """labels.txt — one label per line; '#' comments ignored."""
    if not os.path.isfile(LABELS_FILE):
        return [NEUTRAL_LABEL]
    out: list[str] = []
    with open(LABELS_FILE, encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if s not in out:
                out.append(s)
    if NEUTRAL_LABEL not in out:
        out.append(NEUTRAL_LABEL)
    return out
