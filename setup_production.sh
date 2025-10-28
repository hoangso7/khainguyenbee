#!/bin/bash

# Setup script for PRODUCTION environment
# This script sets up KBee Manager for production with HTTPS and SSL

set -e

echo "🚀 Setting up KBee Manager for PRODUCTION..."
echo "============================================="

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

# Check SSL certificates
echo "🔒 Checking SSL certificates..."
if [ -f "certs/www_khainguyenbee_io_vn_cert.pem" ] && [ -f "certs/key_khainguyenbee.io.vn.key" ]; then
    echo "✅ SSL certificates found"
else
    echo "❌ Error: SSL certificates not found!"
    echo "   Please ensure the following files exist:"
    echo "   • certs/www_khainguyenbee_io_vn_cert.pem"
    echo "   • certs/key_khainguyenbee.io.vn.key"
    exit 1
fi

# Copy production nginx configuration
echo "🔧 Configuring nginx for production..."
if [ -f "frontend/nginx.production.conf" ]; then
    cp frontend/nginx.production.conf frontend/nginx.conf
    echo "✅ Production nginx configuration applied"
else
    echo "❌ Error: frontend/nginx.production.conf not found"
    exit 1
fi

# Set environment variables for production
echo "🔧 Setting environment variables for production..."
export ENVIRONMENT=production
export NODE_ENV=production
export VITE_API_URL=/api
export VITE_DOMAIN=khainguyenbee.io.vn

echo "✅ Environment variables set:"
echo "   • ENVIRONMENT=production"
echo "   • NODE_ENV=production"
echo "   • VITE_API_URL=/api"
echo "   • VITE_DOMAIN=khainguyenbee.io.vn"

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
sleep 15

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
if curl -s -k https://localhost:443/api/auth/setup/check > /dev/null; then
    echo "✅ API endpoint is accessible"
else
    echo "❌ API endpoint is not accessible"
    exit 1
fi

# Test HTTPS redirect
echo "🧪 Testing HTTPS redirect..."
if curl -s -I http://localhost:80 | grep -q "301 Moved Permanently"; then
    echo "✅ HTTP to HTTPS redirect is working"
else
    echo "❌ HTTP to HTTPS redirect is not working"
    exit 1
fi

echo ""
echo "🎉 KBee Manager is ready for production!"
echo "======================================="
echo ""
echo "📋 Access URLs:"
echo "   • Frontend: https://khainguyenbee.io.vn"
echo "   • API: https://khainguyenbee.io.vn/api"
echo "   • Backend: http://localhost:8000"
echo ""
echo "🔒 Security Features:"
echo "   • HTTPS enabled with SSL certificates"
echo "   • HTTP to HTTPS redirect"
echo "   • Enhanced security headers"
echo "   • Strict CORS policies"
echo "   • HSTS enabled"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Rebuild: docker-compose build"
echo ""
echo "🚀 Production deployment complete!"
