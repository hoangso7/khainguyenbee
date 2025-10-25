#!/bin/bash

# Script để setup SSL certificate từ vendor một cách an toàn
# Sử dụng: ./setup-vendor-ssl.sh

set -e

echo "🔐 Setting up SSL Certificate from Vendor..."

# Kiểm tra thư mục certs
if [ ! -d "certs" ]; then
    echo "❌ Thư mục certs không tồn tại!"
    exit 1
fi

# Kiểm tra file key
if [ ! -f "certs/key.txt" ]; then
    echo "❌ File certs/key.txt không tồn tại!"
    echo "Vui lòng đặt private key vào file certs/key.txt"
    exit 1
fi

# Tạo file certificate và key với tên chuẩn
echo "📝 Tạo file SSL certificate..."

# Đổi tên file key
mv certs/key.txt certs/khainguyenbee.io.vn.key

# Thiết lập quyền bảo mật cho private key
chmod 600 certs/khainguyenbee.io.vn.key

echo "✅ Private key đã được đặt tên và bảo mật"

# Kiểm tra xem có certificate file không
if [ ! -f "certs/khainguyenbee.io.vn.crt" ]; then
    echo "⚠️  File certificate (khainguyenbee.io.vn.crt) chưa có trong thư mục certs/"
    echo "Vui lòng đặt certificate file vào certs/khainguyenbee.io.vn.crt"
    echo ""
    echo "Bạn có thể:"
    echo "1. Copy file .crt từ vendor vào certs/khainguyenbee.io.vn.crt"
    echo "2. Hoặc chạy lại script này sau khi đã có certificate file"
    exit 1
fi

# Thiết lập quyền cho certificate
chmod 644 certs/khainguyenbee.io.vn.crt

echo "✅ Certificate file đã được thiết lập"

# Cập nhật docker-compose.yml để mount SSL files
echo "🔧 Cập nhật docker-compose.yml..."

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Thêm volume mount cho SSL certificates
sed -i.tmp '/- \.\/logs\/nginx:\/var\/log\/nginx/a\
      - ./certs/khainguyenbee.io.vn.crt:/etc/ssl/certs/khainguyenbee.io.vn.crt:ro\
      - ./certs/khainguyenbee.io.vn.key:/etc/ssl/private/khainguyenbee.io.vn.key:ro' docker-compose.yml

# Xóa file temp
rm docker-compose.yml.tmp

echo "✅ docker-compose.yml đã được cập nhật"

# Kiểm tra cấu hình nginx
echo "🔍 Kiểm tra cấu hình nginx..."
if grep -q "khainguyenbee.io.vn.crt" nginx.conf; then
    echo "✅ Nginx đã được cấu hình để sử dụng SSL certificate"
else
    echo "❌ Nginx chưa được cấu hình đúng cho SSL certificate"
    exit 1
fi

# Dừng containers hiện tại
echo "🛑 Dừng containers hiện tại..."
docker-compose down

# Khởi động lại với SSL mới
echo "🚀 Khởi động lại với SSL certificate mới..."
docker-compose up -d

# Kiểm tra trạng thái
echo "⏳ Chờ services khởi động..."
sleep 10

# Kiểm tra logs
echo "📋 Kiểm tra logs nginx..."
if docker logs kbee_nginx 2>&1 | grep -q "started"; then
    echo "✅ Nginx đã khởi động thành công"
else
    echo "❌ Có lỗi khi khởi động nginx. Kiểm tra logs:"
    docker logs kbee_nginx
    exit 1
fi

echo ""
echo "🎉 SSL Certificate đã được cài đặt thành công!"
echo ""
echo "📋 Thông tin SSL:"
echo "   - Certificate: certs/khainguyenbee.io.vn.crt"
echo "   - Private Key: certs/khainguyenbee.io.vn.key"
echo "   - Domain: khainguyenbee.io.vn"
echo ""
echo "🔍 Kiểm tra SSL:"
echo "   curl -I https://khainguyenbee.io.vn"
echo ""
echo "📝 Logs nginx:"
echo "   docker logs kbee_nginx"
echo ""
echo "⚠️  Lưu ý bảo mật:"
echo "   - File private key đã được thiết lập quyền 600"
echo "   - Thư mục certs/ đã được thêm vào .gitignore"
echo "   - Backup docker-compose.yml: docker-compose.yml.backup"
