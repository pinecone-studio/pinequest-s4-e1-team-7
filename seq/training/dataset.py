"""
Build training tensors from recorded clips.

- Loads raw clips (frames, FEATURE_DIM) from data/raw/.
- Resamples each clip to SEQ_LEN frames (linear interpolation over time).
- Normalizes (shoulder-centered, shoulder-scaled).
- Augments TRAINING clips (jitter, scale, rotate, time-warp, mirror).
- Splits by CLIP (never by frame) to avoid leakage.
"""
from __future__ import annotations

import os
import numpy as np

import config as C
import landmarks as L

rng = np.random.default_rng(C.SEED)

# Per-label aug count comes from config.aug_per_clip() (motion vs static).


# ----------------------------------------------------------------------- IO
def load_clips() -> tuple[list[np.ndarray], list[str]]:
    seqs: list[np.ndarray] = []
    labels: list[str] = []
    if not os.path.isdir(C.RAW_DIR):
        return seqs, labels
    for label_dir in sorted(os.listdir(C.RAW_DIR)):
        d = os.path.join(C.RAW_DIR, label_dir)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if not name.endswith(".npy"):
                continue
            arr = np.load(os.path.join(d, name)).astype(np.float32)
            if arr.ndim != 2 or arr.shape[1] != C.FEATURE_DIM:
                continue
            if arr.shape[0] < C.MIN_CLIP_FRAMES:
                continue
            # Recover the human label from the manifest dir name is lossy;
            # use the original label stored alongside via folder mapping.
            seqs.append(arr)
            labels.append(_label_from_dir(label_dir))
    return seqs, labels


_dir_to_label: dict[str, str] | None = None


def _label_from_dir(safe_dir: str) -> str:
    """Map a sanitized folder name back to its real label via labels.txt."""
    global _dir_to_label
    if _dir_to_label is None:
        _dir_to_label = {C.safe_name(lbl): lbl for lbl in C.load_labels()}
    return _dir_to_label.get(safe_dir, safe_dir)


# ------------------------------------------------------------------ resample
def resample_time(seq: np.ndarray, T: int) -> np.ndarray:
    """Linear interpolation of a (F0, D) sequence to (T, D)."""
    f0 = seq.shape[0]
    if f0 == T:
        return seq
    src = np.linspace(0.0, 1.0, f0)
    dst = np.linspace(0.0, 1.0, T)
    out = np.empty((T, seq.shape[1]), dtype=np.float32)
    for d in range(seq.shape[1]):
        out[:, d] = np.interp(dst, src, seq[:, d])
    return out


# --------------------------------------------------------------- flip mapping
def _build_flip_index() -> np.ndarray:
    """Index permutation that mirrors left<->right; x coords negated after."""
    idx = np.arange(C.FEATURE_DIM)
    # pose curated pairs (in curated order): (1,2)(3,4)(5,6)(7,8)
    pose_pairs = [(1, 2), (3, 4), (5, 6), (7, 8)]
    for a, b in pose_pairs:
        for c in range(C.N_COORDS):
            idx[a * C.N_COORDS + c], idx[b * C.N_COORDS + c] = (
                b * C.N_COORDS + c, a * C.N_COORDS + c
            )
    # swap whole left-hand and right-hand blocks
    lh = C.N_POSE * C.N_COORDS
    rh = lh + C.N_HAND * C.N_COORDS
    block = C.N_HAND * C.N_COORDS
    for k in range(block):
        idx[lh + k], idx[rh + k] = rh + k, lh + k
    # swap presence flags
    idx[C.LEFT_PRESENT_IDX], idx[C.RIGHT_PRESENT_IDX] = (
        C.RIGHT_PRESENT_IDX, C.LEFT_PRESENT_IDX
    )
    return idx


_FLIP_IDX = _build_flip_index()
_X_MASK = np.zeros(C.FEATURE_DIM, dtype=bool)
for _p in range(C.N_POSE + C.N_HAND + C.N_HAND):
    _X_MASK[_p * C.N_COORDS] = True   # x coordinate columns


def horizontal_flip(seq_norm: np.ndarray) -> np.ndarray:
    out = seq_norm[:, _FLIP_IDX].copy()
    out[:, _X_MASK] *= -1.0
    return out


# ----------------------------------------------------------------- augment
def _rotate(seq: np.ndarray, deg: float) -> np.ndarray:
    th = np.deg2rad(deg)
    cos, sin = np.cos(th), np.sin(th)
    out = seq.copy()
    n_points = C.N_POSE + C.N_HAND + C.N_HAND
    for p in range(n_points):
        xi, yi = p * C.N_COORDS, p * C.N_COORDS + 1
        x, y = seq[:, xi], seq[:, yi]
        present = (x != 0) | (y != 0)
        out[:, xi] = np.where(present, x * cos - y * sin, 0.0)
        out[:, yi] = np.where(present, x * sin + y * cos, 0.0)
    return out


def speed_up(seq: np.ndarray) -> np.ndarray:
    """Дохиог хурдасгах — clip-ийн 60-95%-ийг авч resample хийнэ."""
    f0 = seq.shape[0]
    if f0 <= C.MIN_CLIP_FRAMES:
        return seq
    frac = rng.uniform(0.60, 0.95)
    n = max(C.MIN_CLIP_FRAMES, int(f0 * frac))
    start = rng.integers(0, f0 - n + 1)
    return seq[start:start + n]


def add_hand_noise(seq_norm: np.ndarray, std: float = 0.018) -> np.ndarray:
    """Гарын landmark-д байгалийн чичиргээ симуляци."""
    out = seq_norm.copy()
    hand_slice = slice(C.N_POSE * C.N_COORDS,
                       (C.N_POSE + C.N_HAND + C.N_HAND) * C.N_COORDS)
    out[:, hand_slice] += rng.normal(0, std, out[:, hand_slice].shape).astype(np.float32)
    return out


