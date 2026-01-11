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
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build --no-cache

up: ## Start all services in detached mode
	@echo "$(GREEN)Starting services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo "$(BLUE)Access the app at: http://localhost:3000$(NC)"

down: ## Stop all services
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
update: ## Pull latest changes from git and restart services
	@echo "$(BLUE)Pulling latest changes...$(NC)"
	git pull
	@echo "$(GREEN)✓ Code updated$(NC)"
	@echo "$(BLUE)Installing dependencies...$(NC)"
	bun install
	@echo "$(BLUE)Rebuilding and restarting services...$(NC)"
	$(MAKE) rebuild
	@echo "$(GREEN)✓ Update complete!$(NC)"