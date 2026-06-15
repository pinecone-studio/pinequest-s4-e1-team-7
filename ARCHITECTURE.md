# System Architecture — Sign Bridge

## Overview

Sign Bridge is a Mongolian sign language communication platform. It enables real-time sign-to-text translation and accessible chat between deaf and hearing users. The project is a monorepo with three decoupled services.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                     │
│                                                                      │
│   ┌──────────────────────────┐   ┌──────────────────────────┐       │
│   │    Browser / Web App     │   │   Accessibility Client   │       │
│   │    (Next.js / React 19)  │   │  (Braille / Screen Reader)│      │
│   └─────────────┬────────────┘   └─────────────┬────────────┘       │
│                 │  WebRTC (PeerJS)              │                    │
│                 ↕  WebSocket                   ↕                    │
└─────────────────┼─────────────────────────────┼────────────────────┘
                  │                             │
         REST API │                   WebSocket │
                  ↓                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│               BACKEND — Cloudflare Workers Edge                      │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │                  Hono REST API                           │      │
│   │  /auth  /users  /chat  /signs  /translations  /webhooks │      │
│   └───────┬──────────────┬────────────────────┬─────────────┘      │
│           │              │                    │                     │
│           ↓              ↓                    ↓                     │
│   ┌───────────┐  ┌───────────────┐  ┌──────────────────┐          │
│   │ D1 SQLite │  │  R2 Storage   │  │  Durable Objects │          │
│   │ (6 tables)│  │ (voice, media)│  │  (UserNotify)    │          │
│   └───────────┘  └───────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│               ML PIPELINE — Python (local / offline)                 │
│                                                                      │
│   Record clips → Train TCN model → Export TFJS → Deploy to web     │
│   (record.py)    (train.py)         (export.py)   (public/models/)  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                                      │
│                                                                      │
│   ┌──────────────────┐   ┌──────────────────────────────────┐       │
│   │  Chimege API     │   │  MediaPipe (WASM, runs in-browser)│      │
│   │  Mongolian STT   │   │  Pose + Hand landmark detection  │       │
│   │  Mongolian TTS   │   └──────────────────────────────────┘       │
│   └──────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
pinequest-s4-e1-team-7/
└── seq/
    ├── web/        → Next.js frontend (Cloudflare Workers via OpenNext)
    ├── server/     → Hono API backend (Cloudflare Workers)
    └── training/   → Python ML training pipeline (local)
```

---

## Frontend — `seq/web/`

**Tech:** Next.js 15.5, React 19, TensorFlow.js 4.22, MediaPipe 0.10, Tailwind CSS, Shadcn/Radix UI, PeerJS, Three.js

### Real-Time Sign Recognition Pipeline

```
Webcam Frame
     │
     ↓ (~8ms)
MediaPipe WASM
  ├── PoseLandmarker   → 33 keypoints (x,y,z,visibility)
  └── HandLandmarker  → 21 keypoints × 2 hands
     │
     ↓
landmarks.ts
  └── Normalize + flatten → 104-dimensional feature vector
     │
     ↓
sequence-runtime.ts
  └── Sliding window (12 frames) → TCN model inference (~15ms)
       └── Softmax → 90+ Mongolian sign classes
     │
     ↓
Streak filter (5 consecutive identical predictions)
     │
     ↓
Caption emitted to UI / chat
```

**Total latency: ~350–600ms from sign gesture to caption**

### Frontend Route Map

```
app/
├── page.tsx                    → Landing page
├── auth/
│   ├── login/                  → Email/phone login
│   ├── register/               → User registration
│   └── sso-callback/           → OAuth SSO
├── dashboard/                  → Settings & profile
├── accessible/
│   └── chat/                   → Accessible chat (Braille, screen reader)
└── api/
    ├── tts/                    → Text-to-speech proxy (Chimege)
    └── stt/                    → Speech-to-text proxy (Chimege)
