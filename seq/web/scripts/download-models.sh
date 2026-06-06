#!/usr/bin/env bash
# MediaPipe model файлуудыг татна.
# git clone хийсний дараа эхлээд нэг удаа ажиллуулна.
# CI/CD (Vercel build) дотор ч ажиллуулна.

set -e
MODELS_DIR="$(dirname "$0")/../public/models"
mkdir -p "$MODELS_DIR"

BASE="https://storage.googleapis.com/mediapipe-models"

download_if_missing() {
  local url="$1"
  local dest="$2"
  if [ -f "$dest" ]; then
    echo "✓ $(basename "$dest") — аль хэдийн байна"
  else
    echo "↓ $(basename "$dest") татаж байна..."
    curl -fsSL --max-time 120 "$url" -o "$dest"
    echo "✓ $(basename "$dest") ($(du -sh "$dest" | cut -f1))"
  fi
}

download_if_missing \
  "$BASE/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task" \
  "$MODELS_DIR/pose_landmarker_lite.task"

download_if_missing \
  "$BASE/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task" \
  "$MODELS_DIR/hand_landmarker.task"

download_if_missing \
  "$BASE/face_landmarker/face_landmarker/float16/latest/face_landmarker.task" \
  "$MODELS_DIR/face_landmarker.task"

# MediaPipe WASM — CDN-ээс биш local (илүү хурдан)
WASM_SRC="$(dirname "$0")/../node_modules/@mediapipe/tasks-vision/wasm"
WASM_DEST="$(dirname "$0")/../public/mediapipe-wasm"
if [ -d "$WASM_SRC" ]; then
  mkdir -p "$WASM_DEST"
  cp -f "$WASM_SRC"/* "$WASM_DEST/" 2>/dev/null || true
  echo "✓ mediapipe-wasm ($(ls "$WASM_DEST" | wc -l | tr -d ' ') файл)"
else
  echo "⚠ @mediapipe/tasks-vision wasm олдсонгүй — npm install ажиллуулна уу"
fi

# TensorFlow.js WASM backend binaries — local (SIMD, GPU шаардахгүй, хурдан)
TFJS_WASM_SRC="$(dirname "$0")/../node_modules/@tensorflow/tfjs-backend-wasm/dist"
TFJS_WASM_DEST="$(dirname "$0")/../public/tfjs-wasm"
if [ -d "$TFJS_WASM_SRC" ]; then
  mkdir -p "$TFJS_WASM_DEST"
  cp -f "$TFJS_WASM_SRC"/*.wasm "$TFJS_WASM_DEST/" 2>/dev/null || true
  echo "✓ tfjs-wasm ($(ls "$TFJS_WASM_DEST" | wc -l | tr -d ' ') файл)"
else
  echo "⚠ @tensorflow/tfjs-backend-wasm олдсонгүй — npm install ажиллуулна уу"
fi

echo ""
echo "✓ Бүх model бэлэн: $MODELS_DIR"
