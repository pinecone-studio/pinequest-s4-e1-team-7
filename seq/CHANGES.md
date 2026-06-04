# Sign Bridge — Өөрчлөлтийн тэмдэглэл

> Энэ session-д хийгдсэн техникийн өөрчлөлт, хурдны харьцуулалт, дараагийн алхам.

---

## Хурдны харьцуулалт

| Хэмжигдэхүүн | Өмнө | Одоо | Сайжрал |
|---|---|---|---|
| Нэг дохио таних (эхний) | **3–8 сек** | **300–600ms** | ~10x |
| Дараагийн дохио хүлээх | **2–5 сек** | **550–700ms** | ~5x |
| Instant emit (маш итгэлтэй) | — | **~130ms** | шинэ |
| MediaPipe / frame | ~25ms | **~8ms** | ~3x |
| Model inference / frame | ~40–80ms | **~15ms** | ~4x |
| Model файлын хэмжээ | ~2 MB | **~776 KB** | 2.5x жижиг |

---

## 1. Model архитектур: BiGRU → TCN

**Файл:** `seq/training/train.py`

### Өмнө: Conv1D + BiGRU
```
Input(32, 104) → BN → Conv1D(64) → Conv1D(128) → MaxPool(2)
  → BiGRU(96) → BiGRU(64) → Dense(96) → softmax
```
- TF.js CPU inference: **~40–80ms**
- MaxPooling1D(2) нь sequence-ийг 32→16 болгодог байсан
- BiGRU нь TF.js-д sequential (нэг нэгээр) тооцдог тул удаан

### Одоо: TCN (Temporal Convolutional Network)
```
Input(12, 104) → BN → Conv1D(64, k=1)
  → TCNBlock(64,  k=3, dilation=1)  ← residual
  → TCNBlock(96,  k=3, dilation=2)  ← residual
  → TCNBlock(128, k=3, dilation=4)  ← residual
  → GlobalAvgPool → Dense(96) → softmax
```
- TF.js CPU inference: **~15ms**
- `padding="same"` (causal биш): TF.js-д shape bug байсан тул
- Dilated conv → receptive field нь бүтэн window-ийг хамарна
- All-parallel: BiGRU-ийн sequential байдлаас ангид

---

## 2. Sequence window: 32 → 12 frame

**Файл:** `seq/training/config.py`

| Параметр | Өмнө | Одоо | Тайлбар |
|---|---|---|---|
| `SEQ_LEN` | 32 | **12** | Model-д өгөх frame тоо |
| `CLIP_SECONDS` | 1.5 | **1.0** | Нэг clip-ийн урт |
| `LIVE_STRIDE` | 3 | **1** | Inference давтамж (frame бүр) |
| `MIN_CLIP_FRAMES` | 8 | **5** | Хамгийн богино clip |

**Яагаад чухал вэ:**

`seqLen=32` тохиолдолд emit хийснийхээ дараа buffer нь 32 frame-ийн хуучин дохиогоор дүүрэн байдаг.
Шинэ дохио energy-г "дарж" buffer-ийг "авахад" ~20+ frame = **1.3 сек** зарцуулдаг байсан.

`seqLen=12` + `resetWithNeutral()` хослолоор:
- Emit дараа buffer нь **neutral (all-zero)** frame-ээр дүүрнэ
- Шинэ дохионы frame-үүд neutral-ийг шахаж орж ирнэ
- 6 frame (~400ms) дотор 50% дохио → inference эхэлнэ

---

## 3. Emit-ийн дараа recognizer reset

**Файл:** `seq/web/lib/sequence-runtime.ts`, `seq/web/components/call/CallSession.tsx`

```typescript
// CallSession.tsx — emit болгон дараа:
recognizerRef.current?.resetWithNeutral();
```

```typescript
// SequenceRecognizer.resetWithNeutral():
for (let i = 0; i < this.T; i++) {
  this.frames[i].fill(0);  // all-zero = neutral
}
this.count = this.T;  // buffer full → inference нэн даруй эхэлнэ
this.writePos = 0;
```

**Өмнөх асуудал:** Emit дараа ч buffer нь хуучин дохиогоор дүүрэн → 2–5 сек хоцрол.

---

## 4. Inference шүүлтүүр: Streak-based filter

**Файл:** `seq/web/lib/sequence-runtime.ts` — `SequenceEmitter` class

### Өмнө: stableMs threshold
```
нэг label N ms тогтвортой байвал emit
```
- Window 6 prediction → ~800ms хүлээх
- Locked state "strong signal байхгүй болтол хүлээ" — дараагийн дохио хийвэл хэзээ ч unlock болдоггүй байсан (**гол bug**)

### Одоо: 3 давхар шүүлтүүр