```

### Component Layers

```
components/
├── call/         → Video call UI (session, captions, top bar, history)
├── messages/     → Chat interface (MessagesApp, BrailleKeyboard, CallLogCard)
├── accessible/   → Braille input, A11y navigation, screen reader support
├── ui/           → Shadcn/Radix base components (22 types)
├── dashboard/    → Settings panels
├── landingpage/  → Marketing components
└── mobile/       → Mobile-specific views
```

### Context Providers

```
AuthContext          → JWT auth state, user profile
AppContext           → Global app state
ChatRealtimeContext  → WebSocket connection for messaging
IncomingCallContext  → Incoming WebRTC call state
AppModeContext       → UI mode (normal / accessible)
```

---

## Backend — `seq/server/`

**Tech:** Cloudflare Workers, Hono, Drizzle ORM, D1 (SQLite), R2 (object storage), Durable Objects

### API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/auth` | POST | Register, login → JWT token |
| `/users` | GET, PUT | Profile lookup, avatar upload |
| `/chat` | GET, POST, WS | Conversations, messages, WebSocket |
| `/signs` | GET | Sign dictionary lookup |
| `/translations` | GET, POST | Translation history per user |
| `/dictionary` | GET | Dictionary search |
| `/webhooks` | POST | Svix webhook receiver |

### Authentication Flow

```
Client → POST /auth/login (email/phone + password)
             │
             ↓
         Password hash verify (bcrypt-like, crypto.ts)
             │
             ↓
         Sign JWT (HS256, jwt_secret from wrangler.toml)
             │
             ↓
         Return { token, user }
             │
Client stores token → sends as Authorization: Bearer <token>
             │
         auth.ts middleware → verify JWT → inject user into context
```

### Real-Time Chat Architecture

```
Client A                 Cloudflare Workers               Client B
   │                          │                              │
   │── WebSocket connect ────>│                              │
   │                    UserNotify DO ←── WebSocket connect ─│
   │                          │  (Durable Object holds       │
   │── Send message ─────────>│   persistent WS state)       │
   │                          │── Push to Client B ─────────>│
   │                          │                              │
   │                    D1 SQLite                            │
   │                    Store message                        │
   │                    Update conversationReads             │
```

### Database Schema

```
users
  id · email · phone · name · avatarUrl · passwordHash · lastSeenAt · createdAt

conversations
  id · userAId → users · userBId → users · lastPreview · lastAt · updatedAt

messages
  id · conversationId → conversations · senderId → users
  kind (text|voice|call_start|call_end) · body · voiceUrl · voiceDurationMs · createdAt

conversationReads
  userId → users · convId → conversations · readUntilMsgId (composite PK)

translations
  id · userId → users · kind (sign|voice) · text · wordCount · createdAt

signs
  id · label · category (alphabet|number) · r2Key · url · createdAt
```

### Cloudflare Infrastructure

```
Cloudflare Network
  ├── Workers Runtime       → API + WebSocket handler
  ├── D1 Database           → SQLite (sign-bridge-db)
  ├── R2 Bucket             → Voice recordings, avatars (sign-bridge-storage)
  └── Durable Objects       → UserNotify (stateful real-time coordination)
```

---

## ML Training Pipeline — `seq/training/`

**Tech:** Python, TensorFlow 2.x, Keras, MediaPipe, OpenCV, NumPy

### Pipeline Steps

```
1. Data Collection
   record.py → Keyboard-triggered clip recording
             → MediaPipe extracts landmarks per frame
             → Saves sequences as .npy files in data/raw/<label>/

2. Dataset Preparation
   dataset.py → Load .npy files + manifest.csv
              → Normalize landmarks (landmarks.py)
              → Augmentation (flip, jitter, time-warp)
              → Train / val / test split

3. Model Training
   train.py → Build TCN (config.py)
            → Conv1D → 3x dilated residual blocks → GlobalAvgPool → Dense(96)
            → Input: [batch, 12 frames, 104 features]
            → Output: softmax over 90+ sign labels
            → Saves .keras artifact to artifacts/

4. Export
   export_model.py → Convert Keras → TFJS (model.json + weights.bin)
                   → Generate metadata.json (label map, frame config)
                   → Copy to seq/web/public/models/seq/

5. Deploy
   git commit → model files included in web deployment
```

