#!/bin/bash

# KBee Manager - Environment Setup Script
# This script creates the .env file from env.example

echo "🐝 KBee Manager - Environment Setup"
echo "=================================="

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Copy env.example to .env
if [ -f env.example ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
else
    echo "❌ env.example file not found!"
    exit 1
fi

# Make .env file readable only by owner
chmod 600 .env

echo "🔧 Environment setup completed!"
echo
echo "📝 Next steps:"
echo "   1. Edit .env file with your actual values"
echo "   2. Run: docker-compose up -d"
echo
echo "⚠️  Important:"
echo "   - Change SECRET_KEY to a secure random string"
echo "   - Update DOMAIN to your actual domain"
echo "   - Set SSL_EMAIL to your email address"
echo "   - Update database passwords"
echo
echo "📋 To edit .env file:"
echo "   nano .env"
echo "   # or"
echo "   vim .env"
