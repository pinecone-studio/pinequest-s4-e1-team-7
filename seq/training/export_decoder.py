#!/usr/bin/env python3
"""Export decoder.keras → seq/web/public/models/decoder (TFJS)."""
from __future__ import annotations

import json
import os
import sys

import decoder_config as D


def main() -> None:
    if not os.path.isfile(D.DECODER_KERAS):
        sys.exit(f"❌ {D.DECODER_KERAS} олдсонгүй — python3 train_decoder.py")

    os.makedirs(D.WEB_DECODER_DIR, exist_ok=True)

    try:
        from export_model import export_h5_to_tfjs, _load_keras_model
    except ImportError as e:
        sys.exit(f"❌ export_model import: {e}")

    import tensorflow as tf

    print("→ Loading decoder...")
    try:
        model = tf.keras.models.load_model(D.DECODER_KERAS)
    except TypeError:
        model = _load_keras_model(D.DECODER_KERAS)

    h5 = os.path.join(D.DECODER_ARTIFACTS, "decoder.h5")
    model.save(h5)
    print(f"→ TFJS → {D.WEB_DECODER_DIR}")
    export_h5_to_tfjs(h5, D.WEB_DECODER_DIR)

    meta_path = os.path.join(D.WEB_DECODER_DIR, "metadata.json")
    if not os.path.isfile(meta_path):
        sys.exit("❌ metadata.json алга — train_decoder.py дахин ажиллуул.")

    print(f"✓ Decoder TFJS: {D.WEB_DECODER_DIR}")


if __name__ == "__main__":
    main()
