# Multi-stage Dockerfile for optimized Next.js builds with Bun
# Stage 1: Dependencies - Install all dependencies
FROM oven/bun:1.3.5-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (including devDependencies for building)
RUN bun install --frozen-lockfile

# Stage 2: Production Dependencies - Install only production deps + migration tools
FROM oven/bun:1.3.5-alpine AS prod-deps

WORKDIR /app

COPY package.json bun.lock* ./

# Install only production dependencies + drizzle tools for migrations
RUN bun install --frozen-lockfile --production && \
    bun add drizzle-kit@0.30.5 drizzle-orm@0.41.0 postgres@3.4.4

# Stage 3: Builder - Build the Next.js application
FROM oven/bun:1.3.5-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1

# Build the Next.js application with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun run build

# Stage 3: Runner - Production runtime
FROM oven/bun:1.3.5-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json and ONLY production node_modules for migrations (smaller image)
COPY --from=builder /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy database schema, config, and env for migrations
COPY --from=builder /app/src/server/db ./src/server/db
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/env.js ./src/env.js

# Copy startup script
COPY --from=builder /app/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application with migrations
CMD ["./scripts/start.sh"]
