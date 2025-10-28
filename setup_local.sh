#!/bin/bash

# Setup script for LOCAL development environment
# This script sets up KBee Manager for local development with HTTP only

set -e

echo "🚀 Setting up KBee Manager for LOCAL development..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found."
    exit 1
fi

echo "✅ Project structure verified"

# Copy local nginx configuration
echo "🔧 Configuring nginx for local development..."
if [ -f "frontend/nginx.local.conf" ]; then
    cp frontend/nginx.local.conf frontend/nginx.conf
    echo "✅ Local nginx configuration applied"
else
    echo "❌ Error: frontend/nginx.local.conf not found"
    exit 1
fi

# Set environment variables for local development
echo "🔧 Setting environment variables for local development..."
export ENVIRONMENT=local
export NODE_ENV=development
export VITE_API_URL=/api
export VITE_DOMAIN=localhost

echo "✅ Environment variables set:"
echo "   • ENVIRONMENT=local"
echo "   • NODE_ENV=development"
echo "   • VITE_API_URL=/api"
echo "   • VITE_DOMAIN=localhost"

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..
echo "✅ Frontend built successfully"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build
echo "✅ Docker images built successfully"

# Start services
echo "🚀 Starting services..."
docker-compose up -d
echo "✅ Services started successfully"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running"
else
    echo "❌ Some services failed to start"
    docker-compose ps
    exit 1
fi

# Test API endpoint
echo "🧪 Testing API endpoint..."
if curl -s http://localhost:80/api/auth/setup/check > /dev/null; then
    echo "✅ API endpoint is accessible"
else
    echo "❌ API endpoint is not accessible"
    exit 1
fi

echo ""
echo "🎉 KBee Manager is ready for local development!"
echo "================================================"
echo ""
echo "📋 Access URLs:"
echo "   • Frontend: http://localhost:80"
echo "   • API: http://localhost:80/api"
echo "   • Backend: http://localhost:8000"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Rebuild: docker-compose build"
echo ""
echo "🚀 Happy coding!"
