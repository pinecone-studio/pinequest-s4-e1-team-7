# Дохионы хэл хөрвүүлэгч (Sign Bridge)

> Монгол дохионы хэлийг бодит цагт текст болгон хөрвүүлдэг веб апп.  
> Камер → AI таних → Caption → WebRTC дуудлага.

---

## TL;DR — 30 секундэд ойлгох

| Юу хийх вэ | Хаана |
|-----------|--------|
| Clip бичих, model сургах | `seq/training/` |
| Веб апп ажиллуулах | `seq/web/` → `npm run dev` |
| Таних model (browser) | `seq/web/public/models/seq/` |
| Дохионы нэрс | `seq/training/labels.txt` |

**Одоогийн production pipeline:** Камер → **MediaPipe** → **1 TCN model** → **SequenceEmitter** → Caption  
**2 дахь AI model (BiGRU decoder) ашиглахгүй** — код repo-д experimental хэлбэрээр үлдсэн.

---

## Хурдны лавлах (одоогийн тохиргоо)

| Үзүүлэлт | Өмнө (~33-training) | Одоо | Тайлбар |
|----------|----------------------|------|---------|
| Анхны дохио → caption | ~3–8 сек | **~200–500 ms** | Buffer zero-prefill + emitter сайжруулалт |
| Дараагийн дохио | ~2–5 сек | **~300–700 ms** | Cooldown, streak багассан |
| Core instant emit (би, А…) | — | **~100–200 ms** | 66%+ confidence |
| MediaPipe / detect frame | ~25 ms | **~10–15 ms** | Lite pose, 288px, 8 fps |
| TCN inference / frame | ~40–80 ms (BiGRU) | **~10–20 ms** (WASM) | TCN + TF.js WASM |
| Model validation accuracy | — | **97.3%** | 67 class, 939 val samples |

> Хурд нь төхөөрөмж, гэрэл, camera чанараас хамаарна. MacBook > хуучин Android.

---

## 1. Системийн архитектур

### 1.1 Ерөнхий зураг

```
┌─────────────────────────────────────────────────────────────┐
│                    ХЭРЭГЛЭГЧИЙН BROWSER                       │
├─────────────────────────────────────────────────────────────┤
│  📷 Camera (getUserMedia)                                    │
│       ↓  smooth preview (requestAnimationFrame, ~30–60 fps)  │
│  🔍 MediaPipe Pose Lite + Hand  (~8 detect/sec, 288px)       │
│       ↓  104 тоо / frame                                       │
│  🧠 TCN Model (TensorFlow.js WASM)  ← ЗӨВХӨН 1 MODEL       │
│       ↓  "би" 82%, "миний" 5%...                             │
│  🎯 SequenceEmitter (дүрэм — ML биш)                          │
│       ↓  хэзээ caption-д бичих вэ?                           │
│  📝 Caption + WebRTC (PeerJS)                                │
└─────────────────────────────────────────────────────────────┘
         ↑
    Сервер шаардлагагүй (Vercel static deploy хангалттай)
```

**Яагаад server хэрэггүй вэ?**  
Бүх ML inference browser дотор явагдана. Vercel зөвхөн HTML/JS/model файлуудыг serve хийнэ.

**Ирээдүйд:** 100+ sign, low-end phone → TCN-ийг server API руу шилжүүлж болно (README төгсгөлд).

---

### 1.2 Pipeline — алхам бүр (ML мэдэхгүй хүн ч ойлгоно)

| # | Алхам | Юу хийж байна | Хурд | Гаралт |
|---|-------|---------------|------|--------|
| 1 | **Камер** | Browser камераас frame авна | 30 fps preview | Video |
| 2 | **MediaPipe** | Бие + 2 гарын цэгүүдийг олно | ~10 ms/frame | Landmark цэгүүд |
| 3 | **Feature** | Цэгүүдийг тоо болгон хувиргана, normalize хийнэ | ~0 ms | **104 dim** вектор |
| 4 | **TCN Model** | 20 frame-ийн дарааллыг уншиж дохио таана | ~10–20 ms | 67 class магадлал |
| 5 | **SequenceEmitter** | Зөвхөн итгэлтэй, тогтвортой үед caption-д бичнэ | ~0 ms | Баталгаажсан дохио |
| 6 | **Caption** | React дэлгэцэнд текст харуулна | ~0 ms | Харагдах текст |

