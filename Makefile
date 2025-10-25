# KBee Manager Docker Commands

.PHONY: help build up down restart logs clean dev-up dev-down dev-logs

# Default target
help:
	@echo "KBee Manager Docker Commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start production environment"
	@echo "  make down      - Stop production environment"
	@echo "  make restart   - Restart production environment"
	@echo "  make logs      - Show logs for all services"
	@echo "  make clean     - Remove all containers and volumes"
	@echo "  make dev-up    - Start development environment"
	@echo "  make dev-down  - Stop development environment"
	@echo "  make dev-logs  - Show development logs"
	@echo "  make setup     - Run complete setup script"
	@echo "  make dev-setup - Run development setup"
	@echo ""
	@echo "Environment Variables:"
	@echo "  FLASK_ENV=development  - Run in development mode"
	@echo "  BACKEND_VOLUME=.:/app  - Mount source code for development"

# Production commands
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

# Development commands
dev-up:
	FLASK_ENV=development FLASK_DEBUG=1 BACKEND_VOLUME=.:/app docker compose up -d

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f

# Cleanup commands
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# Database commands
db-shell:
	docker compose exec db mysql -u kbee_user -p kbee_manager

db-backup:
	docker compose exec db mysqldump -u kbee_user -p kbee_manager > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Quick setup
setup:
	@./setup.sh

dev-setup:
	@./setup.sh dev
