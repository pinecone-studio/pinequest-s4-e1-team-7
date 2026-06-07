#!/usr/bin/env python3
"""
Export artifacts/model.keras → seq/web/public/models/seq (TFJS layers).

Run after train.py:

    source .venv/bin/activate
    python3 export_model.py

Export deps (optional, separate from training):
    python3 -m pip install --no-compile -r requirements-export.txt
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import types

# This project trains with TensorFlow 2.19 / Keras 3.  If a shell has this set
# from older TensorFlow.js workflows, tf.keras tries to import missing tf_keras.
os.environ.pop("TF_USE_LEGACY_KERAS", None)

import config as C


def _labels_from_dataset() -> list[str]:
    from dataset import load_clips
    _, labels = load_clips()
    return sorted(set(labels))


def write_metadata(labels: list[str]) -> None:
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


def _load_keras_h5_converter():
    """Import keras_h5_conversion without tensorflowjs' broken optional deps."""
    try:
        from tensorflowjs.converters import keras_h5_conversion as mod
        return mod
    except Exception:
        pass

    root = None
    for p in sys.path:
        candidate = os.path.join(p, "tensorflowjs")
        if os.path.isdir(candidate):
            root = candidate
            break
    if not root:
        sys.exit(
            "❌ tensorflowjs олдсонгүй.\n"
            "   python3 -m pip install --no-compile --no-deps tensorflowjs==4.13.0"
        )

    def ensure_pkg(name: str) -> None:
        if name not in sys.modules:
            pkg = types.ModuleType(name)
            pkg.__path__ = []
            sys.modules[name] = pkg

    def load_mod(fullname: str, relpath: str):
        path = os.path.join(root, relpath)
        spec = importlib.util.spec_from_file_location(fullname, path)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[fullname] = mod
        spec.loader.exec_module(mod)
        return mod

    ensure_pkg("tensorflowjs")
    ensure_pkg("tensorflowjs.converters")
    load_mod("tensorflowjs.version", "version.py")
    load_mod("tensorflowjs.quantization", "quantization.py")
    load_mod("tensorflowjs.read_weights", "read_weights.py")
    load_mod("tensorflowjs.write_weights", "write_weights.py")
    load_mod("tensorflowjs.converters.common", "converters/common.py")
    return load_mod(
        "tensorflowjs.converters.keras_h5_conversion",
        "converters/keras_h5_conversion.py",
    )


def export_h5_to_tfjs(h5_path: str, out_dir: str) -> None:
    conv = _load_keras_h5_converter()
    topology, weight_groups = conv.h5_merged_saved_model_to_tfjs_format(h5_path)
    conv.write_artifacts(topology, weight_groups, out_dir)
    from keras3_tfjs_patch import patch_model_json_file

    model_json = os.path.join(out_dir, "model.json")
    patch_model_json_file(model_json)
    print("→ Patched model.json for TensorFlow.js (Keras 3 compat)")


def _load_keras_model(path: str):
    """Load model.keras saved by train.py (Keras 3 or legacy tf_keras)."""
    import tensorflow as tf

    try:
        return tf.keras.models.load_model(path)
    except TypeError:
        os.environ["TF_USE_LEGACY_KERAS"] = "1"
        import importlib

        importlib.reload(tf)
        return tf.keras.models.load_model(path)


def main() -> None:
    keras_path = os.path.join(C.ARTIFACTS_DIR, "model.keras")
    if not os.path.isfile(keras_path):
        sys.exit(f"❌ {keras_path} олдсонгүй — эхлээд python3 train.py")

    labels = _labels_from_dataset()
    write_metadata(labels)

    print("→ Loading model...")
    model = _load_keras_model(keras_path)

    h5_path = os.path.join(C.ARTIFACTS_DIR, "model.h5")
    print(f"→ Saving {h5_path}...")
    model.save(h5_path)

    print(f"→ Converting → {C.WEB_MODEL_DIR}")
    export_h5_to_tfjs(h5_path, C.WEB_MODEL_DIR)
    print(f"✓ TFJS export бэлэн: {C.WEB_MODEL_DIR}")
    print("  cd ../web && npm run dev")


if __name__ == "__main__":
    main()
