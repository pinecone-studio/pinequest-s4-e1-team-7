"""
Single source of truth for the sequence (temporal) sign recognizer.

CRITICAL: every constant that affects the feature vector (selected pose
landmarks, sequence length, normalization) MUST be mirrored exactly in
the web client (seq/web/lib/landmarks.ts). If you change one, change both.
"""
from __future__ import annotations

import json
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
HAND_MODES_FILE = os.path.join(BASE_DIR, "hand_modes.json")

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

# Augmentation: motion/word signs need more temporal diversity than static letters.
AUG_PER_CLIP_STATIC = 6
AUG_PER_CLIP_MOTION = 18
AUG_PER_CLIP_TWO_HAND = 26

# Live emitter tuning (exported → metadata.json → web client).
LIVE_MIN_CONFIDENCE = 0.68
LIVE_MIN_STREAK = 3
LIVE_STREAK_MIN_AVG_CONF = 0.72
LIVE_EARLY_EXIT_CONFIDENCE = 0.88
LIVE_POST_EMIT_BLOCK_MS = 80
LIVE_GAP_BETWEEN_WORDS_MS = 80
LIVE_SAME_LABEL_COOLDOWN_MS = 1500
LIVE_STATIC_SAME_LABEL_COOLDOWN_MS = 1800
LIVE_ONE_HAND_WORD_SAME_LABEL_COOLDOWN_MS = 2000

# ≥95% confidence → streak/gap алгасаж шууд emit.
LIVE_INSTANT_EMIT_CONFIDENCE = 0.95
LIVE_INSTANT_POST_EMIT_BLOCK_MS = 50
LIVE_INSTANT_SAME_LABEL_COOLDOWN_MS = 1500
LIVE_IDLE_MAX_MOTION = 0.0020

# Static letters — хурдан emit; cross-letter gap бага, same-label урт.
LIVE_STATIC_MIN_CONFIDENCE = 0.78
LIVE_STATIC_MIN_MARGIN = 0.16
LIVE_STATIC_STREAK_MIN_AVG_CONF = 0.76
LIVE_STATIC_EARLY_EXIT_CONFIDENCE = 0.85
LIVE_STATIC_MIN_STREAK = 1
LIVE_STATIC_HOLD_MIN_MOTION = 0.0005
LIVE_STATIC_MAX_MOTION = 0.0045
LIVE_STATIC_ANY_LETTER_COOLDOWN_MS = 0
LIVE_STATIC_POST_EMIT_BLOCK_MS = 12
LIVE_STATIC_INSTANT_EMIT_CONFIDENCE = 0.85
LIVE_STATIC_INSTANT_POST_EMIT_BLOCK_MS = 8
LIVE_STATIC_RESET_CLEAR_FRAC = 0.55
LIVE_STATIC_LIVE_INFER_FRAMES = 6
LIVE_STATIC_INSTANT_SAME_LABEL_COOLDOWN_MS = 1800

# 1-hand motion words — илүү хатуу (миний/Ганхөлөг false positive).
LIVE_ONE_HAND_WORD_MIN_CONFIDENCE = 0.78
LIVE_ONE_HAND_WORD_MIN_MARGIN = 0.16
LIVE_ONE_HAND_WORD_MIN_STREAK = 5
LIVE_ONE_HAND_WORD_STREAK_MIN_AVG_CONF = 0.80
LIVE_ONE_HAND_WORD_MIN_MOTION = 0.0042
LIVE_ONE_HAND_WORD_ANY_COOLDOWN_MS = 220
LIVE_ONE_HAND_WORD_EARLY_EXIT_CONFIDENCE = 0.95
LIVE_FRAGILE_ONE_HAND_LABELS = ("миний", "Ганхөлөг")
LIVE_FRAGILE_EXTRA_CONF = 0.06
LIVE_FRAGILE_EXTRA_MARGIN = 0.08

