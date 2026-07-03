#!/bin/bash
# ─────────────────────────────────────────────
#  Voice Clone Generator — macOS/Linux launcher
# ─────────────────────────────────────────────
BACKEND_PORT=8000
FRONTEND_PORT=3000
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🎙️  Starting Voice Clone Generator..."

# ── Kill stale processes ──────────────────────
lsof -ti:$BACKEND_PORT  | xargs kill -9 2>/dev/null || true
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true

# ── Backend (Python / uv) ─────────────────────
echo "📦 Checking backend dependencies..."
cd "$DIR/pocket-tts" || exit 1
if [ ! -d ".venv" ]; then
    echo "  Installing backend dependencies (this may take a minute)..."
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:/usr/local/bin:$PATH"
    uv sync
fi
echo "🟢 Starting Backend on :$BACKEND_PORT..."
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:/usr/local/bin:$PATH"
uv run pocket-tts serve --host localhost --port $BACKEND_PORT &
BACKEND_PID=$!

# ── Wait for backend to be ready ─────────────
echo "⏳ Waiting for backend to start..."
for i in $(seq 1 30); do
    if curl -s "http://localhost:$BACKEND_PORT/health" &>/dev/null; then
        echo "✓ Backend ready"
        break
    fi
    sleep 1
done

# ── Frontend (Next.js) ────────────────────────
echo "📦 Checking frontend dependencies..."
cd "$DIR/frontend" || exit 1
if [ ! -d "node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm install --prefer-offline
fi
echo "🟢 Starting Frontend on :$FRONTEND_PORT..."
npm run dev &
FRONTEND_PID=$!
cd "$DIR"

# ── Wait & open browser ───────────────────────
echo "⏳ Waiting for frontend to start..."
sleep 4

echo "🌐 Opening browser at http://localhost:$FRONTEND_PORT"
if command -v open &>/dev/null; then
    open "http://localhost:$FRONTEND_PORT"
elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:$FRONTEND_PORT"
fi

echo ""
echo "✅ Voice Clone Generator is running!"
echo "   Studio   → http://localhost:$FRONTEND_PORT"
echo "   Backend  → http://localhost:$BACKEND_PORT"
echo "   Press Ctrl+C to stop both servers."
echo ""

# ── Graceful shutdown ─────────────────────────
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    lsof -ti:$BACKEND_PORT  | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM
wait
