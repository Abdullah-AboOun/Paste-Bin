# 📚 Paste-Bin - Reading List Dashboard

A modern, full-stack web application for managing your reading list. Save articles, track your reading progress, and organize your content all in one place.

[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- **📝 Article Management**: Save articles with titles and URLs
- **✅ Reading Tracker**: Mark articles as read/unread
- **🗑️ Easy Deletion**: Remove articles you no longer need
- **🌓 Dark Mode**: Toggle between light and dark themes
- **🔄 Real-time Updates**: Instant UI updates using tRPC
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **💚 Health Monitoring**: Built-in health checks for reliability

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh/) (ultra-fast JavaScript runtime)
- **Database**: [PostgreSQL](https://www.postgresql.org/) 16
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **API**: [tRPC](https://trpc.io/) for type-safe APIs
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Before running this project, ensure you have installed:

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Make](https://www.gnu.org/software/make/) (optional, for convenient commands)

## 🚀 Quick Start with Docker

### Option 1: Using Make (Recommended)

```bash
# Clone the repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git
cd Paste-Bin

# View all available commands
make help

# Build and start all services
make build
make up

# Or combine both steps
make rebuild
```

### Option 2: Using Docker Compose Directly

```bash
# Clone the repository
git clone https://github.com/Abdullah-AboOun/Paste-Bin.git
cd Paste-Bin

# Build the Docker images
docker-compose build

# Start all services
docker-compose up -d
```

The application will be available at:
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Database**: localhost:5432

## 🎯 How to Use

1. **Add an Article**:
   - Enter the article title
   - Paste the article URL
   - Click "Add Article"

2. **Mark as Read/Unread**:
   - Toggle the switch next to any article

3. **Delete an Article**:
   - Click the "Delete" button on any article

4. **Toggle Dark Mode**:
   - Use the theme toggle in the top-right corner

## 🐳 Docker Commands

### Using Make

```bash
make help          # Show all available commands
make build         # Build Docker images
make up            # Start services
make down          # Stop services
make restart       # Restart services
make logs          # View logs from all services
make logs-app      # View app logs only
make logs-db       # View database logs only
make status        # Show service status
make health        # Check service health
make db-shell      # Open PostgreSQL shell
make clean         # Stop and remove volumes (WARNING: deletes data)
make rebuild       # Rebuild and restart everything
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Restart services
docker-compose restart

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (defined in `.env`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/app"
NODE_ENV="production"
```

For Docker deployment, these are set in `docker-compose.yml` and automatically configured.

### Port Configuration

- **Application**: 3000 (configurable in `docker-compose.yml`)
- **PostgreSQL**: 5432 (configurable in `docker-compose.yml`)

To change ports, modify the `docker-compose.yml` file:

```yaml
services:
  app:
    ports:
      - "YOUR_PORT:3000"  # Change YOUR_PORT
  db:
    ports:
      - "YOUR_DB_PORT:5432"  # Change YOUR_DB_PORT
```

## 🧪 Testing the Application

1. **Health Check**:
   ```bash
   curl http://localhost:3000/api/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-01-10T...",
     "database": "connected",
     "service": "Paste-Bin API"
   }
   ```

2. **Add a Test Article**:
   - Open http://localhost:3000
   - Enter title: "Test Article"
   - Enter URL: "https://example.com"
   - Click "Add Article"

3. **Verify Database**:
   ```bash
   make db-shell
   # Then run:
   SELECT * FROM app_article;
   ```

## 💻 Local Development (Without Docker)

If you prefer to run the application locally without Docker:

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start PostgreSQL (using Docker or locally)
./start-database.sh

# Push database schema
bun run db:push

# Start development server
bun run dev
```

The application will be available at http://localhost:3000

## 🏗️ Project Structure

```
Paste-Bin/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   │   ├── health/       # Health check endpoint
│   │   │   └── trpc/         # tRPC API handlers
│   │   ├── page.tsx          # Main page component
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   └── ui/               # UI components (buttons, cards, etc.)
│   ├── server/               # Server-side code
│   │   ├── api/              # tRPC routers
│   │   └── db/               # Database configuration and schema
│   └── trpc/                 # tRPC client configuration
├── docs/                     # Documentation
│   ├── screenshots/          # Application screenshots
│   └── notes.md              # Technical notes
├── public/                   # Static files
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Service orchestration
├── Makefile                  # Convenience commands
├── .dockerignore             # Docker ignore rules
└── README.md                 # This file
```

## 🔍 Health Checks

The application includes built-in health checks:

- **Docker Health Check**: Automatically checks if the container is healthy
- **API Health Endpoint**: `/api/health` - Returns service and database status
- **Database Connectivity**: Verifies PostgreSQL connection

## 🛑 Stopping and Cleaning Up

### Stop Services

```bash
make down
# or
docker-compose down
```

### Remove All Data (Clean Database)

```bash
make clean
# or
docker-compose down -v
```

### Remove Everything (Including Images)

```bash
make clean-all
# or
docker-compose down -v --rmi all
```

## 🤝 Attribution

This project is built on the [T3 Stack](https://create.t3.gg/), created by [Theo Browne](https://twitter.com/t3dotgg). The T3 Stack provides a robust foundation for building type-safe, full-stack TypeScript applications.

### T3 Stack Components Used:
- Next.js for the framework
- TypeScript for type safety
- tRPC for type-safe APIs
- Drizzle ORM for database interactions
- Tailwind CSS for styling

Learn more about the T3 Stack: [create.t3.gg](https://create.t3.gg/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port
lsof -i :3000

# Stop the conflicting service or change the port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if database is running
docker-compose ps

# View database logs
make logs-db

# Restart database
docker-compose restart db
```

### Build Failures

```bash
# Clean everything and rebuild
make clean-all
make rebuild

# Or manually
docker-compose down -v --rmi all
docker-compose build --no-cache
docker-compose up -d
```

## 📧 Contact

- GitHub: [@Abdullah-AboOun](https://github.com/Abdullah-AboOun)
- Project: [Paste-Bin](https://github.com/Abdullah-AboOun/Paste-Bin)

---

Made with ❤️ using the T3 Stack
