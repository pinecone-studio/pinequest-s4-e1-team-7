#!/usr/bin/env python3
"""
Train Stage-2 PredStreamDecoder on simulated live prediction streams.

Stage 1 (TCN on landmarks) → pred stream → Stage 2 (BiGRU) → emit/silence.

Run after train.py:
    python3 train_decoder.py
    python3 export_decoder.py
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np

import config as C
import decoder_config as D
from dataset import load_clips, resample_time
import landmarks as L

rng = np.random.default_rng(D.DECODER_SEED)

# Live-like timeline: idle → sign → idle (raw frames, normalized per sliding step).
_SIM_PRE_ZERO = (8, 16)
_SIM_SIGN_FRAMES = (22, 36)
_SIM_POST_ZERO = (8, 16)
_SIM_VARIANTS = 2


def _load_stage1():
    import tensorflow as tf

    h5_path = os.path.join(C.ARTIFACTS_DIR, "model.h5")
    keras_path = os.path.join(C.ARTIFACTS_DIR, "model.keras")
    if os.path.isfile(h5_path):
        return tf.keras.models.load_model(h5_path, compile=False)
    if os.path.isfile(keras_path):
        try:
            return tf.keras.models.load_model(keras_path, compile=False)
        except TypeError:
            from export_model import _load_keras_model

            return _load_keras_model(keras_path)
    sys.exit("❌ model.h5 / model.keras олдсонгүй — python3 train.py && export_model.py")


def _hand_motion(frames: np.ndarray) -> float:
    n = frames.shape[0]
    if n < 2:
        return 0.0
    hand0 = C.N_POSE * C.N_COORDS
    hand1 = hand0 + 2 * C.N_HAND * C.N_COORDS
    total = 0.0
    pairs = 0
    for t in range(1, n):
        f0, f1 = frames[t - 1], frames[t]
        for i in range(hand0, hand1, C.N_COORDS):
            if f0[i] == 0 and f0[i + 1] == 0 and f1[i] == 0 and f1[i + 1] == 0:
                continue
            total += np.hypot(f1[i] - f0[i], f1[i + 1] - f0[i + 1])
            pairs += 1
    return float(total / pairs) if pairs else 0.0


def _load_label_names() -> list[str]:
    meta_path = os.path.join(C.WEB_MODEL_DIR, "metadata.json")
    if os.path.isfile(meta_path):
        with open(meta_path, encoding="utf-8") as f:
            return json.load(f)["labels"]
    from dataset import build_dataset

    *_, labels, _ = build_dataset()
    return labels


def _zero_frame() -> np.ndarray:
    return np.zeros(C.FEATURE_DIM, dtype=np.float32)


def _build_live_timeline(raw_clip: np.ndarray) -> tuple[np.ndarray, tuple[int, int]]:
    """Pad with idle zeros so sliding window yields enough pred steps."""
    pre = int(rng.integers(*_SIM_PRE_ZERO))
    sign_t = int(rng.integers(*_SIM_SIGN_FRAMES))
    post = int(rng.integers(*_SIM_POST_ZERO))
    sign = resample_time(raw_clip, sign_t)
    z = _zero_frame()
    prefix = np.tile(z, (pre, 1))
    suffix = np.tile(z, (post, 1))
    timeline = np.concatenate([prefix, sign, suffix], axis=0)
    return timeline, (pre, pre + sign_t)


def _inject_noise(probs: np.ndarray, n_classes: int) -> np.ndarray:
    wrong = int(rng.integers(0, n_classes))
    out = np.zeros(n_classes, dtype=np.float32)
    out[wrong] = 0.55 + float(rng.random()) * 0.35
    rest = 1.0 - out[wrong]
    others = [i for i in range(n_classes) if i != wrong]
    if others:
        share = rest / len(others)
        for i in others:
            out[i] = share
    return out


def simulate_stream(
    model,
    timeline: np.ndarray,
    true_id: int | None,
    n_classes: int,
    sign_range: tuple[int, int] | None = None,
    *,
    inject_noise: bool = True,
    batch_size: int = 128,
) -> tuple[list[np.ndarray], list[int]]:
    """Replay expanded timeline through stage-1 sliding window."""
    buf = np.zeros((C.SEQ_LEN, C.FEATURE_DIM), dtype=np.float32)
    norm_bufs: list[np.ndarray] = []
    frame_ids: list[int] = []

    for fi in range(timeline.shape[0]):
        buf = np.roll(buf, -1, axis=0)
        buf[-1] = timeline[fi]
        if fi < C.SEQ_LEN - 1:
            continue
        norm_bufs.append(L.normalize(buf))
        frame_ids.append(fi)

    if not norm_bufs:
        return [], []

    probs_all: list[np.ndarray] = []
    for i in range(0, len(norm_bufs), batch_size):
        chunk = np.stack(norm_bufs[i : i + batch_size])
        probs_all.extend(model.predict(chunk, verbose=0))

    feats: list[np.ndarray] = []
    steps_meta: list[dict] = []
    for fi, probs in zip(frame_ids, probs_all):
        probs = probs.astype(np.float32)
        if inject_noise and rng.random() < D.DECODER_NOISE_RATE:
            probs = _inject_noise(probs, n_classes)

        best = int(probs.argmax())
        conf = float(probs[best])
        sorted_p = np.sort(probs)
        margin = conf - float(sorted_p[-2]) if n_classes > 1 else conf
        motion = _hand_motion(norm_bufs[len(feats)])
        in_sign = sign_range is not None and sign_range[0] <= fi < sign_range[1]

        step = np.concatenate([probs, [conf, margin, motion]]).astype(np.float32)
        feats.append(step)
        steps_meta.append(
            {
                "top1": best,
                "true_prob": float(probs[true_id]) if true_id is not None else 0.0,
                "in_sign": in_sign,
            }
        )

    n = len(feats)
    if n == 0:
        return [], []

    sign_steps = [i for i, m in enumerate(steps_meta) if m["in_sign"]]
    if not sign_steps or true_id is None:
        return feats, [D.ACT_SILENCE] * n

    peak = sign_steps[
        int(np.argmax([steps_meta[i]["true_prob"] for i in sign_steps]))
    ]
    actions: list[int] = []
    for t in range(n):
        top1 = steps_meta[t]["top1"]
        if t == peak and top1 == true_id:
            actions.append(D.ACT_EMIT)
        elif abs(t - peak) <= 1 and top1 == true_id:
            actions.append(D.ACT_HOLD)
        else:
            actions.append(D.ACT_SILENCE)

    return feats, actions


def build_windows(
    all_feats: list[np.ndarray],
    all_actions: list[int],
    window: int,
) -> tuple[np.ndarray, np.ndarray]:
    xs, ys = [], []
    for feats, actions in zip(all_feats, all_actions):
        if len(feats) < window:
            continue
        for t in range(window - 1, len(feats)):
            xs.append(np.stack(feats[t - window + 1 : t + 1]))
            ys.append(actions[t])
    if not xs:
        raise SystemExit("Decoder training data хоосон.")
    return np.asarray(xs, dtype=np.float32), np.asarray(ys, dtype=np.int64)


def build_model(window: int, feat_dim: int, n_actions: int = 3):
    import tensorflow as tf
    from tensorflow.keras import layers, models

    inp = layers.Input(shape=(window, feat_dim), name="pred_window")
    x = layers.Bidirectional(layers.GRU(48, return_sequences=True))(inp)
    x = layers.Bidirectional(layers.GRU(24, return_sequences=False))(x)
    x = layers.Dropout(0.25)(x)
    out = layers.Dense(n_actions, activation="softmax", name="action")(x)
    model = models.Model(inp, out)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(D.DECODER_LR),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def class_weights(y: np.ndarray) -> dict[int, float]:
    counts = np.bincount(y, minlength=3).astype(np.float64)
    counts[counts == 0] = 1.0
    w = counts.sum() / (3 * counts)
    w[D.ACT_EMIT] *= D.DECODER_EMIT_WEIGHT
    w[D.ACT_HOLD] *= D.DECODER_HOLD_WEIGHT
    return {i: float(w[i]) for i in range(3)}


def _subsample_clips(
    seqs: list[np.ndarray], labels: list[str], max_per_label: int
) -> tuple[list[np.ndarray], list[str]]:
    by_label: dict[str, list[np.ndarray]] = {}
    for seq, lbl in zip(seqs, labels):
        by_label.setdefault(lbl, []).append(seq)
    out_seqs: list[np.ndarray] = []
    out_labels: list[str] = []
    for lbl in sorted(by_label):
        clips = by_label[lbl]
        if len(clips) > max_per_label:
            pick = rng.choice(len(clips), max_per_label, replace=False)
            clips = [clips[int(i)] for i in pick]
        out_seqs.extend(clips)
        out_labels.extend([lbl] * len(clips))
    return out_seqs, out_labels


def main() -> None:
    import tensorflow as tf

    tf.random.set_seed(D.DECODER_SEED)
    stage1 = _load_stage1()
    seqs, labels = load_clips()
    if not seqs:
        sys.exit("Clip алга.")
    seqs, labels = _subsample_clips(seqs, labels, D.DECODER_MAX_CLIPS_PER_LABEL)
    print(f"clips for decoder sim: {len(seqs)}")

    label_names = _load_label_names()
    label_to_id = {l: i for i, l in enumerate(label_names)}
    n_classes = len(label_names)
    feat_dim = n_classes + D.DECODER_EXTRA_FEATS

    all_feats: list[list[np.ndarray]] = []
    all_actions: list[list[int]] = []

    total = len(seqs)
    for i, (seq, lbl) in enumerate(zip(seqs, labels)):
        if i and i % 250 == 0:
            print(f"  simulate {i}/{total} clips…", flush=True)
        if lbl not in label_to_id:
            continue
        tid = label_to_id[lbl]
        variants = 1 if lbl == C.NEUTRAL_LABEL else _SIM_VARIANTS
        for _ in range(variants):
            timeline, sign_range = _build_live_timeline(seq)
            true_id = None if lbl == C.NEUTRAL_LABEL else tid
            sr = None if lbl == C.NEUTRAL_LABEL else sign_range
            feats, actions = simulate_stream(
                stage1, timeline, true_id, n_classes, sr
            )
            if len(feats) >= D.DECODER_WINDOW:
                all_feats.append(feats)
                all_actions.append(actions)

    X, y = build_windows(all_feats, all_actions, D.DECODER_WINDOW)
    print(f"decoder samples: {X.shape}, emit rate: {(y == D.ACT_EMIT).mean():.3f}")

    n = len(X)
    idx = rng.permutation(n)
    n_val = max(1, int(n * D.DECODER_VAL_SPLIT))
    va = idx[:n_val]
    tr = idx[n_val:]

    model = build_model(D.DECODER_WINDOW, feat_dim)
    model.summary()

    os.makedirs(D.DECODER_ARTIFACTS, exist_ok=True)
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=8, restore_best_weights=True
        ),
    ]
    model.fit(
        X[tr],
        y[tr],
        validation_data=(X[va], y[va]),
        epochs=D.DECODER_EPOCHS,
        batch_size=D.DECODER_BATCH,
        class_weight=class_weights(y[tr]),
        callbacks=callbacks,
        verbose=2,
    )

    model.save(D.DECODER_KERAS)

    probs = model.predict(X[va], verbose=0)
    pred = probs.argmax(axis=1)
    acc = float((pred == y[va]).mean())
    emit_mask = y[va] == D.ACT_EMIT
    emit_recall = float((pred[emit_mask] == D.ACT_EMIT).mean()) if emit_mask.any() else 0.0

    report = (
        f"val accuracy: {acc:.4f}\n"
        f"emit recall:  {emit_recall:.4f}\n"
        f"window: {D.DECODER_WINDOW}, feat_dim: {feat_dim}\n"
    )
    print(report)
    with open(D.DECODER_REPORT, "w", encoding="utf-8") as f:
        f.write(report)

    meta = {
        "window": D.DECODER_WINDOW,
        "featDim": feat_dim,
        "nClasses": n_classes,
        "nActions": 3,
        "actions": list(D.DECODER_ACTIONS),
        "emitIndex": D.ACT_EMIT,
        "emitThreshold": D.DECODER_EMIT_THRESHOLD,
        "minGapMs": D.DECODER_MIN_GAP_MS,
        "sameLabelCooldownMs": D.DECODER_SAME_LABEL_COOLDOWN_MS,
        "labels": label_names,
    }
    os.makedirs(D.WEB_DECODER_DIR, exist_ok=True)
    with open(os.path.join(D.WEB_DECODER_DIR, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"✓ {D.DECODER_KERAS}")
    print("  python3 export_decoder.py")


if __name__ == "__main__":
    main()