### TCN Model Architecture

```
Input [B, 12, 104]
   │
Conv1D(filters=64, kernel=3) + BatchNorm + ReLU
   │
Residual Block 1 (dilation=1)  → Conv1D + Conv1D + skip connection
Residual Block 2 (dilation=2)  → Conv1D + Conv1D + skip connection
Residual Block 3 (dilation=4)  → Conv1D + Conv1D + skip connection
   │
GlobalAveragePooling1D
   │
Dense(96, relu) → Dropout
   │
Dense(N_classes, softmax)  [N = 90+]
   │
Output: class probabilities
```

---

## Data Flow — End-to-End Sign Communication

```
User A (deaf)                                       User B (hearing)

[Webcam]
   │ frames
   ↓
MediaPipe (browser, WASM)
   │ 104-dim landmarks
   ↓
TCN Model (TFJS, browser)
   │ sign class + confidence
   ↓
Streak filter
   │ stable prediction
   ↓
Caption string
   │
   ├──→ Display in call UI (real-time)
   │
   └──→ POST /translations (save history)
         │
         └──→ WebSocket → User B sees caption
```

---

## Voice / Accessibility Flow

```
User speaks into mic
   │
   ↓ audio blob
Next.js API route /api/stt
   │
   ↓ HTTP POST
Chimege STT API (Mongolian)
   │
   ↓ transcript text
Display / send as message
   ─────────────────────────────────────
Text-to-speech (reverse direction):
Incoming message text
   │
   ↓
/api/tts → Chimege TTS API
   │
   ↓ audio stream
play-voice.ts → browser playback
```

---

## Deployment

### Production

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Cloudflare Workers (OpenNext) | `seq/web/wrangler.jsonc` |
| Backend API | Cloudflare Workers | `seq/server/wrangler.toml` |
| Database | Cloudflare D1 | `sign-bridge-db` |
| File Storage | Cloudflare R2 | `sign-bridge-storage` |
| Alt Frontend | Vercel | Root dir: `seq/web` |

### Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Web | Backend API base URL |
| `CHIMEGE_STT_TOKEN` | Web | Mongolian speech-to-text API key |
| `CHIMEGE_TTS_TOKEN` | Web | Mongolian text-to-speech API key |
| `JWT_SECRET` | Server | JWT signing secret |

### Local Development

```bash
# Backend
cd seq/server && npx wrangler dev          # → http://localhost:8787

# Frontend
cd seq/web && npm run dev                  # → http://localhost:3000

# ML training
cd seq/training && source .venv/bin/activate
python record.py                           # Record training clips
python train.py                            # Train model
python export_model.py                     # Export to TFJS
```

---

## Security

| Concern | Approach |
|---------|----------|
| Auth | JWT (HS256) with server-side secret |
| Passwords | Hashed before storage (crypto.ts) |
| API | All protected routes require Bearer token via auth middleware |
| Client-side ML | All inference runs in-browser — no video sent to server |
| Webhooks | Svix signature verification |
| Secrets | Stored in wrangler.toml (dev) / Cloudflare secret store (prod) |

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Client-side ML inference** | Privacy: raw video never leaves the browser |
| **Cloudflare Workers for API** | Low latency at edge, no cold starts for serverless |
| **Durable Objects for chat** | Stateful WebSocket coordination without external Redis |
| **TCN over RNN** | Better parallelism during training, competitive accuracy for gesture sequences |
| **D1 SQLite** | Simple schema, no ops overhead, sufficient for current scale |
| **Chimege for STT/TTS** | Only service supporting Mongolian language |