**Жишээ нь:** Та "А" үсэг хийлээ.

1. MediaPipe: "Зүүн гарын мөр, хурууны байрлал ийм байна"
2. Feature: `[0.12, -0.05, 0.08, ...]` — 104 тоо
3. TCN: "А = 78%, neutral = 12%, Н = 3%"
4. Emitter: "78% хангалттай, instant emit нөхцөл биелсэн → caption-д 'А' бич"
5. Дэлгэц: **А**

---

### 1.3 Feature layout — 104 dim / frame

Нэг camera frame-ийг **104 тоо** болгон хувиргана:

| Эх сурвалж | Цэг | Dim | Тайлбар |
|-----------|-----|-----|---------|
| MediaPipe Pose | 9 цэг | 18 | Мөр, тохой, бугуй, тавхай (x, y) |
| MediaPipe Hand зүүн | 21 цэг | 42 | Зүүн гар (x, y) |
| MediaPipe Hand баруун | 21 цэг | 42 | Баруун гар (x, y) |
| Flags | — | 2 | Зүүн/баруун гар илэрсэн эсэх |
| **Нийт** | | **104** | |

> **Яагаад зөвхөн x, y (z биш)?** Browser дээр хурдан, сургалтад тогтвортой. Мөрний өргөнөөр normalize хийж зайны асуудлыг шийднэ.

> **Яагаад Pose хэрэгтэй вэ?** Зөвхөн гарын 21 цэг биш, мөр + бугуй байвал дохио илүү нарийвchan танигдана.

---

### 1.4 Dual-mask — "2 model" биш!

2 гар camera-д харагдах үед систем **1 model-ийг 2 удаа уншина**:

- **1-hand mask:** зөвхөн 1-гартай дохионууд (А, би, миний…)
- **2-hand mask:** зөвхөн 2-гартай дохионууд (баярлалаа, зогсох…)

Илүү сайн хариултыг сонгоно. Энэ нь **2 дахь neural network биш** — нэг model, хоёр шүүлтүүр.

---

### 1.5 Файлын бүтэц

```
pinequest-s4-e1-team-7/
├── README.md                    ← энэ файл
└── seq/
    ├── training/                # Python — clip бичих, сургах, export
    │   ├── config.py              # ⭐ Бүх тохиргоо (SEQ_LEN, thresholds…)
    │   ├── labels.txt             # Дохионы нэрс (мөр бүр = 1 sign)
    │   ├── hand_modes.json        # 1 гар / 2 гар тохиргоо
    │   ├── record.py              # Clip бичих хэрэгсэл
    │   ├── train.py               # TCN сургах
    │   ├── export_model.py        # Keras → TFJS
    │   ├── dataset.py             # Clip унших, augmentation
    │   ├── landmarks.py           # Feature layout (Python)
    │   ├── data/raw/              # Бичигдсэн clip (.npy) — git-д орохгүй
    │   ├── artifacts/             # model.h5, report.txt
    │   ├── train_decoder.py       # ⚠️ Experimental Stage-2 (идэвхгүй)
    │   └── export_decoder.py
    └── web/                       # Next.js веб апп
        ├── app/                   # Хуудсууд
        ├── components/
        │   ├── CameraView.tsx     # Камер + MediaPipe
        │   └── call/CallSession.tsx  # WebRTC + caption
        ├── lib/
        │   ├── mediapipe.ts       # MediaPipe wrapper
        │   ├── landmarks.ts       # Feature extraction (JS)
        │   ├── sequence-runtime.ts # ⭐ TCN + SequenceEmitter
        │   └── pred-decoder.ts    # ⚠️ Experimental (идэвхгүй)
        └── public/models/
            ├── seq/               # ✅ TFJS TCN model (git-д байна)
            ├── pose_landmarker_lite.task
            ├── hand_landmarker.task
            └── decoder/           # ⚠️ Experimental (идэвхгүй)
```

---

