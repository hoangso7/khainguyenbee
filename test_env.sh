#!/bin/bash

echo "=== KBee Manager Environment Variables Test ==="
echo ""

echo "1. Checking .env file exists:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file not found"
    echo "Run: cp env.example .env"
    exit 1
fi

echo ""
echo "2. Frontend Environment Variables:"
echo "REACT_APP_DOMAIN: ${REACT_APP_DOMAIN:-khainguyenbee.io.vn}"
echo "REACT_APP_NAME: ${REACT_APP_NAME:-Quản lý tổ ong}"
echo "REACT_APP_VERSION: ${REACT_APP_VERSION:-2.0.0}"
echo "REACT_APP_COMPANY_NAME: ${REACT_APP_COMPANY_NAME:-KhaiNguyenBee}"

echo ""
echo "3. Backend Environment Variables:"
echo "DOMAIN: ${DOMAIN:-khainguyenbee.io.vn}"
echo "SECRET_KEY: ${SECRET_KEY:-your-secret-key-change-this-in-production}"

echo ""
echo "4. Database Environment Variables:"
echo "MYSQL_HOST: ${MYSQL_HOST:-mysql}"
echo "MYSQL_DATABASE: ${MYSQL_DATABASE:-kbee_manager}"
echo "MYSQL_USER: ${MYSQL_USER:-kbee_user}"

echo ""
echo "5. To update website information:"
echo "Edit .env file and change these values:"
echo "REACT_APP_DOMAIN=your-domain.com"
echo "REACT_APP_NAME=Your App Name"
echo "REACT_APP_VERSION=1.0.0"
echo "REACT_APP_COMPANY_NAME=Your Company"
echo ""
echo "Then rebuild frontend:"
echo "docker-compose build --no-cache frontend"
echo "docker-compose up -d frontend"
