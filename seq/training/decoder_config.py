"""Stage-2 PredStreamDecoder — config (mirror in pred-decoder.ts)."""
from __future__ import annotations

import os

import config as C

DECODER_ARTIFACTS = os.path.join(C.ARTIFACTS_DIR, "decoder")
DECODER_KERAS = os.path.join(DECODER_ARTIFACTS, "decoder.keras")
DECODER_REPORT = os.path.join(DECODER_ARTIFACTS, "decoder_report.txt")
WEB_DECODER_DIR = os.path.join(C.SEQ_DIR, "web", "public", "models", "decoder")

# Sliding window over stage-1 prediction steps.
DECODER_WINDOW = 12
# Per step: softmax probs (n_classes) + conf + margin + motion
DECODER_EXTRA_FEATS = 3

# Action classes
ACT_SILENCE = 0
ACT_HOLD = 1
ACT_EMIT = 2
DECODER_ACTIONS = ("silence", "hold", "emit")

# Training
DECODER_BATCH = 64
DECODER_EPOCHS = 40
DECODER_LR = 8e-4
DECODER_VAL_SPLIT = 0.15
DECODER_SEED = 43
# Class weights for rare EMIT
DECODER_EMIT_WEIGHT = 4.0
DECODER_HOLD_WEIGHT = 1.5

# Live (exported → decoder/metadata.json)
DECODER_EMIT_THRESHOLD = 0.62
DECODER_MIN_GAP_MS = 180
DECODER_SAME_LABEL_COOLDOWN_MS = 400

# Noise injection rate when synthesizing training streams
DECODER_NOISE_RATE = 0.28

# Stratified cap — enough diversity without simulating every clip through stage-1.
DECODER_MAX_CLIPS_PER_LABEL = 24
