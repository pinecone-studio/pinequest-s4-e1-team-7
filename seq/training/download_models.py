"""
Fetch MediaPipe .task models into seq/training/models/.
Reuses rf/analysis/models if present (avoids re-downloading), else downloads.
"""
import os
import shutil
import urllib.request

import config as C

URLS = {
    "pose_landmarker_full.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
    ),
    "hand_landmarker.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    ),
    "face_landmarker.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    ),
}

RF_MODELS = os.path.join(C.SEQ_DIR, "..", "rf", "analysis", "models")


def main() -> None:
    os.makedirs(C.MODELS_DIR, exist_ok=True)
    for name, url in URLS.items():
        dest = os.path.join(C.MODELS_DIR, name)
        if os.path.isfile(dest) and os.path.getsize(dest) > 100_000:
            print(f"✓ {name} (бэлэн)")
            continue
        src = os.path.join(RF_MODELS, name)
        if os.path.isfile(src) and os.path.getsize(src) > 100_000:
            shutil.copy(src, dest)
            print(f"✓ {name} (rf-ээс хууллаа)")
            continue
        print(f"↓ {name} татаж байна...")
        urllib.request.urlretrieve(url, dest)
        print(f"✓ {name} ({os.path.getsize(dest)//1024} KB)")
    print("Бэлэн.")


if __name__ == "__main__":
    main()
