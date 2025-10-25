#!/bin/bash

# KBee Manager Docker Cleanup Script
# This script forcefully removes all Docker containers, volumes, and images

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

# Function to confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}Are you sure you want to continue? This will remove ALL Docker data! [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operation cancelled."
        exit 1
    fi
}

# Main cleanup function
cleanup_all() {
    print_status "Starting Docker cleanup..."
    
    # Stop all running containers
    print_status "Stopping all running containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove all containers
    print_status "Removing all containers..."
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Remove all volumes
    print_status "Removing all volumes..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    # Remove all images
    print_status "Removing all images..."
    docker rmi $(docker images -aq) 2>/dev/null || true
    
    # Remove all networks (except default)
    print_status "Removing custom networks..."
    docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true
    
    # System prune
    print_status "Running system prune..."
    docker system prune -af --volumes
    
    print_success "Docker cleanup completed!"
}

# Cleanup only KBee Manager related resources
cleanup_kbee() {
    print_status "Cleaning up KBee Manager resources..."
    
    # Stop and remove KBee containers
    print_status "Stopping KBee containers..."
    docker compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove KBee images
    print_status "Removing KBee images..."
    docker rmi $(docker images --filter "reference=kbee*" -q) 2>/dev/null || true
    docker rmi $(docker images --filter "reference=*kbee*" -q) 2>/dev/null || true
    
    # Remove KBee volumes
    print_status "Removing KBee volumes..."
    docker volume rm $(docker volume ls -q --filter name=kbee) 2>/dev/null || true
    docker volume rm mysql_data redis_data 2>/dev/null || true
    
    # Remove KBee networks
    print_status "Removing KBee networks..."
    docker network rm kbee_network 2>/dev/null || true
    
    print_success "KBee Manager cleanup completed!"
}

# Force remove specific volumes
force_remove_volumes() {
    print_status "Force removing all volumes..."
    
    # Stop all containers first
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove all containers
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Force remove all volumes
    docker volume ls -q | xargs -r docker volume rm -f 2>/dev/null || true
    
    print_success "All volumes force removed!"
}

# Show current Docker resources
show_status() {
    print_status "Current Docker resources:"
    echo ""
    echo "Containers:"
    docker ps -a
    echo ""
    echo "Images:"
    docker images
    echo ""
    echo "Volumes:"
    docker volume ls
    echo ""
    echo "Networks:"
    docker network ls
}

# Main script
main() {
    echo "🧹 KBee Manager Docker Cleanup Script"
    echo "======================================"
    echo ""
    
    case "${1:-}" in
        "all")
            confirm
            cleanup_all
            ;;
        "kbee")
            cleanup_kbee
            ;;
        "volumes")
            confirm
            force_remove_volumes
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  all      - Remove ALL Docker containers, volumes, images, and networks"
            echo "  kbee     - Remove only KBee Manager related resources"
            echo "  volumes  - Force remove all Docker volumes"
            echo "  status   - Show current Docker resources"
            echo "  help     - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 kbee     # Safe cleanup of KBee resources only"
            echo "  $0 volumes  # Force remove all volumes (dangerous!)"
            echo "  $0 all      # Nuclear option - removes everything!"
            echo ""
            ;;
        "")
            echo "No command specified. Use '$0 help' for usage information."
            echo ""
            echo "Quick options:"
            echo "  $0 kbee     - Clean KBee resources only (recommended)"
            echo "  $0 volumes  - Force remove all volumes"
            echo "  $0 all      - Remove everything (dangerous!)"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