def augment(seq_norm: np.ndarray) -> np.ndarray:
    out = seq_norm.copy()
    if rng.random() < 0.5:
        out = horizontal_flip(out)
    # scale
    s = rng.uniform(0.88, 1.12)
    out[:, _coord_mask()] *= s
    # rotate
    out = _rotate(out, rng.uniform(-15, 15))
    # translate
    tx, ty = rng.uniform(-0.10, 0.10), rng.uniform(-0.10, 0.10)
    out = _translate(out, tx, ty)
    # landmark jitter (whole body)
    noise = rng.normal(0, 0.010, size=out.shape).astype(np.float32)
    noise[:, [C.LEFT_PRESENT_IDX, C.RIGHT_PRESENT_IDX]] = 0
    out = out + noise
    # additional hand noise ~50%
    if rng.random() < 0.5:
        out = add_hand_noise(out, std=rng.uniform(0.010, 0.025))
    return out.astype(np.float32)


_COORD_MASK = None


def _coord_mask() -> np.ndarray:
    global _COORD_MASK
    if _COORD_MASK is None:
        m = np.zeros(C.FEATURE_DIM, dtype=bool)
        for p in range(C.N_POSE + C.N_HAND + C.N_HAND):
            m[p * C.N_COORDS] = True
            m[p * C.N_COORDS + 1] = True
        _COORD_MASK = m
    return _COORD_MASK


def _translate(seq: np.ndarray, tx: float, ty: float) -> np.ndarray:
    out = seq.copy()
    n_points = C.N_POSE + C.N_HAND + C.N_HAND
    for p in range(n_points):
        xi, yi = p * C.N_COORDS, p * C.N_COORDS + 1
        x, y = seq[:, xi], seq[:, yi]
        present = (x != 0) | (y != 0)
        out[:, xi] = np.where(present, x + tx, 0.0)
        out[:, yi] = np.where(present, y + ty, 0.0)
    return out


def time_warp(raw_seq: np.ndarray, *, motion: bool = False) -> np.ndarray:
    """Randomly speed up / slow down by cropping a sub-window before resample."""
    f0 = raw_seq.shape[0]
    if f0 <= C.MIN_CLIP_FRAMES:
        return raw_seq
    lo, hi = (0.55, 1.0) if motion else (0.75, 1.0)
    frac = rng.uniform(lo, hi)
    win = max(C.MIN_CLIP_FRAMES, int(f0 * frac))
    start = rng.integers(0, f0 - win + 1)
    return raw_seq[start:start + win]


def temporal_shift(raw_seq: np.ndarray) -> np.ndarray:
    """Pad or trim start/end — simulates early/late sign onset in the clip."""
    f0 = raw_seq.shape[0]
    if f0 <= C.MIN_CLIP_FRAMES + 2:
        return raw_seq
    drop = rng.integers(1, max(2, f0 // 6))
    side = rng.choice(["start", "end"])
    if side == "start":
        return raw_seq[drop:]
    return raw_seq[:-drop]


# ------------------------------------------------------------------- build
def build_dataset():
    seqs, labels = load_clips()
    if not seqs:
        raise SystemExit("Clip алга. Эхлээд: python3 record.py")

    label_names = sorted(set(labels))
    label_to_id = {l: i for i, l in enumerate(label_names)}

    by_label: dict[str, list[np.ndarray]] = {l: [] for l in label_names}
    for s, l in zip(seqs, labels):
        by_label[l].append(s)

    X_tr, y_tr, X_va, y_va = [], [], [], []

    for lbl in label_names:
        clips = by_label[lbl]
        rng.shuffle(clips)
        n_val = max(1, int(len(clips) * C.VAL_SPLIT)) if len(clips) > 2 else 0
        val_clips = clips[:n_val]
        train_clips = clips[n_val:]

        for clip in val_clips:
            norm = L.normalize(resample_time(clip, C.SEQ_LEN))
            X_va.append(norm)
            y_va.append(label_to_id[lbl])

        motion = not C.is_static_sign(lbl)
        two_hand = C.hand_mode_for(lbl) == 2
        n_aug = C.aug_per_clip(lbl)
        for clip in train_clips:
            base = L.normalize(resample_time(clip, C.SEQ_LEN))
            X_tr.append(base)
            y_tr.append(label_to_id[lbl])
            for i in range(n_aug):
                src = clip
                if (motion or two_hand) and i % 3 == 0:
                    src = temporal_shift(src)
                elif i % 2 == 0:
                    src = time_warp(src, motion=motion or two_hand)
                else:
                    src = speed_up(src)
                norm = L.normalize(resample_time(src, C.SEQ_LEN))
                X_tr.append(augment(norm))
                y_tr.append(label_to_id[lbl])

    X_tr = np.asarray(X_tr, dtype=np.float32)
    y_tr = np.asarray(y_tr, dtype=np.int64)
    X_va = np.asarray(X_va, dtype=np.float32)
    y_va = np.asarray(y_va, dtype=np.int64)

    # shuffle train
    perm = rng.permutation(len(X_tr))
    X_tr, y_tr = X_tr[perm], y_tr[perm]

    counts = {l: len(by_label[l]) for l in label_names}
    return X_tr, y_tr, X_va, y_va, label_names, counts


if __name__ == "__main__":
    Xtr, ytr, Xva, yva, names, counts = build_dataset()
    print("labels:", names)
    print("clips per label:", counts)
    print("train:", Xtr.shape, "val:", Xva.shape)
