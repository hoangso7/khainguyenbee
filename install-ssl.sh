#!/bin/bash

# 🔐 SSL Certificate Installation Script
# Hướng dẫn cài đặt SSL certificate thực

set -e

echo "🔐 KBee Manager - SSL Certificate Installation"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed"
    exit 1
fi

print_step "1. Tạo thư mục SSL certificates"
mkdir -p ssl_certs
print_status "Thư mục ssl_certs đã được tạo"

print_step "2. Hướng dẫn copy certificate files"
echo ""
echo "📁 Vui lòng copy các file certificate vào thư mục ssl_certs:"
echo "   - your-domain.crt → ssl_certs/khainguyenbee.io.vn.crt"
echo "   - your-domain.key → ssl_certs/khainguyenbee.io.vn.key"
echo ""
echo "📋 Ví dụ:"
echo "   cp /path/to/your-domain.crt ssl_certs/khainguyenbee.io.vn.crt"
echo "   cp /path/to/your-domain.key ssl_certs/khainguyenbee.io.vn.key"
echo ""

# Wait for user to copy files
read -p "Nhấn Enter sau khi đã copy các file certificate..."

# Check if certificate files exist
if [ ! -f "ssl_certs/khainguyenbee.io.vn.crt" ]; then
    print_error "File ssl_certs/khainguyenbee.io.vn.crt không tồn tại"
    exit 1
fi

if [ ! -f "ssl_certs/khainguyenbee.io.vn.key" ]; then
    print_error "File ssl_certs/khainguyenbee.io.vn.key không tồn tại"
    exit 1
fi

print_status "Certificate files đã được tìm thấy"

print_step "3. Kiểm tra certificate files"
echo ""

# Check certificate details
print_status "Certificate details:"
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"

echo ""
print_status "Certificate expiry:"
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -dates -noout

echo ""
print_status "Certificate subject:"
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -subject -noout

# Check if certificate is for correct domain
CERT_SUBJECT=$(openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -subject -noout | grep -o "CN=[^,]*" | cut -d= -f2)
if [[ "$CERT_SUBJECT" != "khainguyenbee.io.vn" ]]; then
    print_warning "Certificate subject ($CERT_SUBJECT) không khớp với domain khainguyenbee.io.vn"
    read -p "Bạn có muốn tiếp tục? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_step "4. Set file permissions"
chmod 644 ssl_certs/khainguyenbee.io.vn.crt
chmod 600 ssl_certs/khainguyenbee.io.vn.key
print_status "File permissions đã được set"

print_step "5. Backup certificates"
cp ssl_certs/khainguyenbee.io.vn.crt ssl_certs/khainguyenbee.io.vn.crt.backup
cp ssl_certs/khainguyenbee.io.vn.key ssl_certs/khainguyenbee.io.vn.key.backup
print_status "Certificates đã được backup"

print_step "6. Tạo nginx config cho production"
cat > nginx-https.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    upstream kbee_backend {
        server web:5000;
    }

    # HTTP server - redirect to HTTPS
    server {
        listen 80;
        server_name khainguyenbee.io.vn www.khainguyenbee.io.vn;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # Redirect all HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name khainguyenbee.io.vn www.khainguyenbee.io.vn;
        
        # SSL configuration
        ssl_certificate /etc/ssl/certs/khainguyenbee.io.vn.crt;
        ssl_certificate_key /etc/ssl/private/khainguyenbee.io.vn.key;
        
        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Static files
        location /static/ {
            alias /app/static/;
            expires 1h;
            add_header Cache-Control "public";
        }

        # API and main application
        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://kbee_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
print_status "Nginx config đã được tạo"

print_step "7. Cập nhật docker-compose.yml"
# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Update nginx volumes in docker-compose.yml
sed -i.bak 's|./nginx-https.conf:/etc/nginx/nginx.conf:ro|./nginx-https.conf:/etc/nginx/nginx.conf:ro|g' docker-compose.yml
sed -i.bak 's|./nginx-selfsigned.crt:/etc/ssl/certs/nginx-selfsigned.crt:ro|./ssl_certs/khainguyenbee.io.vn.crt:/etc/ssl/certs/khainguyenbee.io.vn.crt:ro|g' docker-compose.yml
sed -i.bak 's|./nginx-selfsigned.key:/etc/ssl/private/nginx-selfsigned.key:ro|./ssl_certs/khainguyenbee.io.vn.key:/etc/ssl/private/khainguyenbee.io.vn.key:ro|g' docker-compose.yml

print_status "Docker-compose.yml đã được cập nhật"

print_step "8. Deploy với SSL mới"
echo ""
print_warning "Sẽ restart tất cả services. Bạn có muốn tiếp tục?"
read -p "Nhấn Enter để tiếp tục hoặc Ctrl+C để hủy..."

print_status "Stopping services..."
docker-compose down

print_status "Starting services với SSL mới..."
docker-compose up -d

print_status "Waiting for services to start..."
sleep 15

print_step "9. Test SSL installation"
echo ""

# Test HTTP redirect
print_status "Testing HTTP redirect..."
HTTP_RESPONSE=$(curl -s -I http://localhost | head -1)
if [[ $HTTP_RESPONSE == *"301"* ]] || [[ $HTTP_RESPONSE == *"302"* ]]; then
    print_status "✅ HTTP redirect hoạt động"
else
    print_warning "⚠️  HTTP redirect có thể không hoạt động"
fi

# Test HTTPS
print_status "Testing HTTPS..."
HTTPS_RESPONSE=$(curl -s -k -I https://localhost | head -1)
if [[ $HTTPS_RESPONSE == *"200"* ]] || [[ $HTTPS_RESPONSE == *"302"* ]]; then
    print_status "✅ HTTPS hoạt động"
else
    print_warning "⚠️  HTTPS có thể không hoạt động"
fi

print_step "10. Kiểm tra services"
docker-compose ps

echo ""
echo "🎉 SSL Certificate Installation hoàn tất!"
echo ""
echo "📋 Kết quả:"
echo "   - HTTP: http://localhost (redirect to HTTPS)"
echo "   - HTTPS: https://localhost"
echo "   - Production: https://khainguyenbee.io.vn"
echo ""
echo "🧪 Test SSL:"
echo "   - Browser: https://khainguyenbee.io.vn"
echo "   - SSL Labs: https://www.ssllabs.com/ssltest/"
echo ""
echo "📁 Files created:"
echo "   - ssl_certs/khainguyenbee.io.vn.crt"
echo "   - ssl_certs/khainguyenbee.io.vn.key"
echo "   - nginx-https.conf"
echo "   - docker-compose.yml.backup"
echo ""
echo "⚠️  Lưu ý:"
echo "   - Backup certificates an toàn"
echo "   - Theo dõi ngày hết hạn"
echo "   - Test trên production domain"
echo ""
print_status "Installation completed successfully!"
