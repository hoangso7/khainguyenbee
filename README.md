# 🐝 KBee Manager - Hệ thống quản lý tổ ong

Ứng dụng web quản lý tổ ong với mã QR, xuất PDF và SSL tự động.

## ✨ Tính năng chính

- 🏠 **Quản lý tổ ong**: Thông tin chi tiết, trạng thái bán, không giới hạn số lượng
- 📱 **Mã QR thông minh**: Tự động tạo QR cho mỗi tổ, domain integration
- 📄 **Xuất PDF**: Mã QR 3x3cm, tải xuống hàng loạt
- 🔒 **Bảo mật**: SSL tự động, session 30 ngày, mã hóa mật khẩu
- 📱 **Mobile-friendly**: Responsive design, touch-friendly

## 🚀 Deploy nhanh

### Yêu cầu
- Docker & Docker Compose
- Domain name (cho SSL)
- Server với ports 80, 443 mở

### Cài đặt

1. **Clone và setup**
```bash
git clone https://github.com/hoangso7/khainguyenbee.git
cd khainguyenbee
```

2. **Cấu hình environment**
```bash
# Tạo file .env từ template
./setup-env.sh

# Chỉnh sửa thông tin quan trọng
nano .env
```

**Các biến quan trọng:**
```env
DOMAIN=your-domain.com
SSL_EMAIL=your-email@domain.com
SECRET_KEY=your-very-secure-secret-key
MYSQL_ROOT_PASSWORD=your-secure-password
```

3. **Deploy**
```bash
./setup.sh
```

4. **Truy cập**
- **HTTPS**: https://your-domain.com (SSL tự động)
- **Tài khoản**: Tạo tài khoản đầu tiên khi truy cập

### Dừng ứng dụng
```bash
docker compose down
```

## 🔧 Cấu hình nhanh

### SSL Certificate
```bash
# Kiểm tra SSL
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Manual renewal
docker compose exec certbot certbot renew
```

### Logs
```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs specific service
docker compose logs -f web
docker compose logs -f nginx
```

### Backup
```bash
# Backup database
docker exec kbee_mysql mysqldump -u kbee_user -p kbee_manager > backup.sql

# Restore database
docker exec -i kbee_mysql mysql -u kbee_user -p kbee_manager < backup.sql
```

## 📖 Hướng dẫn sử dụng

### 1. Đăng nhập
- Tạo tài khoản đầu tiên khi truy cập

### 2. Thêm tổ ong
1. Click "Thêm tổ ong"
2. Điền thông tin: Số thứ tự, ngày nhập, tình trạng sức khỏe, ghi chú
3. Click "Lưu tổ ong"

### 3. Quản lý tổ ong
- **Xem danh sách**: Trang chủ hiển thị tất cả tổ ong
- **Chỉnh sửa**: Click biểu tượng edit
- **Xóa**: Click biểu tượng trash
- **Xem QR**: Click vào mã QR để xem chi tiết

### 4. Bán tổ ong
1. Click nút "Bán" (💰) trên tổ ong
2. Xác nhận hành động
3. Mã QR sẽ tự động chuyển sang hiển thị thông tin trại ong

### 5. Xuất PDF
1. Click "Xuất PDF QR" trên thanh menu
2. File PDF sẽ được tải xuống với tất cả mã QR 3x3cm

## 🐳 Docker Services

- **web**: Ứng dụng Flask (port 5000)
- **mysql**: Database MySQL (port 3306)
- **nginx**: Reverse proxy với SSL (port 80/443)
- **certbot**: SSL certificates
- **ssl-renew**: Auto-renewal SSL

## 🔒 Bảo mật

- SSL tự động với Let's Encrypt
- Auto-renewal SSL certificates
- HTTP to HTTPS redirect
- Security headers tự động
- Mã hóa mật khẩu với Werkzeug

## 📞 Hỗ trợ

- **Issues**: GitHub Issues
- **Email**: support@kbee.com

---

**KBee Manager** - Quản lý tổ ong thông minh! 🐝✨