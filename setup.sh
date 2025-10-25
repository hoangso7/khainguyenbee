#!/bin/bash

# KBee Manager Setup Script
# This script sets up the entire KBee Manager application with Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    if ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Function to create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please review and update .env file with your configuration"
        print_warning "IMPORTANT: Update DOMAIN, PROTOCOL, and PORT for QR code generation"
        echo ""
        echo "Example for production:"
        echo "  DOMAIN=your-domain.com"
        echo "  PROTOCOL=https"
        echo "  PORT=443"
        echo ""
    else
        print_status ".env file already exists"
    fi
}

# Function to setup frontend environment
setup_frontend_env() {
    if [ ! -f frontend/.env ]; then
        print_status "Creating frontend .env file..."
        echo "REACT_APP_API_URL=http://localhost:5000" > frontend/.env
        print_success "Frontend .env file created"
    else
        print_status "Frontend .env file already exists"
    fi
}

# Function to build and start services
start_services() {
    print_status "Building Docker images..."
    docker compose build

    print_status "Starting services..."
    docker compose up -d

    print_status "Waiting for services to be ready..."
    sleep 10

    # Check if services are running
    if docker compose ps | grep -q "Up"; then
        print_success "Services are running!"
    else
        print_error "Some services failed to start. Check logs with: docker compose logs"
        exit 1
    fi
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Check database
    if docker compose exec -T db mysqladmin ping -h localhost >/dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_warning "Database health check failed"
    fi

    # Check backend
    if curl -f http://localhost:5000/ >/dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_warning "Backend API health check failed"
    fi

    # Check frontend
    if curl -f http://localhost/ >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
}

# Function to show final information
show_info() {
    echo ""
    echo "=========================================="
    echo "🎉 KBee Manager Setup Complete!"
    echo "=========================================="
    echo ""
    echo "📱 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:5000"
    echo "🗄️  Database: localhost:3306"
    echo "📊 Redis: localhost:6379"
    echo ""
    echo "🔗 QR Code Configuration:"
    echo "  Update .env file with your domain:"
    echo "  DOMAIN=your-domain.com"
    echo "  PROTOCOL=https"
    echo "  PORT=443"
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs:     docker compose logs -f"
    echo "  Stop services: docker compose down"
    echo "  Restart:       docker compose restart"
    echo "  Database shell: docker compose exec db mysql -u kbee_user -p kbee_manager"
    echo ""
    echo "🔧 Development Mode:"
    echo "  make dev-up    - Start in development mode"
    echo "  make dev-down  - Stop development mode"
    echo ""
    echo "📚 Documentation:"
    echo "  Domain setup:  cat DOMAIN_SETUP.md"
    echo "  Makefile:      make help"
    echo "  Docker logs:   docker compose logs [service_name]"
    echo ""
}

# Function to handle development mode
setup_dev() {
    print_status "Setting up development environment..."
    
    # Create development .env
    cat > .env.dev << EOF
# Development Configuration
FLASK_ENV=development
FLASK_DEBUG=1
BACKEND_VOLUME=.:/app
DB_PORT=3307
BACKEND_PORT=5001
FRONTEND_PORT=3000
EOF

    print_success "Development environment configured"
    print_status "Use 'make dev-up' to start in development mode"
}

# Main setup function
main() {
    echo "🚀 KBee Manager Setup Script"
    echo "=============================="
    echo ""

    # Check if running in development mode
    if [ "$1" = "dev" ]; then
        print_status "Setting up development environment..."
        check_docker
        setup_env
        setup_frontend_env
        setup_dev
        print_success "Development setup complete!"
        return 0
    fi

    # Production setup
    check_docker
    setup_env
    setup_frontend_env
    start_services
    check_health
    show_info
}

# Handle command line arguments
case "${1:-}" in
    "dev")
        main "dev"
        ;;
    "help"|"-h"|"--help")
        echo "KBee Manager Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  - Setup production environment"
        echo "  dev        - Setup development environment"
        echo "  help       - Show this help message"
        echo ""
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac