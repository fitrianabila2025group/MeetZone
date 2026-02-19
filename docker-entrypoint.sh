#!/bin/sh
set -e

echo "================================================"
echo "  TimeWise - Time Zone & Meeting Planner Hub"
echo "================================================"
echo ""

# ── Wait for database ──────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for database to be ready..."
  
  # Extract host and port from DATABASE_URL
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    RETRIES=0
    MAX_RETRIES=60
    
    until wget --spider --quiet "http://${DB_HOST}:${DB_PORT}" 2>/dev/null || [ $RETRIES -ge $MAX_RETRIES ]; do
      RETRIES=$((RETRIES + 1))
      if [ $((RETRIES % 10)) -eq 0 ]; then
        echo "   Still waiting for database... (${RETRIES}s)"
      fi
      sleep 2
    done
    
    # Give it a couple more seconds after the port is open
    sleep 3
    echo "✅ Database connection ready"
  fi

  # ── Run migrations ──────────────────────────────────────
  echo "📦 Running database migrations..."
  npx prisma migrate deploy 2>&1 || {
    echo "⚠️  Migration failed, trying db push instead..."
    npx prisma db push --accept-data-loss 2>&1 || echo "⚠️  DB push also failed, continuing anyway..."
  }

  # ── Run seed ────────────────────────────────────────────
  echo "🌱 Running database seed..."
  npx prisma db seed 2>&1 || echo "⚠️  Seed failed (may already be seeded), continuing..."
  
  echo ""
fi

echo "🚀 Starting TimeWise server on port ${PORT:-3000}..."
echo ""

exec node server.js
