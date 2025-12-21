# Latency Improvement TODO (AI Service + Web)

This file tracks the prioritized plan to improve production latency for:
- **Railway AI service** (TTS/STT/Translate)
- **Vercel web app** (Next.js API routes calling n8n + AI service)

## P0 — Deploy + verify the recent code wins (same day)
- [ ] **Redeploy Vercel (Production)** so latest `main` is live (Tagalog translation-skip, Node runtime for `/api/chat`, TTS URL fallback).
- [ ] **Confirm Vercel env vars (Production)**:
  - [ ] `AI_SERVICE_URL=https://<your-railway-ai>.up.railway.app`
  - [ ] `TTS_SERVICE_URL=https://<your-railway-ai>.up.railway.app` (keep explicit to avoid misconfig)
  - [ ] `AI_SERVICE_API_KEY=<shared-secret>`
- [ ] **Confirm Railway AI env vars**:
  - [ ] `AI_SERVICE_API_KEY=<same-shared-secret>`
  - [ ] `PRELOAD_TTS_LANGUAGES=bcl,fil` (optional add `,eng`)
- [ ] **Smoke test with curl (should not hit ~25s timeouts)**:
  - [ ] `/api/chat` (fil) returns quickly (no translate timeout).
  - [ ] `/api/tts` returns 200 (no Vercel invocation timeout).

## P1 — Eliminate cold-start/model re-downloads (biggest infra win)
- [ ] **Attach a Railway Volume** to the AI service (mount at `/data`).
- [ ] **Persist HuggingFace + Torch caches** by setting Railway AI vars:
  - [ ] `HF_HOME=/data/hf`
  - [ ] `TRANSFORMERS_CACHE=/data/hf/transformers`
  - [ ] `TORCH_HOME=/data/torch` (optional)
- [ ] **Redeploy AI service** and verify:
  - [ ] `/health` shows `tts_models_loaded` includes at least `bcl` and `fil`.
  - [ ] First TTS request after redeploy does **not** take “forever” (no multi-minute download).

## P2 — Avoid slow paths in the request pipeline (highest ROI code changes)
- [ ] **Chat translation strategy** (quality + latency):
  - [ ] **Bikol**: always translate `bikol → english` before LLM, then translate back `english → bikol`.
  - [ ] **Tagalog**: default to **no translation**, enforce “reply in Tagalog” via instruction; only translate if needed.
- [ ] **Reduce translation timeouts** (only if safe):
  - [ ] Consider lowering translate timeout from 30s to 10–15s once AI service reliability is proven.
- [ ] **TTS response length controls**:
  - [ ] Cap max chars for TTS, or chunk long answers and speak progressively.

## P3 — Add caching (huge win for repeated phrases)
- [ ] **Translation cache**:
  - [ ] Keep the current in-memory cache (best-effort).
  - [ ] Upgrade to a shared cache (Redis) if you want cross-instance persistence.
- [ ] **TTS cache**:
  - [ ] Cache `(language, text) → wav` (Redis or object storage like S3/R2) for repeated assistant phrases/disclaimers.
  - [ ] Add cache hit/miss logging and a max-size/TTL policy.

## P4 — Compute/model optimizations (when budget allows)
- [ ] **Move AI service to GPU** (if Railway plan supports it) for faster TTS/STT.
- [ ] **Model optimization**:
  - [ ] Explore smaller/faster or quantized variants if CPU-only.
  - [ ] Benchmark per-language TTS latency and quality before switching.

## P5 — Keep warm (nice-to-have)
- [ ] Add an external ping (every 5–10 minutes) to:
  - [ ] `GET /health`
  - [ ] Optionally a lightweight warm endpoint (or short `/tts`) if needed.

## Observability (do alongside other work)
- [ ] Add timing logs on AI service endpoints:
  - [ ] model load time vs inference time vs total time
- [ ] Add timing logs in web API routes:
  - [ ] translate duration
  - [ ] n8n/LLM duration
  - [ ] tts duration


