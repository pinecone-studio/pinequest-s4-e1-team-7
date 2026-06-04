# Sign Bridge — Temporal Sign Recognizer

Дохионы хэлний бодит цагийн орчуулагч.
**MediaPipe** landmark → **TCN model** → **streak filter** → caption.

```
seq/
  training/   Python — clip бичих · сургах · TFJS export
  web/        Next.js — MediaPipe · TFJS inference · WebRTC дуудлага
```

---

## Архитектур

```
Camera (15fps)
  │
  ▼ MediaPipe Pose + Hand (~8ms)
  │  pose 9 цэг + 2 гар × 21 цэг → 104 dim/frame
  │
  ▼ TCN Model (~15ms)  ← seqLen=12 frame sliding window
  │  Conv1D projection → 3× dilated residual block → GlobalAvgPool → softmax
  │
  ▼ Streak Filter (~0ms)
  │  postEmitBlock(450ms) → streak×5 frames → emit
  │
  ▼ Caption
```

| Шат | Технологи | Хурд |
|---|---|---|
| Landmark | MediaPipe Pose Lite + Hand (GPU delegate) | ~8ms/frame |
| Feature | Мөр-centered normalize, 104 dim/frame | — |
| Model | TCN (dilated Conv1D residual) | ~15ms/frame |
| Filter | Streak-based noise filter | ~0ms |
| **Нийт** | **Анхны дохио → caption** | **~350–600ms** |

---

## Хурдан эхлэх

### 1. Training орчин бэлдэх (нэг удаа)

```bash
cd seq/training
python3 -m venv .venv && source .venv/bin/activate
python3 -m pip install --upgrade pip
bash install_deps.sh          # эсвэл: pip install -r requirements.txt
python3 download_models.py    # MediaPipe task файлуудыг татна
```

### 2. Clip бичих

```bash
python3 record.py
```

- `labels.txt` дотор байгаа дохио бүрийг **15–30+ clip** болгон бич
- SPACE → ~1 сек бичнэ → гараа амрааж дараагийнхыг
- **Чухал:** `neutral` label-д **20–30 clip** заавал бич (доороос дэлгэрэнгүй)

### 3. Сургах + export

```bash
python3 train.py
# Дуусахад export_model.py автоматаар ажиллана
# → web/public/models/seq/ дотор model.json + weights + metadata.json
```

### 4. Web ажиллуулах

```bash
cd ../web
npm install
npm run dev
# → http://localhost:3000
```

Host нээж → холбоосыг хамтрагчдаа илгээнэ → дохио хий → caption харагдана.

---

## Шинэ дохио нэмэх

1. `training/labels.txt` дотор нэр нэмнэ (мөр бүр нэг дохио)
2. `python3 record.py` → шинэ дохионы clip бичнэ
3. `python3 train.py` → дахин сурга
4. Web refresh

---

## neutral label — яг юу бичих вэ?

`neutral` нь "дохио хийхгүй байгаа" бүх байдлыг заана.
Model нь `neutral`-ийг таньвал caption-д үг нэмэхгүй.

**Дараах 4 төрлийн clip-ийг 5–8 ширхэгээр бичнэ (нийт 20–30):**

| Төрөл | Тайлбар |
|---|---|
| Гар буулгасан | Гараа өвдөг / ширээн дэлгэцний доогуур амраасан |
| Гар хажуудаа | Гар биеийн хажуу талд, камерт харагдахгүй |
| Шилжилтийн хөдөлгөөн | Нэг дохионоос нөгөөрүү явах үеийн хурдан хөдөлгөөн |
| Хүлээж байгаа | Камер руу харж байгаа ч дохио хийхгүй |

> ⚠️ Neutral clip дотор дохио **хийхгүй** — зөвхөн амарч эсвэл шилжилт хийж байгааг бичнэ.

Neutral clip бага байвал model нь "ойролцоо дохио" (жишээ нь `like`) буруу гаргадаг.

---

## Нарийвчлал сайжруулах

- **Clip тоо** хамгийн чухал — дохио бүрт 30+ clip хүрвэл сайн
- `artifacts/report.txt` — training дуусахад per-class recall + confusion matrix
  Андуурагдаж буй хосыг олж тэр 2 дохиог өөр өөр байрлал, хурдаар дахин бич
- Өөр өөр **гэрэлтүүлэг, камераас зай, хурд**-аар бичвэл model илүү тэсвэртэй болно
- `config.py` дотор `SEQ_LEN`, `AUG_PER_CLIP`, `EPOCHS` тохируулж болно

---

## Файлын бүтэц

```
training/
  config.py          — бүх тохиргооны single source of truth
  labels.txt         — дохионы нэрсийн жагсаалт
  record.py          — clip бичих хэрэгсэл (MediaPipe + keyboard)
  train.py           — TCN model сургах + export дуудах
  export_model.py    — Keras → TFJS layers format хөрвүүлэх
  dataset.py         — clip уншилт, normalize, augmentation
  landmarks.py       — feature layout (config.py-тай нийцэх ёстой)
  data/raw/          — бичигдсэн clip-үүд (.npy, label-аар хавтаслагдсан)
  artifacts/         — сургагдсан model (.keras), report.txt

web/
  components/call/   — WebRTC дуудлага + caption UI
  lib/
    mediapipe.ts     — MediaPipe landmarker wrapper
    landmarks.ts     — feature extraction + normalization
    sequence-runtime.ts — SequenceRecognizer + SequenceEmitter
  public/models/
    seq/             — TFJS model (model.json + weights + metadata.json)
    pose_landmarker_lite.task
    hand_landmarker.task
```

---

## Техникийн дэлгэрэнгүй

Техникийн өөрчлөлт, хурдны харьцуулалт → [`CHANGES.md`](./CHANGES.md)
