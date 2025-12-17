#!/bin/bash

# ===========================================
# MyNaga Gabay - Start All Services
# ===========================================
# This script starts all local development services:
# - Web App (Next.js) on port 3000
# - Express API on port 4000
# - Python Image Preprocessor on port 8002
# 
# Usage: ./scripts/start-dev.sh
# Stop: Press Ctrl+C
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           MyNaga Gabay - Development Server              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    
    # Kill all background jobs
    if [ -n "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
    if [ -n "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    if [ -n "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:4000 | xargs kill -9 2>/dev/null || true
    lsof -ti:8002 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Check if required directories exist
if [ ! -d "$PROJECT_ROOT/apps/web" ]; then
    echo -e "${RED}Error: apps/web directory not found${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/apps/api" ]; then
    echo -e "${RED}Error: apps/api directory not found${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/packages/ai" ]; then
    echo -e "${RED}Error: packages/ai directory not found${NC}"
    exit 1
fi

# Start services
echo -e "${BLUE}Starting services...${NC}\n"

# 1. Start Python Image Preprocessor
echo -e "${PURPLE}[1/3] Starting Python Image Preprocessor (port 8002)...${NC}"
cd "$PROJECT_ROOT/packages/ai"
python src/image_preprocessor.py &
PYTHON_PID=$!
sleep 2

# 2. Start Express API
echo -e "${YELLOW}[2/3] Starting Express API (port 4000)...${NC}"
cd "$PROJECT_ROOT/apps/api"
npm run dev &
API_PID=$!
sleep 2

# 3. Start Next.js Web App
echo -e "${GREEN}[3/3] Starting Next.js Web App (port 3000)...${NC}"
cd "$PROJECT_ROOT/apps/web"
npm run dev &
WEB_PID=$!

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}✓${NC} All services started!                                  ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}                                                            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}Web App:${NC}            http://localhost:3000               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${YELLOW}Express API:${NC}        http://localhost:4000               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${PURPLE}Image Preprocessor:${NC} http://localhost:8002               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                            ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${RED}Press Ctrl+C to stop all services${NC}                       ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for all background processes
wait