## 2. TCN загвар — ML-ийн товч тайлбар

### 2.1 TCN гэж юу вэ?

**TCN (Temporal Convolutional Network)** = цаг хугацааны дарааллыг уншидаг neural network.

- **Оролт:** 20 frame × 104 тоо = "20 алхамын дохио"
- **Гаралт:** 67 class-ийн магадлал ("А" 78%, "би" 5%…)

**BiGRU-аас яагаан шилжсэн бэ?**

| | BiGRU (хуучин) | TCN (одоо) |
|---|----------------|------------|
| Browser inference | ~40–80 ms | ~10–20 ms |
| TF.js дээр | Sequential, удаан | Parallel, хурдан |
| seqLen | 32 | 20 |

### 2.2 Архитектур

```
Input (20, 104)
  → BatchNorm
  → Conv1D(64) projection
  → TCN block (dilation=1)  ← 3 frame харна
  → TCN block (dilation=2)  ← 6 frame харна
  → TCN block (dilation=4)  ← 12 frame харна
  → GlobalAveragePool
  → Dense(96) → softmax(67)
```

**Receptive field:** 49 frame > 20 → бүтэн цонхыг хамарна.

### 2.3 Сургалтын үр дүн (одоогийн model)

```
val accuracy: 97.34%  (939 validation samples)
67 class (66 sign + neutral)
~4,765 clip нийт
Class бүрт min ~44 clip
```

`artifacts/report.txt` дотор class бүрийн recall харагдана.

---

## 3. SequenceEmitter — "Streak Filter"

Model зөв sign хэлсэн ч **шууд caption-д бичихгүй**. Emitter нь noise-ийг шүүнэ.

### 3.1 Яагаад хэрэгтэй вэ?

Model frame бүрт янзын зүйл хэлнэ:
```
Frame 1: А 45%
Frame 2: А 72%
Frame 3: А 81%  ← энд л emit
Frame 4: neutral 60%  ← гар буулгах үе
Frame 5: Н 40%  ← noise
```

Emitter-гүй бол Frame 4, 5 caption-д буруу үг нэмнэ.

### 3.2 3 давхар шүүлтүүр (одоогийн тохиргоо)

#### Шүүлтүүр 1 — postEmitBlock (~35 ms)

Emit хийсний дараа богино хугацаанд дахин emit хийхгүй. Гар шилжих noise арилна.

#### Шүүлтүүр 2 — Streak (minStreak = 1)

Core дохионууд (`би`, `миний`, бүх үсэг) **1 frame** хангалттай (instant path).

#### Шүүлтүүр 3 — Instant emit

| Төрөл | Confidence | Жишээ |
|-------|------------|-------|
| Core (би, А, Н…) | ≥ 66% | ~100–200 ms |
| Static үсэг | ≥ 72% | |
| 2-hand дохио | ≥ 72% + motion | баярлалаа |
| Бусад үг | ≥ 78% | |

### 3.3 Cooldown (до хио хоорондын зай)

| Параметр | Утга | Утга учир |
|----------|------|-----------|
| Үсэг хооронд (any letter) | 45 ms | А→Н→Р хурдан |
| Ижил label дахин | 450–700 ms | Давтагдах noise |
| Word emit дараа | 40 ms | Дараагийн үг |

### 3.4 Emit дараа buffer reset

Caption-д үг нэмсний дараа хуучин frame-үүдийг цэвэрлэнэ → дараагийн дохио хурдан танигдана.

---

## 4. MediaPipe — landmark олдог хэсэг

| Тохиргоо | Утга |
|----------|------|
| Pose model | `pose_landmarker_lite.task` (~6 MB) |
| Hand model | `hand_landmarker.task` |
| Delegate | **CPU** (бүх төхөөрөмж дээр тогтвортой) |
| Detect rate | **8 fps** (CPU хэмнэлт) |
| Detect resolution | 288px өргөн |
| Preview | Video → canvas **rAF** (smooth, MediaPipe-ээс тусдаа) |

> Preview (камерын дүрс) болон MediaPipe detect **тусдаа** ажиллана — камер smooth, detect зөвхөн ML-д.

---

