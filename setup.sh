#!/bin/bash

# KBee Manager - Setup Script
# This script sets up the application with SSL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo -e "${BLUE}🐝 KBee Manager - Setup${NC}"
echo "========================"

# Step 1: Stop all services
print_status "Stopping all services..."
docker-compose down

# Step 2: Start basic services (web, mysql, nginx without SSL)
print_status "Starting basic services..."
docker-compose up -d web mysql

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Step 3: Start nginx with temporary config (no SSL)
print_status "Starting nginx with temporary config..."
docker-compose up -d nginx

# Wait for nginx to be ready
sleep 5

# Step 4: Test basic connectivity
print_status "Testing basic connectivity..."
if curl -s --head "http://localhost" | head -n 1 | grep -q "200 OK"; then
    print_success "Basic connectivity working"
else
    print_warning "Basic connectivity test failed, but continuing..."
fi

# Step 5: Obtain SSL certificate (only if domain is configured)
print_status "Checking domain configuration..."
if grep -q "DOMAIN=khainguyenbee.io.vn" .env; then
    print_status "Domain configured, attempting to obtain SSL certificate..."
    
    # Run certbot to obtain certificate
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@khainguyenbee.io.vn \
        --agree-tos \
        --no-eff-email \
        -d khainguyenbee.io.vn \
        -d www.khainguyenbee.io.vn
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained successfully"
        
        # Step 6: Switch to SSL nginx config
        print_status "Switching to SSL nginx configuration..."
        docker-compose stop nginx
        
        # Update docker-compose to use SSL config
        sed -i.bak 's|nginx-temp.conf|nginx.conf|g' docker-compose.yml
        
        # Start nginx with SSL
        docker-compose up -d nginx ssl-renew
        
        print_success "SSL setup completed!"
        echo
        echo "🌐 Your website is now available at:"
        echo "   https://khainguyenbee.io.vn"
        echo "   https://www.khainguyenbee.io.vn"
        echo "   http://localhost (local development)"
    else
        print_warning "SSL certificate acquisition failed (domain not configured or not accessible)"
        print_warning "Application will run without SSL for local development"
        echo
        echo "🌐 Your application is available at:"
        echo "   http://localhost"
        echo "   http://localhost:8000 (direct)"
        echo
        echo "📋 To enable SSL later:"
        echo "   1. Configure DNS for khainguyenbee.io.vn to point to this server"
        echo "   2. Run: docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@khainguyenbee.io.vn --agree-tos --no-eff-email -d khainguyenbee.io.vn -d www.khainguyenbee.io.vn"
        echo "   3. Update docker-compose.yml to use nginx.conf instead of nginx-temp.conf"
        echo "   4. Restart nginx: docker-compose restart nginx"
    fi
else
    print_warning "Domain not configured in .env file"
    print_warning "Application will run without SSL for local development"
    echo
    echo "🌐 Your application is available at:"
    echo "   http://localhost"
    echo "   http://localhost:8000 (direct)"
fi

print_success "Setup completed!"
echo
echo "📋 Next steps:"
echo "   1. Create your admin account at http://localhost/setup"
echo "   2. Test your application"
echo "   3. Monitor logs with: docker-compose logs -f"
echo
echo "📊 Useful commands:"
echo "   docker-compose logs nginx    # View nginx logs"
echo "   docker-compose logs web      # View application logs"
echo "   docker-compose logs mysql    # View database logs"
