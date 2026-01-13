# Docker Compose Environment Configuration

This project uses a multi-file Docker Compose setup to support both development and production environments.

## File Structure

- **docker-compose.yml** - Base configuration with the app service (production-ready)
- **docker-compose.override.yml** - Development overrides (adds local PostgreSQL database)
- **docker-compose.prod.yml** - Production-specific configuration (for managed database)

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
- Database exposed on `localhost:5432`
- Development environment variables
- Hot-reload and debugging support
- No resource limits for faster development

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

For production deployment with Digital Ocean Managed PostgreSQL:

```bash
# Ensure DATABASE_URL is set
export DATABASE_URL='postgresql://user:password@your-managed-db.ondigitalocean.com:25060/db?sslmode=require'

# Start production environment
make prod-up

# This uses:
# - docker-compose.yml (base)
# - docker-compose.prod.yml (production overrides)
```

**Features:**
- Connects to external managed PostgreSQL (Digital Ocean)
- No local database container
- Production logging configuration
- Resource limits (1 CPU, 1GB RAM)
- Optimized for deployment

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

### Development (.env.example)
```bash
cp .env.example .env
```

Edit `.env` with your local settings (default values work out of the box).

### Production (.env.prod.example)
```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` with your Digital Ocean managed database connection string.

**Required for production:**
- `DATABASE_URL` - Connection string to managed PostgreSQL
- `NODE_ENV=production`

## Database Migrations

### Development
```bash
# Run migrations in development
make db-migrate
```

### Production
**Best Practice:** Run migrations manually before deployment:

```bash
# On your local machine or CI/CD pipeline
export DATABASE_URL='your-production-database-url'
bun run db:push
```

**Important:** Do NOT run migrations automatically in the production container startup. This is a production best practice to avoid migration issues during scaling or restarts.

## Testing Production Configuration Locally

Before deploying to Digital Ocean, test your production configuration:

```bash
# 1. Set up a test managed database on Digital Ocean
export DATABASE_URL='your-test-managed-database-url'

# 2. Validate configuration
make prod-config

# 3. Test locally
make test-prod

# 4. Start with production config
make prod-up
```

## Digital Ocean Deployment

### Using App Platform

1. **Create a managed PostgreSQL database:**
   - Go to Digital Ocean Console → Databases
   - Create a new PostgreSQL cluster
   - Note the connection string

2. **Configure environment variables in App Platform:**
   ```
   DATABASE_URL=postgresql://user:password@your-db.ondigitalocean.com:25060/db?sslmode=require
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

3. **Deploy:**
   - App Platform will automatically build using your Dockerfile
   - The app will connect to your managed database
   - No local database container will run

### Using Docker Compose on a Droplet

```bash
# 1. SSH into your droplet
ssh root@your-droplet-ip

# 2. Clone your repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git
cd Paste-Bin

# 3. Set environment variables
export DATABASE_URL='your-managed-database-url'

# 4. Deploy
make prod-up
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
```

### Production Flow
```
┌─────────────────┐
│   Deployment    │
└────────┬────────┘
         │
  make prod-up
         │
         ▼
┌─────────────────────────────┐
│   docker-compose.yml        │
│   + docker-compose.prod.yml │
└───────┬─────────────────────┘
        │
        ▼
   ┌────────┐
   │  App   │
   │ :3000  │
   └───┬────┘
       │
       │ DATABASE_URL
       │
       ▼
┌────────────────────┐
│ Digital Ocean      │
│ Managed PostgreSQL │
└────────────────────┘
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
# Validate DATABASE_URL is set
echo $DATABASE_URL

# Test connection to managed database
psql "$DATABASE_URL" -c "SELECT version();"

# Check production logs
make prod-logs
```

### Migration issues
```bash
# Development: Reset and recreate
make clean
make up
make db-migrate

# Production: Run manually
export DATABASE_URL='your-production-url'
bun run db:push
```

## Further Considerations

### 1. Automatic Migration on Startup

**Current approach:** Migrations are run manually before deployment.

**Alternatives:**
- Add an entrypoint script that runs migrations before starting the app
- Use a sidecar container or init container for migrations
- Integrate into CI/CD pipeline (recommended)

**Recommendation:** Keep migrations separate from app startup in production to avoid race conditions during scaling.

### 2. Environment Variable Management

**Current approach:** 
- `.env` files locally (gitignored)
- Digital Ocean environment variables in production

**Alternatives:**
- Use `docker-compose config` to validate before deployment
- Use secrets management tools (Vault, AWS Secrets Manager)
- Use encrypted environment files

### 3. Testing Both Environments

**Recommendation:** Always test production configuration locally before deploying:

```bash
# Create a test managed database on Digital Ocean
export DATABASE_URL='test-managed-database-url'
make test-prod
make prod-up
# Verify everything works
make prod-down
```

This catches configuration issues before they reach production.