## 5. TensorFlow.js — browser дээр model ажиллуулах

```
Model файл: public/models/seq/model.json + group1-shard1of1.bin
Backend: WASM (SIMD) — GPU шаардлагагүй
Fallback: WebGL → CPU
```

Browser console-д `[TF] backend: wasm` гэж харагдана.

---

## 6. Тохиргоо хийх (Quick Start)

### 6.1 Training орчин (нэг удаа)

```bash
cd seq/training
python3 -m venv .venv && source .venv/bin/activate   # Mac/Linux
python3 -m pip install --upgrade pip
pip install -r requirements.txt
python3 download_models.py    # MediaPipe .task файлууд
```

### 6.2 Clip бичих

```bash
python3 record.py
# SPACE → ~1.8 сек бичнэ → дараагийн clip
# Дохио бүрт 30+ clip зөвлөмж
# neutral label-д 30+ clip ЗААВАЛ
```

### 6.3 Сургах + export

```bash
python3 train.py
# → artifacts/model.h5
# → artifacts/report.txt
# → web/public/models/seq/ (автоматаар)
```

### 6.4 Web ажиллуулах

```bash
cd ../web
npm install          # postinstall: MediaPipe model татна
npm run dev
# → http://localhost:3000
# /call/[room] → WebRTC дуудлага + caption
```

---

## 7. Датасет — clip бичих стратеги

### 7.1 Clip тооны шаардлага

| Нөхцөл | Хамгийн бага | Зөвлөмж |
|--------|-------------|---------|
| Нэг дохио | 30 | 50+ |
| **neutral** | **30** | **50+** |
| Бичлэг хийгч | 1 | 3+ хүн |
| Гэрэл / зай | 1 | 3+ нөхцөл |

### 7.2 Neutral — хамгийн чухал

**Neutral** = "дохио хийхгүй байгаа" бүх байдал.

Neutral clip цөөн бол → дохио дуусаад гар буулгах үед буруу sign гарна.

| Clip төрөл | Тайлбар |
|-----------|---------|
| Гар буулгасан | Гар доогуур амраасан |
| Гар хажуудаа | Камерт харагдахгүй |
| Шилжилт | Нэг дохио → нөгөө рүү |
| Хүлээлт | Камер руу харсан ч дохио хийхгүй |

> Neutral clip дотор **дохио хийхгүй!**

### 7.3 Augmentation (автомат)

`dataset.py` clip бүрээс нэмэлт жишээ үүсгэнэ:

| Augmentation | Зорилго |
|-------------|---------|
| Time warp | Хурдны хэлбэлзэл |
| Speed up | Хурдан дохио |
| Hand noise | Гарын чичиргээ |
| Rotate ±15° | Өнцгийн хэлбэлзэл |
| Mirror | Зүүн/баруун солих |
| Zero prefix (40%) | Live emit дараах idle симуляци |

---

## 8. Шинэ дохио нэмэх

```bash
# 1. labels.txt-д нэр нэм
echo "шинэ дохио" >> seq/training/labels.txt

# 2. hand_modes.json-д 1 эсвэл 2 гар зааж өг
# "шинэ дохио": 1

# 3. Clip бич
python3 record.py

# 4. Дахин сурга
python3 train.py

# 5. Deploy
git add seq/web/public/models/seq/
git commit -m "model: шинэ дохио нэмсэн"
git push   # → Vercel auto redeploy
```

---

## 9. Deploy

### 9.1 Vercel (зөвлөмж)

Client-side app → Vercel free tier хангалттай.

| Тохиргоо | Утга |
|---------|------|
| Root Directory | `seq/web` |
| Build Command | `npm run build` |
| Install Command | `npm install` |

### 9.2 Git-д юу байна, юу байхгүй

| Хавтас | Git-д |
|--------|-------|
| `web/public/models/seq/` | ✅ TFJS model |
| `web/public/models/*.task` | ❌ postinstall татна |
| `training/data/raw/` | ❌ clip (.npy) |
| `training/.venv/` | ❌ |
| `web/node_modules/` | ❌ |

---

## 10. Stage-2 Decoder (Experimental — идэвхгүй)

