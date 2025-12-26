#!/bin/bash

# MyNaga Gabay - Start All Services
# This script kills any existing services and starts fresh

set -e

echo "=== MyNaga Gabay Development Server ==="
echo ""

# Define ports used by services
WEB_PORT=3000
API_PORT=4000
TTS_PORT=8001

# Function to kill process on a port
kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "Killing $name on port $port (PID: $pid)..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Kill existing services
echo "Cleaning up existing services..."
kill_port $WEB_PORT "Web (Next.js)"
kill_port $API_PORT "API (Express)"
kill_port $TTS_PORT "TTS Service"

# Also kill any turbo processes
pkill -f "turbo run dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true

echo "All ports cleared."
echo ""

# Start all services using turbo
echo "Starting all services..."
echo "  - Web:  http://localhost:$WEB_PORT"
echo "  - API:  http://localhost:$API_PORT"
echo "  - Docs: http://localhost:$API_PORT/api/docs"
echo ""

npm run dev
