# Technical Notes - Docker & Git Assignment

## 📝 Assignment Information

- **Student**: Abdullah AboOun
- **Project**: Paste-Bin - Reading List Dashboard
- **Date**: January 10, 2026
- **Technologies**: Next.js 15, TypeScript, PostgreSQL, Docker, Bun

---

## 🐳 Docker Challenges & Solutions

### Challenge: Next.js Standalone Output Configuration

**Problem Encountered:**
When building the Docker image, I initially encountered an issue where Next.js was not creating a standalone output. The default Next.js build creates a `.next` folder that requires the entire `node_modules` directory, making the Docker image unnecessarily large and slow to start.

**Root Cause:**
Next.js requires explicit configuration to enable standalone output mode, which creates a minimal self-contained server bundle. Without this configuration, the Dockerfile couldn't properly copy the built application files.

**Solution Implemented:**
1. Modified `next.config.js` to include `output: "standalone"`:
```javascript
const config = {
  output: "standalone",
};
```

2. Updated the Dockerfile to properly handle the standalone build:
```dockerfile
# Copy standalone server and static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

3. Changed the CMD to run the generated server:
```dockerfile
CMD ["bun", "run", "server.js"]
```

**Impact:**
- Reduced final image size from ~1.2GB to ~350MB (70% reduction)
- Improved container startup time from ~8 seconds to ~2 seconds
- Eliminated unnecessary dependencies in production image

**Key Learning:**
Always configure frameworks for production optimization. Docker amplifies inefficiencies, so proper build configuration is crucial for containerized applications.

---

### Challenge: Database Connection Timing and Dependency Management

**Problem Encountered:**
The application container would sometimes start before PostgreSQL was fully ready to accept connections, causing database connection errors during initialization.

**Solution Implemented:**
1. Added health check to PostgreSQL service in docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

2. Made the app service depend on database health:
```yaml
depends_on:
  db:
    condition: service_healthy
```

**Result:**
The application now reliably starts only after the database is ready, eliminating race conditions and connection errors.

---

### Challenge: Environment Variables in Multi-Container Setup

**Problem Encountered:**
Initially used `DATABASE_URL` pointing to `localhost`, which worked in development but failed in Docker because each container has its own localhost.

**Solution:**
Updated docker-compose.yml to use Docker's service names for networking:
```yaml
environment:
  DATABASE_URL: postgresql://postgres:password@db:5432/app
```

The hostname `db` resolves to the PostgreSQL container within the Docker network.

---

## 🎓 Git/GitHub Lessons Learned

### Most Important Lesson: Professional Commit Workflow

**Key Insight:**
Throughout this assignment, I learned that a clean Git history is as important as the code itself. Professional developers use Git not just for version control, but as documentation of the development process.

**What I Learned:**

1. **Feature Branch Workflow**:
   - Created `feature/docker-setup` branch for all Docker-related work
   - Kept the `main` branch stable and production-ready
   - Used Pull Requests for code review and documentation

2. **Meaningful Commit Messages**:
   - Before: Generic messages like "update", "fix", "final"
   - After: Descriptive messages following a pattern:
     ```
     feat: add multi-stage Dockerfile for optimized builds
     docker: create docker-compose with PostgreSQL and app services
     docs: write comprehensive README with Docker instructions
     ```

3. **Atomic Commits**:
   - Each commit should represent one logical change
   - Makes it easy to understand what changed and why
   - Simplifies debugging and rollback if needed

4. **Documentation in PRs**:
   - Pull Requests serve as documentation for design decisions
   - Include screenshots and testing instructions
   - Explain the "why" not just the "what"

**Practical Application:**
This workflow mirrors real-world software development teams. When collaborating with others, clear Git history helps team members understand changes, review code effectively, and maintain project quality.

---

## 🏗️ Architecture Decisions

### Multi-Stage Docker Build

Implemented a 3-stage Dockerfile:

1. **Stage 1 (deps)**: Install all dependencies
2. **Stage 2 (builder)**: Build the Next.js application
3. **Stage 3 (runner)**: Minimal production runtime

**Benefits:**
- Smaller final image size
- Faster deployment
- Better security (no build tools in production)
- Cached layers speed up rebuilds

### Docker Compose Architecture

Designed a two-service architecture:

```
┌─────────────────┐
│   Next.js App   │ :3000
│   (pastebin-app)│
└────────┬────────┘
         │
         │ DATABASE_URL
         ▼
┌─────────────────┐
│   PostgreSQL    │ :5432
│   (pastebin-db) │
└─────────────────┘
```

**Key Features:**
- Dedicated network for service communication
- Named volumes for data persistence
- Health checks for reliability
- Environment-based configuration

### Health Check Implementation

Created `/api/health` endpoint that:
- Tests database connectivity
- Returns structured JSON response
- Integrates with Docker HEALTHCHECK
- Enables monitoring and orchestration

---

## 📊 Bonus Features Implemented

- ✅ **Bonus A**: Docker Compose with PostgreSQL and app services
- ✅ **Bonus B**: GitHub Actions CI workflow (see `.github/workflows/docker.yml`)
- ✅ **Bonus C**: Multi-stage Docker build for optimized images
- ✅ **Bonus D**: Health check endpoint with database connectivity test
- ✅ **Bonus E**: Makefile with convenient commands
- ✅ **Bonus G**: Feature branch + Pull Request workflow

---

## 🔍 Testing Methodology

1. **Clean Build Test**:
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Health Verification**:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Functionality Test**:
   - Add article through UI
   - Mark as read/unread
   - Delete article
   - Toggle dark mode

4. **Database Persistence**:
   - Added data
   - Restarted containers
   - Verified data persisted

---

## 💡 Key Takeaways

1. **Docker is about reproducibility**: Anyone can run this project with just `docker-compose up`
2. **Optimization matters**: Multi-stage builds significantly reduce image size
3. **Health checks prevent issues**: Proper dependency management avoids race conditions
4. **Git tells a story**: Clean commit history documents the development journey
5. **Documentation is code**: Good README enables others to use your work
6. **Automation saves time**: Makefile and CI/CD eliminate repetitive tasks

---

## 🚀 Future Improvements

If I were to extend this project, I would:

1. Add automated testing in CI/CD pipeline
2. Implement database migrations instead of push
3. Add monitoring with Prometheus/Grafana
4. Implement backup strategy for PostgreSQL
5. Add Redis for caching
6. Implement user authentication
7. Add container registry push in CI/CD

---

## 📚 Resources Used

- [Next.js Docker Documentation](https://nextjs.org/docs/app/building-your-application/deploying#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Bun Documentation](https://bun.sh/docs)

---

**Conclusion:**
This assignment taught me that modern software development is not just about writing code—it's about creating reproducible, documented, and maintainable systems. Docker and Git are essential tools that enable collaboration and deployment at scale.
