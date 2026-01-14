#!/bin/sh
set -e

echo "🚀 Starting Paste-Bin application..."

# Check if running in production
if [ "$NODE_ENV" = "production" ]; then
    echo "📊 Production mode detected"
    
    # Run database migrations if DATABASE_URL is set
    if [ -n "$DATABASE_URL" ]; then
        echo "📊 Running database migrations..."
        bun run db:push || echo "⚠️  Migration failed or already applied"
    else
        echo "⚠️  DATABASE_URL not set, skipping migrations"
    fi
else
    echo "🔧 Development mode"
fi

echo "✅ Starting Next.js server..."
exec bun run server.js
