# Quick Reference: Docker Compose Environments

## Quick Start

### Development (Local Database)
```bash
make up          # Start app + local PostgreSQL
make logs        # View logs
make db-shell    # Access database
make down        # Stop services
```

### Production (Managed Database)
```bash
export DATABASE_URL='your-managed-db-url'
make prod-up     # Start app (connects to managed DB)
make prod-logs   # View logs
make prod-down   # Stop services
```

## File Overview

| File | Purpose | Used By |
|------|---------|---------|
| `docker-compose.yml` | Base config (app service only) | Both dev & prod |
| `docker-compose.override.yml` | Adds local PostgreSQL | Dev only (auto-loaded) |
| `docker-compose.prod.yml` | Production settings | Prod only (explicit) |
| `.env.example` | Dev environment template | Development |
| `.env.prod.example` | Prod environment template | Production |

## Key Differences

### Development
- ✅ Local PostgreSQL container
- ✅ Port 5432 exposed for direct access
- ✅ Higher resource limits (2 CPU, 2GB RAM)
- ✅ NODE_ENV=development
- ✅ Auto-loads docker-compose.override.yml

### Production
- ❌ No local database (uses managed)
- ❌ Port 5432 not exposed
- ⚙️ Resource limits (1 CPU, 1GB RAM)
- ⚙️ NODE_ENV=production
- ⚙️ Production logging configuration
- ⚙️ Requires explicit -f docker-compose.prod.yml

## Testing Before Deploy

```bash
# 1. Create test managed database on Digital Ocean
# 2. Set environment variable
export DATABASE_URL='test-db-connection-string'

# 3. Validate configuration
make prod-config

# 4. Test locally
make prod-up
curl http://localhost:3000/api/health

# 5. Clean up
make prod-down
```

## Troubleshooting

### "DATABASE_URL not set"
```bash
export DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=require'
```

### Reset local database
```bash
make clean  # Removes volumes
make up     # Fresh start
```

### Check what's running
```bash
make status      # Docker status
docker ps        # All containers
```

## Common Workflows

### Switch from dev to prod locally
```bash
make down                          # Stop dev
export DATABASE_URL='prod-db-url'  # Set prod DB
make prod-up                       # Start prod
```

### Update and redeploy
```bash
git pull
make rebuild     # Dev: rebuild + restart with local DB
# OR
make prod-down && make prod-build && make prod-up  # Prod
```

### Run migrations
```bash
# Development
make db-migrate

# Production (before deployment)
export DATABASE_URL='production-url'
bun run db:push
```

## Need More Details?

See [docs/DOCKER_ENVIRONMENTS.md](./DOCKER_ENVIRONMENTS.md) for comprehensive documentation.