Repo-д Stage-2 BiGRU decoder код байгаа ч **production-д асаагүй**:

| Файл | Төлөв |
|------|-------|
| `train_decoder.py` | Сургалт script |
| `pred-decoder.ts` | Browser runtime |
| `public/models/decoder/` | TFJS weights |
| `CallSession.tsx` | **Ачаалдаггүй** |

**Яагаан идэвхгүй вэ?**
- Browser CPU 2× нэмэгдэнэ
- Emit recall ~65% — SequenceEmitter-ээс муу
- Одоогийн сайн үр дүн **1 TCN + Emitter**-ээс ирсэн

---

## 11. Production roadmap (ирээдүй)

Олон sign + бүх төхөөрөмж дээр "асуудалгүй" ажиллуулахын тулд:

```
Одоо:  Browser [MediaPipe + TCN + Emitter]
                ↓
Ирээдүй: Browser [MediaPipe + Emitter]
              ↓ 104×20 float (~8 KB)
         Server [TCN API]  ← model энд
              ↓ {label, conf}
         Browser caption
```

| Алхам | Зорилго |
|-------|---------|
| 80–100 sign | Confusion matrix QA |
| Server API | Low-end device дэмжлэг |
| INT8 quantization | Model 2–4× жижиг |
| CI regression test | Clip бүр live simulate |

---

## 12. Нийтлэг алдаа

| Алдаа | Шалтгаан | Шийдэл |
|-------|----------|--------|
| Буруу sign emit | Neutral clip цөөн | neutral 30+ clip, дахин train |
| Feature mismatch | config.py ≠ landmarks.ts | Хоёуланд ижил FEATURE_DIM=104 |
| .task файл 404 | postinstall ажиллаагүй | `npm install` дахин |
| Camera permission | HTTPS шаардлагатай | localhost эсвэл HTTPS |
| `[decoder] stage-2` console | Хуучин cache | Hard refresh (Cmd+Shift+R) |
| WebRTC холбогдохгүй | NAT/TURN | Ижил WiFi дээр туршиж үз |

---

## 13. Гlossary — ML үгийн тайлбар

| Үг | Энгийн тайлбар |
|----|----------------|
| **Clip** | Нэг дохиог 1 удаа бичсэн богино видео (`.npy` файл) |
| **Label / Sign** | Дохионы нэр ("би", "А", "баярлалаа") |
| **Feature** | Camera frame-ийг AI-д ойлгомжтой 104 тоо |
| **Landmark** | MediaPipe-ийн олсон бие/гарын цэг |
| **TCN** | Цаг хугацааны дарааллыг уншидаг AI model |
| **Softmax** | Model-ийн "итгэл" — 67 class-ийн магадлал |
| **Emitter** | Model-ийн хариултыг caption-д хэзээ бичихийг шийддэг дүрэм |
| **Neutral** | "Дохио хийхгүй" class — caption-д бичигдэхгүй |
| **Augmentation** | Clip-ийг х искусствен олон хувилбар болгох |
| **TFJS** | TensorFlow model-ийг browser дээр ажиллуулах формат |
| **Val accuracy** | Сургалтын шалгалтын оноо (97% = 100-аас 97 зөв) |

---

## 14. Багийн хамтын ажиллагаа

### Clip хуваалцах

```bash
cd seq/training
zip -r clips_$(date +%Y%m%d).zip data/raw/ data/manifest.csv
# Хүлээн авагч: data/raw/-д задлаад python3 train.py
```

### Шинэ орчин setup

```bash
git clone <repo-url>
cd pinequest-s4-e1-team-7/seq/training
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python3 download_models.py

cd ../web && npm install && npm run dev
```

---

## 15. Холбоос

| Resource | Path |
|----------|------|
| Training config | `seq/training/config.py` |
| Live emitter logic | `seq/web/lib/sequence-runtime.ts` |
| Model metadata | `seq/web/public/models/seq/metadata.json` |
| Training report | `seq/training/artifacts/report.txt` |
| Hand mode config | `seq/training/hand_modes.json` |

---

*Сүүлд шинэчилсэн: 2026-06 — branch `73-model-update`*
