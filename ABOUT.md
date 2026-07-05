# About Pocket TTS Studio

## In plain English

This project turns written text into spoken audio — and it can even speak in *your* voice, or someone else's, if you give it a short recording to copy the style from.

Think of it as having two parts working together, like a kitchen and a dining room:

- **The kitchen (backend)** is where the actual "cooking" happens — an AI model listens to a sample voice (or picks one of 26+ built‑in voices) and generates speech audio for whatever text you type in.
- **The dining room (frontend)** is the nice web page you actually interact with — you type your text, pick a voice, hit "Generate," and listen to (or download) the result. It also remembers your past generations and lets you switch between light and dark mode.

The two talk to each other over your computer's network (`localhost`), so both need to be running for the app to work. There's a single command (`npm run dev` / `npm start` from the project root) that starts both for you at once.

**What makes it interesting:**
- **No expensive graphics card needed.** The speech AI model is small (about 100 million "parameters," which is tiny by AI standards) and was built to run well on an ordinary computer's CPU — even a laptop.
- **It starts talking almost instantly.** Instead of waiting for the whole sentence to be generated before you hear anything, audio streams to your ears as it's produced — roughly a fifth of a second after you hit generate.
- **Voice cloning.** Upload 10–30 seconds of someone's (consenting, lawfully-obtained) voice, and the model will speak your text back in a similar tone, accent, and style.
- **Multi-language.** English, French, German, Italian, Spanish, and Portuguese out of the box.
- **Everything runs locally on your machine** — your text and audio don't need to be sent to a third-party cloud service to be processed (the AI model itself is downloaded once from Hugging Face, then runs offline).

## In technical terms

**Pocket TTS Studio** is a full-stack, self-hostable text-to-speech (TTS) application. It pairs a Next.js frontend with the [Kyutai Pocket TTS](https://github.com/kyutai-labs/pocket-tts) inference backend, wired together as two independently runnable services.

### Architecture

```
┌─────────────────────────┐     HTTP / chunked WAV      ┌──────────────────────────────┐
│   Next.js 15 frontend   │ ◄──────────────────────────► │  Pocket-TTS FastAPI backend  │
│   (port 3000)           │                              │  (port 8000)                 │
└─────────────────────────┘                              └──────────────────────────────┘
```

- **Backend** (`pocket-tts/`): an unmodified vendored copy of Kyutai's `pocket-tts` Python package. It exposes a FastAPI server (`pocket_tts/main.py`) with two relevant endpoints:
  - `GET /health` — readiness probe (`{"status": "healthy"}`)
  - `POST /tts` — accepts form fields `text`, and either `voice_url` (a preset name or `hf://`/`https://` URL to a reference clip) or a multipart `voice_wav` file upload for cloning; streams back `audio/wav` with `Transfer-Encoding: chunked`.

  The underlying model (`kyutai/pocket-tts`, ~100M parameters) is an autoregressive TTS model that runs on CPU only (the authors found no GPU speedup at batch size 1), uses ~2 CPU cores, achieves ~200ms time-to-first-audio, and runs at roughly 6× real-time on an Apple Silicon M4. It supports `int8` quantization to roughly halve memory use, and per-language model variants (e.g. `french_24l` for a larger/higher-quality 24-layer French model).

- **Frontend** (`frontend/`): Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, structured as:
  - `src/app/(app)/{studio,voices,history,settings}/page.tsx` — the four main views (generation studio, voice library, generation history, settings)
  - `src/app/proxy/{health,tts}/route.ts` — Next.js route handlers that proxy requests to the backend (keeping `BACKEND_URL` server-side vs. `NEXT_PUBLIC_BACKEND_URL` for the browser)
  - `src/hooks/useStreamingAudio.ts` — parses the 44-byte WAV header out of the first streamed chunk, buffers PCM data (~16KB threshold), and schedules gapless playback via the Web Audio API while simultaneously assembling a `Blob` for download/history
  - `src/hooks/useBackendHealth.ts` — polls `/health` periodically to drive the UI's backend-status indicator
  - `src/lib/store.ts` — Zustand stores for generation history, settings, and voice selection (client-side persisted state)
  - `src/lib/voices.ts` — the static catalog of 26+ preset voices (name, language, description, Hugging Face URL) surfacing Kyutai's published voice set (VCTK, Expresso, voice-donations corpora, etc.)

### Process orchestration

- `package.json` (root) exposes `npm run dev` / `npm start`, both invoking `start-all.js`, which:
  1. Kills any stale processes on ports 8000/3000
  2. Spawns `uv run pocket-tts serve --host localhost --port 8000` in `pocket-tts/`
  3. After a 5s boot delay, spawns `npm run dev` in `frontend/`
  4. Forwards `SIGINT`/`SIGTERM` to cleanly tear down the backend
- `install.js` / `pinokio.js` provide alternate launcher/installer entry points (the latter for the [Pinokio](https://pinokio.computer) one-click-installer ecosystem), and `VoiceCloneGenerator.app` / `.command` wrap the same startup flow as a double-clickable macOS app.
- `docker-compose.yml` + per-service `Dockerfile`s support running both services as containers for production deployment (e.g. frontend → Vercel, backend → Fly.io/Render, using its existing `Dockerfile`).

### Stack summary

| Layer | Technology |
|---|---|
| TTS inference | Kyutai Pocket TTS (PyTorch, ≥2.5, CPU-only), served via FastAPI |
| Backend package management | `uv` (or plain `pip`) |
| Frontend framework | Next.js 15, React, TypeScript |
| Styling / UI | Tailwind CSS, shadcn/ui primitives |
| Client state | Zustand |
| Audio | Web Audio API (streaming playback), chunked WAV over HTTP |
| Orchestration | Node.js launcher script (`start-all.js`), Docker Compose |

### Licensing / usage note

The `pocket-tts` backend is © Kyutai Labs (see its own `LICENSE`); the Studio frontend is MIT-licensed. Kyutai's model terms explicitly prohibit voice cloning without the speaker's consent, and any use for impersonation, disinformation, or harassment — worth keeping in mind since this app's core feature is voice cloning.
