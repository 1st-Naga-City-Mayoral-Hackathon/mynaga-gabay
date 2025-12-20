#!/usr/bin/env bash
set -euo pipefail

# Start all MyNaga Gabay services:
# - AI service (packages/ai) on port 8001
# - Web (apps/web) + API (apps/api) via Turborepo (`npm run dev`)
#
# Usage:
#   ./start-all.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

AI_PID=""

cleanup() {
  echo ""
  echo "[start-all] Shutting down..."
  if [[ -n "${AI_PID}" ]]; then
    kill "${AI_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "[start-all] Repo: ${ROOT_DIR}"

echo "[start-all] Starting AI service (http://localhost:8001)..."
(
  cd "${ROOT_DIR}/packages/ai"
  # Prefer an existing venv if user has one activated; otherwise use system python.
  python src/ai_service.py
) &
AI_PID="$!"
echo "[start-all] AI PID: ${AI_PID}"

echo "[start-all] Starting web + api via Turborepo..."
cd "${ROOT_DIR}"
npm run dev


