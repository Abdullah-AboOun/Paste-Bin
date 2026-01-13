.PHONY: help build up down restart logs clean db-shell health status test install dev update

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Paste-Bin - Reading List Dashboard$(NC)"
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@echo "$(YELLOW)Development (local database):$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(build|up|down|restart|logs)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Production (managed database):$(NC)"
	@grep -E '^prod-[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Other commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -vE '(^help|build|up|down|restart|logs|prod-)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images (development)
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build --no-cache

up: ## Start all services in detached mode (development with local DB)
	@echo "$(GREEN)Starting development services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo "$(BLUE)Access the app at: http://localhost:3000$(NC)"
	@echo "$(BLUE)Database available at: localhost:5432$(NC)"

down: ## Stop all services (development)
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	$(MAKE) down
	$(MAKE) up

logs: ## View logs from all services
	docker-compose logs -f

logs-app: ## View logs from app service only
	docker-compose logs -f app

logs-db: ## View logs from database service only
	docker-compose logs -f db

clean: ## Stop services and remove volumes (clean database)
	@echo "$(RED)Warning: This will remove all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✓ Cleaned up$(NC)"; \
	fi

clean-all: ## Remove everything including images
	@echo "$(RED)Warning: This will remove all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		echo "$(GREEN)✓ Everything cleaned$(NC)"; \
	fi

db-shell: ## Open PostgreSQL shell
	@echo "$(BLUE)Opening database shell...$(NC)"
	docker-compose exec db psql -U postgres -d app

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker-compose exec app bun run db:push

status: ## Show status of all services
	@echo "$(BLUE)Service Status:$(NC)"
	@docker-compose ps

health: ## Check health of services
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -s http://localhost:3000/api/health | json_pp || echo "$(RED)Service not available$(NC)"

install: ## Install dependencies locally (for development)
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install

dev: ## Run development server locally (without Docker)
	@echo "$(GREEN)Starting development server...$(NC)"
	bun run dev

test: ## Test if services are running correctly
	@echo "$(BLUE)Testing services...$(NC)"
	@if docker-compose ps | grep -q "Up"; then \
		echo "$(GREEN)✓ Services are running$(NC)"; \
		curl -s http://localhost:3000/api/health > /dev/null && echo "$(GREEN)✓ Health check passed$(NC)" || echo "$(RED)✗ Health check failed$(NC)"; \
	else \
		echo "$(RED)✗ Services are not running$(NC)"; \
	fi

rebuild: ## Rebuild and restart services
	@echo "$(BLUE)Rebuilding and restarting...$(NC)"
	$(MAKE) down
	$(MAKE) build
	$(MAKE) up

# Production targets
prod-build: ## Build Docker images for production
	@echo "$(BLUE)Building production images...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

prod-up: ## Start production services (no local DB, uses managed PostgreSQL)
	@echo "$(GREEN)Starting production services...$(NC)"
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "$(RED)Error: DATABASE_URL environment variable not set$(NC)"; \
		echo "$(YELLOW)Set it with: export DATABASE_URL='your-connection-string'$(NC)"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production services started!$(NC)"
	@echo "$(BLUE)Access the app at: http://localhost:3000$(NC)"

prod-down: ## Stop production services
	@echo "$(YELLOW)Stopping production services...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
	@echo "$(GREEN)✓ Production services stopped$(NC)"

prod-logs: ## View logs from production services
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production services
	@echo "$(YELLOW)Restarting production services...$(NC)"
	$(MAKE) prod-down
	$(MAKE) prod-up

prod-config: ## Validate production docker-compose configuration
	@echo "$(BLUE)Validating production configuration...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml config

test-prod: ## Test production configuration locally (for validation before deploy)
	@echo "$(BLUE)Testing production configuration...$(NC)"
	@echo "$(YELLOW)Note: Ensure DATABASE_URL is set to a test database$(NC)"
	$(MAKE) prod-config
	@echo "$(GREEN)✓ Configuration is valid$(NC)"

update: ## Pull latest changes from git and restart services
	@echo "$(BLUE)Pulling latest changes...$(NC)"
	git pull
	@echo "$(GREEN)✓ Code updated$(NC)"
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install
	@echo "$(BLUE)Rebuilding and restarting services...$(NC)"
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Update complete!$(NC)"