#!/bin/bash

# Test script for both local and production configurations
# This script tests the nginx configurations and setup scripts

set -e

echo "🧪 Testing KBee Manager configurations..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Test local configuration
echo ""
echo "1️⃣ Testing LOCAL configuration..."
echo "-----------------------------------"
if [ -f "frontend/nginx.local.conf" ]; then
    echo "✅ Local nginx configuration file exists"
else
    echo "❌ Local nginx configuration file not found"
    exit 1
fi

# Test production configuration
echo ""
echo "2️⃣ Testing PRODUCTION configuration..."
echo "--------------------------------------"
if [ -f "frontend/nginx.production.conf" ]; then
    echo "✅ Production nginx configuration file exists"
else
    echo "❌ Production nginx configuration file not found"
    exit 1
fi

# Test setup scripts
echo ""
echo "3️⃣ Testing setup scripts..."
echo "----------------------------"
if [ -f "setup_local.sh" ]; then
    echo "✅ Local setup script exists"
    if [ -x "setup_local.sh" ]; then
        echo "✅ Local setup script is executable"
    else
        echo "❌ Local setup script is not executable"
        exit 1
    fi
else
    echo "❌ Local setup script not found"
    exit 1
fi

if [ -f "setup_production.sh" ]; then
    echo "✅ Production setup script exists"
    if [ -x "setup_production.sh" ]; then
        echo "✅ Production setup script is executable"
    else
        echo "❌ Production setup script is not executable"
        exit 1
    fi
else
    echo "❌ Production setup script not found"
    exit 1
fi

# Test SSL certificates for production
echo ""
echo "4️⃣ Testing SSL certificates..."
echo "------------------------------"
if [ -f "certs/www_khainguyenbee_io_vn_cert.pem" ] && [ -f "certs/key_khainguyenbee.io.vn.key" ]; then
    echo "✅ SSL certificates exist for production"
else
    echo "⚠️  SSL certificates not found (required for production)"
    echo "   Please ensure the following files exist:"
    echo "   • certs/www_khainguyenbee_io_vn_cert.pem"
    echo "   • certs/key_khainguyenbee.io.vn.key"
fi

# Test Docker configuration
echo ""
echo "5️⃣ Testing Docker configuration..."
echo "----------------------------------"
if [ -f "docker-compose.yml" ]; then
    echo "✅ Docker Compose configuration exists"
else
    echo "❌ Docker Compose configuration not found"
    exit 1
fi

if [ -f "frontend/Dockerfile" ]; then
    echo "✅ Frontend Dockerfile exists"
else
    echo "❌ Frontend Dockerfile not found"
    exit 1
fi

echo ""
echo "🎉 All configurations are valid!"
echo "==============================="
echo ""
echo "📋 Configuration Summary:"
echo "   • Local: nginx.local.conf (HTTP only)"
echo "   • Production: nginx.production.conf (HTTPS with SSL)"
echo "   • Local setup: setup_local.sh"
echo "   • Production setup: setup_production.sh"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "💡 Usage:"
echo "   • For local development: ./setup_local.sh"
echo "   • For production: ./setup_production.sh"
