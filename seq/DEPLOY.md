# Sign Bridge — Deploy гарын авлага

---

## Хэмжээний задаргаа (яагаад 1.8GB+ байна вэ)

| Хавтас | Хэмжээ | Git-д байх уу | Тайлбар |
|---|---|---|---|
| `training/.venv/` | ~1.7 GB | ❌ `.gitignore`-д байна | Python TensorFlow орчин |
| `web/node_modules/` | ~677 MB | ❌ `.gitignore`-д байна | npm packages |
| `web/.next/` | ~733 MB | ❌ `.gitignore`-д байна | Next.js build cache |
| `training/models/*.task` | ~23 MB | ❌ `.gitignore`-д байна | MediaPipe model файл |
| `web/public/models/*.task` | ~14 MB | ❌ `.gitignore`-д байна | MediaPipe model файл |
| `training/data/raw/` | ~860 KB | ❌ `.gitignore`-д байна | Бичигдсэн clip-үүд |
| `training/artifacts/` | ~5 MB | ❌ `.gitignore`-д байна | Keras model |
| **`web/public/models/seq/`** | **~864 KB** | ✅ **git-д байна** | TFJS model (exported) |
| Бусад source код | ~200 KB | ✅ **git-д байна** | |

**Git clone хийхэд ~1 MB** орчим татагдана.

---

## Шинэ орчинд (git clone дараа) тохируулах

### Training орчин
```bash
cd seq/training
python3 -m venv .venv && source .venv/bin/activate
python3 -m pip install --upgrade pip
bash install_deps.sh          # TF, MediaPipe, numpy
python3 download_models.py    # MediaPipe .task файлууд
```

### Web орчин
```bash
cd seq/web
npm install
# postinstall hook автоматаар MediaPipe model татна
# → public/models/pose_landmarker_lite.task
# → public/models/hand_landmarker.task
npm run dev
```

---

## Deploy сонголтууд

### A) Vercel (хамгийн хялбар, зөвлөмж)

#### 1. GitHub-д push хийх
```bash
cd /шинийн-замаас/sign-bridge
git init              # хэрэв одоогоор git repo биш бол
git add .
git commit -m "init"
git remote add origin https://github.com/таны-username/sign-bridge.git
git push -u origin main
```

#### 2. Vercel тохируулах

1. [vercel.com](https://vercel.com) → "New Project" → GitHub repo холбоно
2. **Root Directory:** `seq/web`
3. **Build Command:** `npm run build`
4. **Install Command:** `npm install` ← postinstall-д model татах скрипт байна
5. Deploy!

#### 3. Vercel орчны тохиргоо (заавал биш)

Хэрэв WebRTC peer connection-д TURN server хэрэгтэй бол:
```
NEXT_PUBLIC_TURN_URL=turn:your-server:3478
NEXT_PUBLIC_TURN_USERNAME=user
NEXT_PUBLIC_TURN_CREDENTIAL=pass
```

> ⚠️ **Анхаарал:** Vercel-ийн free tier-д функц 10 сек хүртэл ажилладаг.
> Sign Bridge нь **бүхэлдээ client-side** (browser-д ажилладаг) тул Vercel free tier хангалттай.

---

### B) Локал / сервер дээр

```bash
cd seq/web
npm install
npm run build
npm start           # → http://localhost:3000
```

HTTPS шаардлагатай бол (camera-г browser-с ашиглахад):
```bash
# Option 1: ngrok
ngrok http 3000

# Option 2: Caddy reverse proxy
caddy reverse-proxy --from https://sign.example.com --to localhost:3000
```

---

### C) Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY seq/web/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY seq/web/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t sign-bridge .
docker run -p 3000:3000 sign-bridge
```

---

## TFJS model шинэчлэх (дахин сургасны дараа)

```bash
# 1. Дахин сурга
cd seq/training && source .venv/bin/activate
python3 train.py          # → export автоматаар хийгдэнэ

# 2. Verify
cat ../web/public/models/seq/metadata.json

# 3. Git-д commit хийж push
cd ..
git add web/public/models/seq/
git commit -m "model: шинэ clip-үүд нэмж дахин сургасан"
git push
# → Vercel автоматаар redeploy хийнэ
```

---

## Багийн хамтын ажиллагаа (clip нэмэх)

### Clip бичих
```bash
cd seq/training && source .venv/bin/activate
python3 record.py     # дохио бүрийг 15-30+ clip болгон бич
```

### Нэмсэн clip-ийг git-д оруулахгүй (`.gitignore`-д байна)
Clip файлууд `.npy` форматтай, `data/raw/` дотор хадгалагдана.
**Clip-ийг тусад нь хуваалцах хэрэгтэй бол:**

```bash
# Zip архивлаж илгээх
cd seq/training
zip -r clips_$(date +%Y%m%d).zip data/raw/ data/manifest.csv
```

### Хамтран сургах
```bash
# 1. Нөгөө хүний clip-ийг data/raw/-д нэмнэ
# 2. Дахин сурга
python3 train.py
# 3. Exported model-ийг git push
git add ../web/public/models/seq/
git commit -m "model: X-ийн clip нэмж сургасан"
git push
```

---

## Эмзэг файлуудын шалгалт

```bash
# Git-д орж болохгүй файл байгаа эсэхийг шалгах
git status
# .task файл, .venv, node_modules харагдах ёсгүй
```

### Хэрэв `.task` файлуудыг санамсаргүйгээр add хийсэн бол:
```bash
git rm --cached seq/web/public/models/*.task
git commit -m "fix: large model files gitignore-д нэмэв"
```

---

## Хурдны лавлах

| Үзүүлэлт | Утга |
|---|---|
| Анхны дохио таних | ~350–600ms |
| Дараагийн дохио | ~550–700ms |
| Instant emit (≥96% confidence) | ~130ms |
| MediaPipe / frame | ~8ms |
| TCN inference / frame | ~15ms |

Техникийн дэлгэрэнгүй → [`CHANGES.md`](./CHANGES.md)
