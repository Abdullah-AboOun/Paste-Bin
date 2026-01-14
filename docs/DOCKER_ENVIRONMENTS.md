# Docker Compose Environment Configuration

This project uses a multi-file Docker Compose setup to support both development and production environments.

## File Structure

- **docker-compose.yml** - Base configuration with the app service
- **docker-compose.override.yml** - Development overrides (adds local PostgreSQL database)
- **docker-compose.prod.yml** - Production-specific configuration (PostgreSQL + production settings)

## Development Environment

For local development with a containerized PostgreSQL database:

```bash
# Start development environment (default behavior)
make up

# This automatically uses:
# - docker-compose.yml (base)
# - docker-compose.override.yml (adds local DB)
```

**Features:**
- Local PostgreSQL database running in a container
- Database exposed on `localhost:5432` for debugging
- Development environment variables
- Hot-reload and debugging support
- Relaxed resource limits for faster development

**What runs:**
- App container (Next.js) on port 3000
- PostgreSQL container on port 5432
- Both on the same Docker network

**Commands:**
```bash
make build          # Build development images
make up             # Start services (app + local DB)
make down           # Stop services
make restart        # Restart services
make logs           # View all logs
make logs-app       # View app logs only
make logs-db        # View database logs only
make db-shell       # Access PostgreSQL shell
make db-migrate     # Run database migrations
```

## Production Environment

For production deployment on any VPS with both app and database in Docker:

```bash
# Ensure .env.prod exists with secure credentials
cp .env.prod.example .env.prod
nano .env.prod  # Set POSTGRES_PASSWORD

# Start production environment
make prod-up

# This uses:
# - docker-compose.yml (base)
# - docker-compose.prod.yml (production overrides + database)
```

**Features:**
- PostgreSQL database running in Docker (not exposed externally)
- Production logging with rotation
- Automatic restarts
- Optimized for VPS deployment
- DATABASE_URL automatically generated from POSTGRES_PASSWORD

**What runs:**
- App container (Next.js) on port 3000
- PostgreSQL container (internal network only)
- Both with production settings and logging

**Commands:**
```bash
make prod-build      # Build production images
make prod-up         # Start production services
make prod-down       # Stop production services
make prod-restart    # Restart production services
make prod-logs       # View production logs
make prod-config     # Validate configuration
make test-prod       # Test production config locally
```

## Environment Variables

### Development (.env or .env.example)
```bash
# Usually not needed, docker-compose.override.yml sets defaults
# But you can create .env for custom settings:
cp .env.example .env
```

Edit `.env` with your local settings if needed (default values work out of the box).

**Key variables:**
- `DATABASE_URL` - Automatically set to local PostgreSQL
- `NODE_ENV=development`

### Production (.env.prod.example)
```bash
cp .env.prod.example .env.prod
nano .env.prod  # Edit with secure values
```

**Required for production:**
- `POSTGRES_PASSWORD` - Secure database password
- `POSTGRES_USER=postgres` - Database user
- `POSTGRES_DB=app` - Database name
- `NODE_ENV=production`

**Note:** `DATABASE_URL` is automatically generated in `docker-compose.prod.yml` from these variables.

## Database Migrations

### Development
```bash
# Run migrations in development
make db-migrate

# Or manually
docker compose exec app bun run db:push
```

### Production
```bash
# Run migrations in production
make prod-migrate

# Or manually
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app bun run db:push
```

**Automatic migrations:** The startup script (`scripts/start.sh`) automatically runs migrations when the container starts in production mode.

## Testing Production Configuration Locally

Before deploying to your VPS, test your production configuration:

```bash
# 1. Create .env.prod with test credentials
cp .env.prod.example .env.prod
# Edit with test password

# 2. Validate configuration
make prod-config

# 3. Test locally
make test-prod

# 4. Start with production config
make prod-up

# 5. Verify it works
curl http://localhost:3000/api/health

# 6. Clean up
make prod-down
```

## VPS Deployment

For deploying to any VPS (AWS, DigitalOcean, Linode, Vultr, etc.), see:

📖 **[VPS Deployment Guide](VPS_DEPLOYMENT.md)**

Quick steps:
```bash
# 1. SSH into your VPS
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git
cd Paste-Bin

# 4. Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Set secure POSTGRES_PASSWORD

# 5. Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Architecture

### Development Flow
```
┌─────────────────┐
│   Developer     │
└────────┬────────┘
         │
    make up
         │
         ▼
┌─────────────────────────────────┐
│   docker-compose.yml            │
│   + docker-compose.override.yml │
└───────┬─────────────────┬───────┘
        │                 │
        ▼                 ▼
   ┌────────┐      ┌──────────┐
   │  App   │◄─────┤ Local DB │
   │ :3000  │      │  :5432   │
   └────────┘      └──────────┘
     (dev)          (exposed)
```

### Production Flow (VPS)
```
┌─────────────────┐
│   VPS Server    │
└────────┬────────┘
         │
  make prod-up
         │
         ▼
┌─────────────────────────────┐
│   docker-compose.yml        │
│   + docker-compose.prod.yml │
└───────┬─────────────────┬───┘
        │                 │
        ▼                 ▼
   ┌────────┐      ┌──────────┐
   │  App   │◄─────┤ Prod DB  │
   │ :3000  │      │ (internal)│
   └────────┘      └──────────┘
    (public)        (private)
```

## Troubleshooting

### Local database connection issues
```bash
# Check if database container is running
docker ps | grep postgres

# Check database logs
make logs-db

# Reset database
make clean
make up
```

### Production connection issues
```bash
# Check if both containers are running
docker compose ps

# Check database is healthy
docker compose exec db pg_isready -U postgres

# Check production logs
make prod-logs

# Test database connection
docker compose exec app psql "$DATABASE_URL" -c "SELECT version();"
```

### Migration issues
```bash
# Development: Reset and recreate
make clean
make up
make db-migrate

# Production: Run manually
make prod-migrate
```

## Key Differences: Dev vs Prod

| Feature | Development | Production |
|---------|-------------|------------|
| **Database Port** | Exposed (5432) | Internal only |
| **Logging** | Simple | JSON with rotation |
| **Restart Policy** | unless-stopped | unless-stopped |
| **Resource Limits** | Relaxed (2GB) | Standard (1GB) |
| **Environment** | NODE_ENV=development | NODE_ENV=production |
| **Migrations** | Manual | Automatic on startup |
| **Database Volume** | postgres_data | postgres_data_prod |

## Best Practices

### 1. Never Commit Secrets
- `.env` and `.env.prod` are in `.gitignore`
- Only commit `.env.example` and `.env.prod.example`
- Use strong passwords in production

### 2. Test Production Locally
```bash
# Always test before deploying
make test-prod
make prod-up
# Verify everything works
make prod-down
```

### 3. Backup Database
```bash
# Production backup
make prod-backup

# Manual backup
docker compose exec db pg_dump -U postgres app > backup.sql
```

### 4. Monitor Logs
```bash
# Check logs regularly
make prod-logs

# Check specific timeframe
docker compose logs --since 1h app
```

### 5. Keep System Updated
```bash
# On VPS, update regularly
apt update && apt upgrade -y
docker system prune -f
```
