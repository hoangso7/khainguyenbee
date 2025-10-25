# Hướng dẫn cài đặt SSL Certificate từ Vendor

## ✅ Đã hoàn thành:
- [x] Private key đã được đặt vào `certs/key.txt`
- [x] Thư mục `certs/` đã được thêm vào `.gitignore`
- [x] Script tự động `setup-vendor-ssl.sh` đã được tạo

## 🔄 Bước tiếp theo:

### 1. Đặt Certificate File
Bạn cần đặt file certificate (`.crt`) từ vendor vào thư mục `certs/`:

```bash
# Copy certificate file từ vendor vào thư mục certs
cp /path/to/your/certificate.crt ./certs/khainguyenbee.io.vn.crt
```

### 2. Chạy Script Tự Động
```bash
# Chạy script để setup SSL
./setup-vendor-ssl.sh
```

Script sẽ tự động:
- ✅ Đổi tên `key.txt` thành `khainguyenbee.io.vn.key`
- ✅ Thiết lập quyền bảo mật (600 cho private key, 644 cho certificate)
- ✅ Cập nhật `docker-compose.yml` để mount SSL files
- ✅ Khởi động lại containers với SSL mới
- ✅ Kiểm tra trạng thái và logs

### 3. Kiểm tra SSL
Sau khi chạy script, kiểm tra SSL:

```bash
# Kiểm tra từ command line
curl -I https://khainguyenbee.io.vn

# Kiểm tra logs nginx
docker logs kbee_nginx

# Kiểm tra trạng thái containers
docker-compose ps
```

## 🔒 Bảo mật:

### Quyền file:
- Private key: `600` (chỉ owner đọc/ghi)
- Certificate: `644` (owner đọc/ghi, group/other đọc)

### Gitignore:
Thư mục `certs/` đã được thêm vào `.gitignore` để tránh commit nhầm SSL files.

## 🚨 Troubleshooting:

### Nếu gặp lỗi "certificate verify failed":
```bash
# Kiểm tra certificate chain
openssl x509 -in certs/khainguyenbee.io.vn.crt -text -noout

# Kiểm tra private key
openssl rsa -in certs/khainguyenbee.io.vn.key -check
```

### Nếu nginx không khởi động:
```bash
# Kiểm tra logs chi tiết
docker logs kbee_nginx

# Kiểm tra cấu hình nginx
docker exec kbee_nginx nginx -t
```

### Nếu cần rollback:
```bash
# Khôi phục docker-compose.yml
cp docker-compose.yml.backup docker-compose.yml

# Khởi động lại
docker-compose down && docker-compose up -d
```

## 📋 Checklist:

- [ ] Certificate file đã được đặt vào `certs/khainguyenbee.io.vn.crt`
- [ ] Chạy script `./setup-vendor-ssl.sh`
- [ ] Kiểm tra SSL hoạt động: `curl -I https://khainguyenbee.io.vn`
- [ ] Kiểm tra logs không có lỗi: `docker logs kbee_nginx`
- [ ] Test từ browser: `https://khainguyenbee.io.vn`

## 📞 Hỗ trợ:

Nếu gặp vấn đề, hãy cung cấp:
1. Output của script `setup-vendor-ssl.sh`
2. Logs nginx: `docker logs kbee_nginx`
3. Trạng thái containers: `docker-compose ps`