# Two-hand signs — motion gate blocks idle spam; thresholds tuned for real signs.
LIVE_TWO_HAND_MIN_CONFIDENCE = 0.74
LIVE_TWO_HAND_MIN_MARGIN = 0.10
LIVE_TWO_HAND_MIN_STREAK = 3
LIVE_TWO_HAND_STREAK_MIN_AVG_CONF = 0.78
LIVE_TWO_HAND_EARLY_EXIT_CONFIDENCE = 0.90
LIVE_TWO_HAND_POST_EMIT_BLOCK_MS = 120
LIVE_TWO_HAND_GAP_MS = 150
LIVE_TWO_HAND_SAME_LABEL_COOLDOWN_MS = 2500
LIVE_TWO_HAND_WINDOW_FRAC = 0.50
LIVE_TWO_HAND_MOTION_MIN = 0.0035


def is_static_sign(label: str) -> bool:
    """Single Cyrillic/Latin letter (А, В, …) vs motion/word signs."""
    if label == NEUTRAL_LABEL:
        return False
    s = label.strip().replace("_", " ")
    # One grapheme only — not words like "би" (2 letters).
    return len(s) == 1 and s.isalpha()


def aug_per_clip(label: str) -> int:
    if hand_mode_for(label) == 2:
        return AUG_PER_CLIP_TWO_HAND
    if is_static_sign(label):
        return AUG_PER_CLIP_STATIC
    return AUG_PER_CLIP_MOTION


def load_hand_modes() -> dict[str, int]:
    """label → 0 (any/neutral), 1 (one hand), 2 (two hands)."""
    modes: dict[str, int] = {NEUTRAL_LABEL: 0}
    if not os.path.isfile(HAND_MODES_FILE):
        return modes
    with open(HAND_MODES_FILE, encoding="utf-8") as f:
        raw = json.load(f)
    for key, val in raw.items():
        if key.startswith("_"):
            continue
        if val in (0, 1, 2):
            modes[key.strip()] = int(val)
    return modes


def hand_mode_for(label: str, modes: dict[str, int] | None = None) -> int:
    """Default 1 (one hand) when label missing from hand_modes.json."""
    if label == NEUTRAL_LABEL:
        return 0
    m = modes if modes is not None else load_hand_modes()
    s = label.strip()
    if s in m:
        return m[s]
    for human, mode in m.items():
        if safe_name(human) == s:
            return mode
    return 1


def hand_modes_for_labels(labels: list[str]) -> list[int]:
    """Parallel to model label list — for metadata.json / live class mask."""
    modes = load_hand_modes()
    return [hand_mode_for(lbl, modes) for lbl in labels]


