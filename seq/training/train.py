"""
Train the temporal sign recognizer and export to TensorFlow.js.

Model: Conv1D (local motion) -> BiGRU (temporal) -> Dense -> softmax.
Input:  (SEQ_LEN, FEATURE_DIM) normalized landmark sequence.
Output: probability over labels (incl. 'neutral').

Run:
    python3 train.py

Outputs:
    artifacts/model.keras
    artifacts/report.txt
    ../web/public/models/seq/   (TFJS model.json + weights + metadata.json)
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

import numpy as np

import config as C
from dataset import build_dataset


def _tcn_block(x, filters: int, kernel: int, dilation: int, dropout: float,
               layers):
    """Dilated Conv1D residual block.

    padding="same" is used instead of "causal" because TF.js has a known shape
    bug when causal + dilation_rate > 1 are combined (outputs [seq/dilation]
    instead of [seq]). Same padding is functionally equivalent here because we
    feed the entire window at once (no streaming requirement).
    """
    res = x
    x = layers.Conv1D(filters, kernel, padding="same",
                      dilation_rate=dilation, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Conv1D(filters, kernel, padding="same",
                      dilation_rate=dilation, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    if res.shape[-1] != filters:
        res = layers.Conv1D(filters, 1, padding="same")(res)
    return layers.Add()([x, res])


def _label_smoothing_loss(epsilon: float = 0.08):
    import tensorflow as tf

    def loss(y_true, y_pred):
        n = tf.cast(tf.shape(y_pred)[-1], tf.float32)
        y = tf.one_hot(tf.cast(y_true, tf.int32), tf.shape(y_pred)[-1])
        y = tf.cast(y, y_pred.dtype)
        y = y * (1.0 - epsilon) + epsilon / n
        return tf.keras.losses.categorical_crossentropy(y, y_pred)

    return loss


def build_model(n_classes: int):
    """
    TCN (Temporal Convolutional Network) — GRU-ийн оронд.
    TF.js CPU дээр ~5-15ms (GRU ~40-80ms байсан).
    Dilated causal conv → receptive field covers full SEQ_LEN=20 window.
    """
    import tensorflow as tf
    from tensorflow.keras import layers, models

    inp = layers.Input(shape=(C.SEQ_LEN, C.FEATURE_DIM), name="sequence")
    x = layers.BatchNormalization()(inp)

    # Projection
    x = layers.Conv1D(64, 1, padding="same", activation="relu")(x)

    # TCN stack: dilation 1,2,4 → receptive field = (2*3-1)*(1+2+4) = 49 > 20
    x = _tcn_block(x, 64,  3, dilation=1, dropout=0.20, layers=layers)
    x = _tcn_block(x, 96,  3, dilation=2, dropout=0.20, layers=layers)
    x = _tcn_block(x, 128, 3, dilation=4, dropout=0.25, layers=layers)

    # Aggregate
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(96, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    out = layers.Dense(n_classes, activation="softmax", name="probs")(x)

    model = models.Model(inp, out)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(C.LEARNING_RATE),
        loss=_label_smoothing_loss(0.08),
        metrics=["accuracy"],
    )
    return model


def class_weights(y: np.ndarray, n_classes: int, labels: list[str]) -> dict[int, float]:
    counts = np.bincount(y, minlength=n_classes).astype(np.float64)
    counts[counts == 0] = 1.0
    w = counts.sum() / (n_classes * counts)
    out = {i: float(w[i]) for i in range(n_classes)}
    for i, lbl in enumerate(labels):
        if lbl == C.NEUTRAL_LABEL:
            out[i] *= 3.5
            continue
        if C.is_static_sign(lbl):
            out[i] *= 0.75
            continue
        if C.hand_mode_for(lbl) == 2:
            out[i] *= 2.4
        elif not C.is_static_sign(lbl):
            out[i] *= 1.5
    return out


def evaluate(model, X_va, y_va, labels) -> str:
    if len(X_va) == 0:
        return "validation set хоосон"
    probs = model.predict(X_va, verbose=0)
    pred = probs.argmax(axis=1)
    lines = []
    acc = float((pred == y_va).mean())
    lines.append(f"val accuracy: {acc:.4f}  (n={len(y_va)})")
    lines.append("")
    n = len(labels)
    cm = np.zeros((n, n), dtype=int)
    for t, p in zip(y_va, pred):
        cm[t, p] += 1
    lines.append("per-class:")
    for i, lbl in enumerate(labels):
        tot = cm[i].sum()
        correct = cm[i, i]
        rec = correct / tot if tot else 0.0
        conf = ""
        wrong = [(labels[j], cm[i, j]) for j in range(n) if j != i and cm[i, j] > 0]
        if wrong:
            wrong.sort(key=lambda kv: -kv[1])
            conf = "  ← " + ", ".join(f"{w}:{c}" for w, c in wrong[:3])
        lines.append(f"  {lbl:18s} recall={rec:5.2f} ({correct}/{tot}){conf}")
    return "\n".join(lines)


def export_tfjs(model, labels: list[str]) -> None:
    import subprocess

    os.makedirs(C.WEB_MODEL_DIR, exist_ok=True)
    meta = {
        "labels": labels,
        "neutralLabel": C.NEUTRAL_LABEL,
        "seqLen": C.SEQ_LEN,
        "featureDim": C.FEATURE_DIM,
        "poseKeypoints": C.POSE_KEYPOINTS,
        "nPose": C.N_POSE,
        "nHand": C.N_HAND,
        "nCoords": C.N_COORDS,
        "leftPresentIdx": C.LEFT_PRESENT_IDX,
        "rightPresentIdx": C.RIGHT_PRESENT_IDX,
        "liveWindow": C.LIVE_WINDOW,
        "liveStride": C.LIVE_STRIDE,
        **C.live_metadata_extra(labels),
    }
    with open(os.path.join(C.WEB_MODEL_DIR, "metadata.json"), "w",
              encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    keras_path = os.path.join(C.ARTIFACTS_DIR, "model.keras")
    if not os.path.isfile(keras_path):
        print(f"\n⚠ {keras_path} олдсонгүй — TFJS export алгассан.")
        return

    # Dedicated export script (Keras 3 → h5 → TFJS, Python 3.9-safe).
    export_script = os.path.join(C.BASE_DIR, "export_model.py")
    if os.path.isfile(export_script):
        print("\n→ TFJS export (export_model.py)...")
        try:
            subprocess.run(
                [sys.executable, export_script],
                check=True,
            )
            return
        except subprocess.CalledProcessError:
            print("\n⚠ export_model.py амжилтгүй — in-process export оролдож байна...")

    # Fallback: in-process h5 → TFJS (model already in memory, no reload).
    try:
        from export_model import export_h5_to_tfjs
        h5_path = os.path.join(C.ARTIFACTS_DIR, "model.h5")
        print(f"\n→ Saving {h5_path}...")
        model.save(h5_path)
        export_h5_to_tfjs(h5_path, C.WEB_MODEL_DIR)
        print(f"✓ TFJS export → {C.WEB_MODEL_DIR}")
        return
    except Exception as e:
        print(f"\n⚠ TFJS export алгассан: {e}")


def main() -> None:
    import tensorflow as tf
    tf.random.set_seed(C.SEED)

    X_tr, y_tr, X_va, y_va, labels, counts = build_dataset()
    print("labels:", labels)
    print("clips/label:", counts)
    print("train:", X_tr.shape, " val:", X_va.shape)

    n_classes = len(labels)
    model = build_model(n_classes)
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy" if len(X_va) else "accuracy",
            patience=12, restore_best_weights=True, mode="max"),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss" if len(X_va) else "loss",
            factor=0.5, patience=5, min_lr=1e-5),
    ]

    val_data = (X_va, y_va) if len(X_va) else None
    model.fit(
        X_tr, y_tr,
        validation_data=val_data,
        epochs=C.EPOCHS,
        batch_size=C.BATCH_SIZE,
        class_weight=class_weights(y_tr, n_classes, labels),
        callbacks=callbacks,
        verbose=2,
    )

    os.makedirs(C.ARTIFACTS_DIR, exist_ok=True)
    model.save(os.path.join(C.ARTIFACTS_DIR, "model.keras"))

    report = evaluate(model, X_va, y_va, labels)
    print("\n" + report)
    with open(os.path.join(C.ARTIFACTS_DIR, "report.txt"), "w",
              encoding="utf-8") as f:
        f.write(report + "\n")

    export_tfjs(model, labels)
    print("\nДууслаа. Web: cd ../web && npm run dev")


if __name__ == "__main__":
    main()
