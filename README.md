# Pocket TTS Studio

A production-quality full-stack web application wrapping [Kyutai Pocket TTS](https://github.com/kyutai-labs/pocket-tts) with a beautiful Next.js frontend — inspired by ElevenLabs and Vercel.

```
┌─────────────────────────┐     HTTP/Streaming WAV     ┌──────────────────────────────┐
│   Next.js 15 Frontend   │ ◄─────────────────────────► │  Pocket-TTS FastAPI Backend  │
│   (port 3000)           │                             │  (port 8000)                 │
└─────────────────────────┘                             └──────────────────────────────┘
```

## Features

| Feature | Status |
|---|---|
| Real-time streaming TTS | ✅ |
| 26+ preset voices | ✅ |
| Voice cloning (upload .wav/.mp3) | ✅ |
| Custom voice URL (hf:// / https://) | ✅ |
| 6 languages (EN/FR/DE/IT/ES/PT) | ✅ |
| Generation history | ✅ |
| Dark / light mode | ✅ |
| Audio download | ✅ |
| Speed / latency stats | ✅ |
| Backend health indicator | ✅ |
| Mobile-first responsive design | ✅ |
| Drag-and-drop voice upload | ✅ |
| Temperature & decode step controls | ✅ |
| Apple Silicon optimized (CPU) | ✅ |

## Prerequisites

- **Node.js 20+** (for frontend)
- **Python 3.10–3.14** (for backend)
- **uv** (recommended) — install with `curl -LsSf https://astral.sh/uv/install.sh | sh`

---

## Quick Start (Development)

### 1. Start the Pocket-TTS backend

```bash
cd pocket-tts

# Using uv (recommended — handles virtualenv automatically)
uv run pocket-tts serve --host localhost --port 8000

# Or using pip
pip install pocket-tts
pocket-tts serve --host localhost --port 8000
```

The first run downloads ~400MB of model weights from Hugging Face. Subsequent starts are instant.

Optional flags:
```bash
# Use a specific language model
uv run pocket-tts serve --language french_24l

# Enable int8 quantization (reduces RAM usage ~50%)
uv run pocket-tts serve --quantize

# Bind to all interfaces (for Docker/remote access)
uv run pocket-tts serve --host 0.0.0.0
```

### 2. Start the Next.js frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
npm start
```

### Docker (full stack)

```bash
# Build and start both services
docker compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

#### Environment variables for Docker

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8000` | Pocket-TTS API URL (browser-visible) |
| `BACKEND_URL` | `http://localhost:8000` | Server-side API URL |

```bash
# Override at build time
docker compose build --build-arg NEXT_PUBLIC_BACKEND_URL=https://your-tts-api.com
```

---

## Project Structure

```
Voice/
├── pocket-tts/          # Kyutai Pocket TTS backend (unchanged)
│   └── pocket_tts/
│       ├── main.py      # FastAPI server — /health, /tts endpoints
│       └── ...
├── frontend/            # Next.js 15 frontend
│   └── src/
│       ├── app/
│       │   ├── (app)/
│       │   │   ├── studio/page.tsx    # Main TTS studio
│       │   │   ├── voices/page.tsx    # Voice library browser
│       │   │   ├── history/page.tsx   # Generation history
│       │   │   └── settings/page.tsx  # App settings
│       │   └── layout.tsx
│       ├── components/
│       │   ├── layout/    # Sidebar, Topbar, StatusDot
│       │   ├── studio/    # TextEditor, VoiceSelector, AudioPlayer, etc.
│       │   ├── ui/        # shadcn/ui primitives
│       │   └── providers/
│       ├── hooks/
│       │   ├── useStreamingAudio.ts   # WAV streaming + Web Audio API
│       │   └── useBackendHealth.ts    # Periodic health checks
│       ├── lib/
│       │   ├── api.ts       # generateTTS(), checkHealth()
│       │   ├── store.ts     # Zustand stores (history, settings, voice)
│       │   ├── voices.ts    # Predefined voice catalog
│       │   └── utils.ts
│       └── types/index.ts
└── docker-compose.yml
```

---

## Backend API Reference

The frontend communicates with the unmodified Pocket-TTS FastAPI server.

### `GET /health`
Returns `{"status": "healthy"}` when the backend is ready.

### `POST /tts`
Streams WAV audio for the given text.

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | `string` (form) | ✅ | Text to synthesize |
| `voice_url` | `string` (form) | One of | Preset name (`alba`) or `hf://`/`https://` URL |
| `voice_wav` | `File` (multipart) | One of | Uploaded audio file for voice cloning |

Response: `audio/wav` stream with `Transfer-Encoding: chunked`

---

## Audio Streaming Architecture

The `useStreamingAudio` hook implements a real-time WAV player:

1. Fetches `/tts` via `fetch()` — response arrives as a chunked stream
2. Parses the 44-byte WAV header from the first chunk
3. Buffers PCM data until a minimum buffer size is reached (~16KB)
4. Schedules audio playback via the Web Audio API, stitching buffers end-to-end with zero gaps
5. Simultaneously accumulates all chunks into a `Blob` for download and history

This achieves **~200ms time-to-first-audio** on Apple Silicon.

---

## Performance Tips (Apple Silicon)

- The backend runs entirely on CPU — no GPU required
- Model weights are cached in memory; restart only if you change `--language`
- `--quantize` flag halves RAM usage with minimal quality loss
- The `english_2026-04` model is ~6× real-time on M4 MacBook Air
- For long texts, the streaming architecture means you hear audio before generation finishes

---

## Voice Cloning Tips

1. Record 10–30 seconds of clear, noise-free speech
2. Use [Adobe Podcast Enhance](https://podcast.adobe.com/en/enhance) to clean the audio
3. Upload via the **Voice → Upload** tab in Studio
4. The model clones the style, tone, and accent of the reference audio

---

## Deployment

### Vercel (Frontend) + Fly.io/Render (Backend)

```bash
# Deploy frontend
cd frontend
vercel deploy --prod

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_URL = https://your-pocket-tts.fly.dev
```

For the backend, deploy the `pocket-tts` directory using its existing `Dockerfile`.

---

## License

The Pocket-TTS backend is © Kyutai Labs — see [pocket-tts/LICENSE](./pocket-tts/LICENSE).  
The Studio frontend is provided under the MIT License.