def live_metadata_extra(labels: list[str] | None = None) -> dict:
    """Extra keys written into web/public/models/seq/metadata.json."""
    extra: dict = {
        "minLiveConfidence": LIVE_MIN_CONFIDENCE,
        "minStreak": LIVE_MIN_STREAK,
        "streakMinAvgConf": LIVE_STREAK_MIN_AVG_CONF,
        "earlyExitConfidence": LIVE_EARLY_EXIT_CONFIDENCE,
        "postEmitBlockMs": LIVE_POST_EMIT_BLOCK_MS,
        "gapBetweenWordsMs": LIVE_GAP_BETWEEN_WORDS_MS,
        "sameLabelCooldownMs": LIVE_SAME_LABEL_COOLDOWN_MS,
        "staticSameLabelCooldownMs": LIVE_STATIC_SAME_LABEL_COOLDOWN_MS,
        "oneHandWordSameLabelCooldownMs": LIVE_ONE_HAND_WORD_SAME_LABEL_COOLDOWN_MS,
        "instantEmitConfidence": LIVE_INSTANT_EMIT_CONFIDENCE,
        "instantPostEmitBlockMs": LIVE_INSTANT_POST_EMIT_BLOCK_MS,
        "instantSameLabelCooldownMs": LIVE_INSTANT_SAME_LABEL_COOLDOWN_MS,
        "staticMinConfidence": LIVE_STATIC_MIN_CONFIDENCE,
        "staticMinMargin": LIVE_STATIC_MIN_MARGIN,
        "staticStreakMinAvgConf": LIVE_STATIC_STREAK_MIN_AVG_CONF,
        "staticEarlyExitConfidence": LIVE_STATIC_EARLY_EXIT_CONFIDENCE,
        "staticMinStreak": LIVE_STATIC_MIN_STREAK,
        "staticHoldMinMotion": LIVE_STATIC_HOLD_MIN_MOTION,
        "staticMaxMotion": LIVE_STATIC_MAX_MOTION,
        "staticAnyLetterCooldownMs": LIVE_STATIC_ANY_LETTER_COOLDOWN_MS,
        "staticPostEmitBlockMs": LIVE_STATIC_POST_EMIT_BLOCK_MS,
        "staticInstantEmitConfidence": LIVE_STATIC_INSTANT_EMIT_CONFIDENCE,
        "staticInstantPostEmitBlockMs": LIVE_STATIC_INSTANT_POST_EMIT_BLOCK_MS,
        "staticInstantSameLabelCooldownMs": LIVE_STATIC_INSTANT_SAME_LABEL_COOLDOWN_MS,
        "staticResetClearFrac": LIVE_STATIC_RESET_CLEAR_FRAC,
        "staticLiveInferFrames": LIVE_STATIC_LIVE_INFER_FRAMES,
        "idleMaxMotion": LIVE_IDLE_MAX_MOTION,
        "oneHandWordMinConfidence": LIVE_ONE_HAND_WORD_MIN_CONFIDENCE,
        "oneHandWordMinMargin": LIVE_ONE_HAND_WORD_MIN_MARGIN,
        "oneHandWordMinStreak": LIVE_ONE_HAND_WORD_MIN_STREAK,
        "oneHandWordStreakMinAvgConf": LIVE_ONE_HAND_WORD_STREAK_MIN_AVG_CONF,
        "oneHandWordMinMotion": LIVE_ONE_HAND_WORD_MIN_MOTION,
        "oneHandWordAnyCooldownMs": LIVE_ONE_HAND_WORD_ANY_COOLDOWN_MS,
        "oneHandWordEarlyExitConfidence": LIVE_ONE_HAND_WORD_EARLY_EXIT_CONFIDENCE,
        "fragileOneHandLabels": list(LIVE_FRAGILE_ONE_HAND_LABELS),
        "fragileExtraConf": LIVE_FRAGILE_EXTRA_CONF,
        "fragileExtraMargin": LIVE_FRAGILE_EXTRA_MARGIN,
        "motionMinMargin": LIVE_ONE_HAND_WORD_MIN_MARGIN,
        "twoHandMinConfidence": LIVE_TWO_HAND_MIN_CONFIDENCE,
        "twoHandMinMargin": LIVE_TWO_HAND_MIN_MARGIN,
        "twoHandMinStreak": LIVE_TWO_HAND_MIN_STREAK,
        "twoHandStreakMinAvgConf": LIVE_TWO_HAND_STREAK_MIN_AVG_CONF,
        "twoHandEarlyExitConfidence": LIVE_TWO_HAND_EARLY_EXIT_CONFIDENCE,
        "twoHandPostEmitBlockMs": LIVE_TWO_HAND_POST_EMIT_BLOCK_MS,
        "twoHandGapMs": LIVE_TWO_HAND_GAP_MS,
        "twoHandSameLabelCooldownMs": LIVE_TWO_HAND_SAME_LABEL_COOLDOWN_MS,
        "twoHandWindowFrac": LIVE_TWO_HAND_WINDOW_FRAC,
        "twoHandMotionMin": LIVE_TWO_HAND_MOTION_MIN,
    }
    if labels:
        extra["handModes"] = hand_modes_for_labels(labels)
    return extra


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