```
1. postEmitBlockMs (450ms):
   Emit хийснийхээ дараа 450ms бүх prediction хориглоно.
   → Дохио хоорондын transition noise ("like" гэх мэт) энэд устана.

2. Streak (5 frame):
   Нэг label дараалан 5 frame + avgConf ≥ 78% → emit.
   → Нэг ч буруу frame streak-ийг тэглэнэ (0 tolerance).

3. Instant emit (streak ≥ 2 + conf ≥ 96%):
   Маш итгэлтэй байвал streak дуусахыг хүлээлгүй emit.
   → Нэг frame spike-ийг запобегать хийхийн тулд ≥2 frame шаардана.
```

### Параметрийн харьцуулалт

| Параметр | Өмнө | Одоо |
|---|---|---|
| Window / Streak | 6 vote | **5 consecutive** |
| Lock механизм | signal байхгүй болтол | **цаг хугацаагаар (450ms)** |
| Gap between words | 400ms | **550ms** |
| Same-label cooldown | 1200ms | **1000ms** |
| Instant emit | 95% (1 frame) | **96% (≥2 frame)** |

---

## 5. MediaPipe оновчлол

**Файл:** `seq/web/lib/mediapipe.ts`

| | Өмнө | Одоо |
|---|---|---|
| Pose model | `pose_landmarker_full.task` (26MB) | `pose_landmarker_lite.task` (6MB) |
| Delegate | CPU | **GPU** (WebGL байвал авто) |
| Inference/frame | ~25ms | **~8ms** |

---

## 6. Augmentation сайжруулалт

**Файл:** `seq/training/dataset.py`

| | Өмнө | Одоо |
|---|---|---|
| `AUG_PER_CLIP` | 6 | **10** |
| Time warp | ✓ | ✓ |
| **Speed up** (60–95%) | ✗ | ✓ (шинэ) |
| **Hand noise** | ✗ | ✓ (шинэ) |
| Rotate range | ±12° | **±15°** |
| Scale range | 0.9–1.1 | **0.88–1.12** |

`speed_up` augmentation нь хурдан хийсэн дохиог симуляци хийдэг тул
хэрэглэгч хурдан дохио хийхэд model тэсвэртэй болно.

---

## 7. Export алдааны засвар

**Файл:** `seq/training/export_model.py`

`train.py` нь `TF_USE_LEGACY_KERAS=1` тохиргоогоор `tf_keras` форматаар
model хадгалдаг байсан ч `export_model.py` энэ тохиргоогүйгээр Keras 3-аар
уншихыг оролддог байсан → `"Functional class not found"` алдаа.

```python
# export_model.py-д нэмсэн:
os.environ.setdefault("TF_USE_LEGACY_KERAS", "1")
```

---

## Дараагийн алхам: neutral clip бичих

### Яагаад neutral clip чухал вэ?

Одоогийн хамгийн том асуудал: **"like"** нь дохио хийж дуусаад гараа буулгах
үед буруу гарч байна. Шалтгаан нь:

- Model нь "like" ба "гар буулгах/хөдөлгөөний дундах position"-ийг андуурч байна
- Neutral clip цөөн байвал model "буруу биш" prediction-ийг neutral гэж таних биш,
  хамгийн ойр дохионд (like) оноодог

### Neutral clip-д яг юу бичих вэ?

`record.py` ажиллуулж **"neutral"** label дор дараах байдлаар **20–30 clip** бичнэ:

| Clip төрөл | Тайлбар | Clip тоо |
|---|---|---|
| **Гар буулгасан** | Гараа өвдөг дэлгэцний доод хэсэгт амраасан | 5–8 |
| **Гар хажуудаа** | Гар биеийн хажуу талд, камерт харагдахгүй | 5–8 |
| **Шилжилтийн хөдөлгөөн** | Нэг дохионоос нөгөө рүү явах үеийн хөдөлгөөн — хурдан хийнэ | 5–8 |
| **Хүлээж байгаа байдал** | Камер руу харж, гар дэлгэц дотор байгаа ч дохио хийхгүй | 5–8 |

> **Чухал:** Neutral clip дотор дохио хийхгүй! Зөвхөн амарч байгаа,
> шилжилт хийж байгаа, эсвэл дохио хоорондох "завсар"-ыг бичнэ.

### Бичсэний дараа дахин сургах

```bash
cd seq/training && source .venv/bin/activate
python3 record.py   # "neutral" label → 20+ clip
python3 train.py    # дахин сурга (5 мин)
# export автоматаар хийгдэнэ
```

---

## Бүгдийг нэгтгэн харах

```
Өмнөх pipeline:
  Camera → MediaPipe(25ms) → BiGRU(70ms) → stableMs filter → emit
  Нийт анхны дохио: ~3–8 сек | Дараагийн дохио: ~2–5 сек

Шинэ pipeline:
  Camera → MediaPipe(8ms) → TCN(15ms) → streak filter → emit
                                          postEmitBlock(450ms)
                                          streak×5(335ms)
  Нийт анхны дохио: ~350ms | Дараагийн дохио: ~550–700ms
```
