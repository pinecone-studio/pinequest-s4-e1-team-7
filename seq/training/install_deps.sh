#!/bin/bash
# Mac training deps — TensorFlow only (no tensorflowjs; export via seq/web).
set -euo pipefail
cd "$(dirname "$0")"

PY="${PYTHON:-python3}"
VER=$($PY -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Python $VER"

if ! $PY -c 'import sys; exit(0 if sys.version_info >= (3, 9) else 1)'; then
  echo "❌ Python 3.9+ хэрэгтэй"
  exit 1
fi

if $PY -c 'import sys; exit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "✓ Python 3.10+ (санал болгох)"
else
  echo "⚠ Python 3.9 — OK сургалтад. Илүү сайн: brew install python@3.11"
fi

# venv зөвлөмж
if [[ -z "${VIRTUAL_ENV:-}" ]]; then
  echo "💡 Зөвлөмж: python3 -m venv .venv && source .venv/bin/activate"
fi

PIP="$PY -m pip"
echo "→ pip шинэчлэх..."
$PIP install --upgrade pip

echo "→ mediapipe, opencv, numpy..."
# --no-compile: mediapipe wheel дотор эвдэрсэн test файл compile хийхгүй
$PIP install --no-compile --default-timeout=300 \
  "mediapipe>=0.10.18" \
  "opencv-python>=4.9" \
  "numpy>=1.26,<2.0"

echo "→ TensorFlow (~250MB)..."
$PIP install --no-compile --default-timeout=1000 --retries 5 "tensorflow>=2.15,<2.20"

echo ""
echo "✓ Python багцууд суусан."
echo "  TFJS export: cd ../web && npm install && npm run export-model"
echo "  Дараа нь: python3 download_models.py && python3 record.py"
