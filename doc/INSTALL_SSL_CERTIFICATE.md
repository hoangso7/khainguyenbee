# 🔐 Hướng dẫn Cài đặt SSL Certificate Thực

## 📋 **Chuẩn bị**

### **Files bạn cần có:**
- `your-domain.crt` - Certificate file
- `your-domain.key` - Private key file
- `ca-bundle.crt` - Certificate Authority bundle (nếu có)

## 🚀 **Bước 1: Tạo thư mục SSL**

```bash
# Tạo thư mục cho SSL certificates
mkdir -p ssl_certs
cd ssl_certs
```

## 📁 **Bước 2: Copy certificate files**

```bash
# Copy các file certificate vào thư mục ssl_certs
cp /path/to/your-domain.crt ./khainguyenbee.io.vn.crt
cp /path/to/your-domain.key ./khainguyenbee.io.vn.key

# Nếu có CA bundle
cp /path/to/ca-bundle.crt ./khainguyenbee.io.vn.ca-bundle.crt
```

## 🔧 **Bước 3: Cập nhật docker-compose.yml**

### **Thêm volumes cho SSL certificates:**

```yaml
volumes:
  - ./nginx-https.conf:/etc/nginx/nginx.conf:ro
  - ./static:/usr/share/nginx/html/static:ro
  - ./ssl_certs/khainguyenbee.io.vn.crt:/etc/ssl/certs/khainguyenbee.io.vn.crt:ro
  - ./ssl_certs/khainguyenbee.io.vn.key:/etc/ssl/private/khainguyenbee.io.vn.key:ro
  - nginx_logs:/var/log/nginx
```

## 🌐 **Bước 4: Tạo nginx config cho production**

### **File: nginx-https.conf**

```nginx
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
```

## 🔄 **Bước 5: Deploy**

```bash
# Stop services
docker-compose down

# Start services với SSL mới
docker-compose up -d

# Check status
docker-compose ps
```

## 🧪 **Bước 6: Test SSL**

### **Test từ command line:**
```bash
# Test HTTP redirect
curl -I http://khainguyenbee.io.vn

# Test HTTPS
curl -I https://khainguyenbee.io.vn

# Test SSL certificate
openssl s_client -connect khainguyenbee.io.vn:443 -servername khainguyenbee.io.vn
```

### **Test từ browser:**
- `https://khainguyenbee.io.vn` - Không có cảnh báo
- `https://www.khainguyenbee.io.vn` - Không có cảnh báo

## 🔍 **Bước 7: Verify SSL**

### **Check certificate details:**
```bash
# Check certificate info
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -text -noout

# Check certificate expiry
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -dates -noout

# Check certificate chain
openssl s_client -connect khainguyenbee.io.vn:443 -showcerts
```

### **Online SSL checker:**
- https://www.ssllabs.com/ssltest/
- https://www.sslshopper.com/ssl-checker.html

## ⚠️ **Lưu ý quan trọng**

### **File permissions:**
```bash
# Set correct permissions
chmod 644 ssl_certs/khainguyenbee.io.vn.crt
chmod 600 ssl_certs/khainguyenbee.io.vn.key
```

### **Backup certificates:**
```bash
# Backup certificates
cp ssl_certs/khainguyenbee.io.vn.crt ssl_certs/khainguyenbee.io.vn.crt.backup
cp ssl_certs/khainguyenbee.io.vn.key ssl_certs/khainguyenbee.io.vn.key.backup
```

### **Certificate expiry:**
- Theo dõi ngày hết hạn
- Gia hạn trước khi hết hạn
- Setup monitoring cho certificate expiry

## 🆘 **Troubleshooting**

### **Lỗi thường gặp:**

#### **1. Certificate not trusted:**
```bash
# Check certificate chain
openssl s_client -connect khainguyenbee.io.vn:443 -showcerts
```

#### **2. Domain mismatch:**
```bash
# Check certificate subject
openssl x509 -in ssl_certs/khainguyenbee.io.vn.crt -subject -noout
```

#### **3. Nginx config error:**
```bash
# Test nginx config
docker exec kbee_nginx nginx -t
```

#### **4. Permission denied:**
```bash
# Check file permissions
ls -la ssl_certs/
```

## 📅 **Auto-renewal (Optional)**

### **Script check expiry:**
```bash
#!/bin/bash
# check-ssl-expiry.sh

CERT_FILE="ssl_certs/khainguyenbee.io.vn.crt"
DAYS_UNTIL_EXPIRY=$(openssl x509 -checkend 2592000 -noout -in $CERT_FILE)

if [ $? -eq 0 ]; then
    echo "Certificate is valid for more than 30 days"
else
    echo "Certificate expires within 30 days!"
    # Send notification or auto-renew
fi
```

### **Cron job:**
```bash
# Add to crontab
0 2 * * * /path/to/check-ssl-expiry.sh
```

## 🎯 **Kết quả mong đợi**

Sau khi cài đặt thành công:
- ✅ `https://khainguyenbee.io.vn` hoạt động không có cảnh báo
- ✅ `http://khainguyenbee.io.vn` tự động redirect đến HTTPS
- ✅ SSL grade A+ trên SSL Labs
- ✅ Green lock icon trên browser
- ✅ QR codes sử dụng HTTPS URLs
