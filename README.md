# 🐝 KBee Manager - Hệ thống quản lý tổ ong

KBee Manager là một ứng dụng web được phát triển bằng Python Flask để quản lý tổ ong với đầy đủ các tính năng hiện đại bao gồm mã QR, xuất PDF, SSL tự động và giao diện thân thiện.

## ✨ Đặc điểm nổi bật

- 🚀 **One-command deployment** với Docker Compose
- 🔒 **SSL tự động** với Let's Encrypt và auto-renewal
- 📱 **Mobile-friendly** responsive design
- 🎨 **Honey-themed UI** với logo integration
- 🔐 **Session 30 ngày** cho admin
- 📊 **QR codes thông minh** với domain integration

## ✨ Tính năng chính

### 🏠 Quản lý tổ ong
- **Thông tin chi tiết**: Ngày nhập tổ, ngày tách tổ, tình trạng sức khỏe, ghi chú, số thứ tự
- **Không giới hạn số lượng**: Quản lý vô số tổ ong
- **Trạng thái bán**: Đánh dấu tổ đã bán với thông tin ngày bán

### 📱 Mã QR thông minh
- **Tự động tạo mã QR** cho mỗi tổ ong
- **Thông tin động**: 
  - Tổ chưa bán: Hiển thị thông tin chi tiết tổ ong
  - Tổ đã bán: Redirect đến trang thông tin KBee với địa chỉ, SĐT, ngày bán
- **Domain integration**: QR codes chứa link website tự động
- **Trang thông tin KBee**: Giao diện đẹp cho khách hàng
- **Quét mã QR** để xem thông tin nhanh chóng

### 📄 Xuất PDF
- **Mã QR 3x3cm** theo yêu cầu
- **Bố cục đẹp mắt** với thông tin tổ ong
- **Tải xuống hàng loạt** tất cả mã QR

### 🔐 Bảo mật
- **Hệ thống đăng nhập** an toàn
- **Phân quyền người dùng**
- **Mã hóa mật khẩu**
- **Session 30 ngày** cho tài khoản admin
- **Secure cookies** cho production
- **SSL/TLS encryption** với Let's Encrypt
- **Auto-renewal** SSL certificates
- **Security headers** (HSTS, CSP, XSS protection)

### 🎨 Giao diện
- **Thiết kế thân thiện** với màu sắc mật ong
- **Responsive** trên mọi thiết bị (mobile, tablet, desktop)
- **Touch-friendly** cho thiết bị di động
- **Logo integration** với bee.png và apiary.png
- **Custom 404 page** với thiết kế đẹp
- **Modern UI/UX** với Bootstrap 5

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Docker & Docker Compose (khuyến nghị)
- Domain name (cho SSL)
- Server với ports 80, 443 mở
- Hoặc Python 3.9+ + MySQL 8.0+ (manual setup)

### Cách 1: Chạy với Docker (Khuyến nghị)

1. **Clone repository**
```bash
git clone https://github.com/hoangso7/khainguyenbee.git
cd khainguyenbee
```

2. **Setup environment variables**
```bash
# Tạo file .env từ template
./setup-env.sh

# Chỉnh sửa file .env với thông tin của bạn
nano .env
```

**Các biến quan trọng cần cập nhật:**
```env
DOMAIN=your-domain.com
SSL_EMAIL=your-email@domain.com
SECRET_KEY=your-very-secure-secret-key
MYSQL_ROOT_PASSWORD=your-secure-password
```

3. **Setup và chạy ứng dụng**
```bash
./setup.sh
```

4. **Truy cập ứng dụng**
- **HTTPS**: https://khainguyenbee.io.vn (SSL tự động)
- **HTTP**: http://khainguyenbee.io.vn (redirect to HTTPS)
- **Local**: http://localhost (development)
- **MySQL**: localhost:3306
- **Tài khoản**: Tạo tài khoản đầu tiên khi truy cập

### Cách 2: Chạy thủ công

1. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

2. **Cấu hình database**
```bash
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE kbee_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Cấu hình environment**
```bash
# Tạo file .env
cp config.py .env
# Chỉnh sửa thông tin database trong .env
```

4. **Chạy ứng dụng**
```bash
python app.py
```

### Dừng ứng dụng
```bash
# Với Docker
docker compose down

# Với Docker (bao gồm volumes)
docker compose down -v
```

### SSL Certificate
```bash
# Kiểm tra SSL certificate
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Manual renewal
docker compose exec certbot certbot renew

# Xem SSL logs
docker compose logs ssl-renew
```

### Testing
```bash
# Chạy unit tests
./run_tests.sh

# Hoặc chạy từng loại test
python tests/simple_test.py
python tests/test_deployment.py
```

### Troubleshooting

**Database connection issues:**
```bash
# Reset database
docker compose down -v
docker compose up -d
```

**Services restart liên tục:**
```bash
# Kiểm tra logs
docker compose logs web
docker compose logs nginx
docker compose logs mysql

# Restart services
docker compose restart
```

**SSL certificate issues:**
```bash
# Kiểm tra certbot logs
docker compose logs certbot

# Restart certbot
docker compose restart certbot
```

## 🔧 Cấu hình

### Biến môi trường
Tất cả biến môi trường được quản lý trong file `.env`:

```bash
# Tạo file .env từ template
./setup-env.sh

# Chỉnh sửa file .env
nano .env
```

**Các biến quan trọng cần cập nhật:**
```env
SECRET_KEY=your-secret-key-change-this-in-production
DOMAIN=khainguyenbee.io.vn
SSL_EMAIL=admin@khainguyenbee.io.vn
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_PASSWORD=your-secure-password
```

### Cấu trúc database
- **User**: Quản lý người dùng
- **Beehive**: Thông tin tổ ong
  - serial_number: Số thứ tự
  - import_date: Ngày nhập
  - split_date: Ngày tách
  - health_status: Tình trạng sức khỏe
  - notes: Ghi chú
  - is_sold: Trạng thái bán
  - sold_date: Ngày bán

## 📖 Hướng dẫn sử dụng

### 1. Đăng nhập
- **Tài khoản mặc định**: admin / admin123
- Hoặc đăng ký tài khoản mới

### 2. Thêm tổ ong
1. Click "Thêm tổ ong"
2. Điền thông tin:
   - Số thứ tự (duy nhất)
   - Ngày nhập tổ
   - Ngày tách tổ (tùy chọn)
   - Tình trạng sức khỏe
   - Ghi chú
3. Click "Lưu tổ ong"

### 3. Quản lý tổ ong
- **Xem danh sách**: Trang chủ hiển thị tất cả tổ ong
- **Chỉnh sửa**: Click biểu tượng edit
- **Xóa**: Click biểu tượng trash (có xác nhận)
- **Xem QR**: Click vào mã QR để xem chi tiết

### 4. Bán tổ ong
1. Click nút "Bán" (💰) trên tổ ong
2. Xác nhận hành động
3. Mã QR sẽ tự động chuyển sang hiển thị thông tin trại ong
4. Có thể "Hủy bán" để khôi phục

### 5. Xuất PDF
1. Click "Xuất PDF QR" trên thanh menu
2. File PDF sẽ được tải xuống với tất cả mã QR 3x3cm

### 6. Mobile Usage
- **Responsive design**: Tự động điều chỉnh cho mobile
- **Touch-friendly**: Nút bấm tối ưu cho cảm ứng
- **Swipe gestures**: Vuốt để điều hướng
- **Mobile-optimized tables**: Cuộn ngang cho bảng dữ liệu

### 7. QR Code cho tổ đã bán
- **Quét QR code** của tổ đã bán
- **Redirect** đến trang thông tin KBee
- **Thông tin trại ong**: Địa chỉ, SĐT, ngày bán
- **Giao diện đẹp** cho khách hàng

## 🛠️ API Endpoints

### Authentication
- `POST /login` - Đăng nhập
- `POST /register` - Đăng ký
- `GET /logout` - Đăng xuất

### Beehive Management
- `GET /dashboard` - Trang chủ
- `GET /add_beehive` - Form thêm tổ ong
- `POST /add_beehive` - Tạo tổ ong mới
- `GET /edit_beehive/<id>` - Form chỉnh sửa
- `POST /edit_beehive/<id>` - Cập nhật tổ ong
- `GET /delete_beehive/<id>` - Xóa tổ ong

### QR & Export
- `GET /qr_code/<id>` - Lấy mã QR
- `GET /export_qr_pdf` - Xuất PDF
- `GET /kbee-info/<id>` - Trang thông tin KBee cho tổ đã bán

### Sales
- `GET /sell_beehive/<id>` - Đánh dấu đã bán
- `GET /unsell_beehive/<id>` - Hủy bán

## 🔒 Bảo mật

### Mã hóa
- Mật khẩu được hash bằng Werkzeug
- Session được bảo vệ bởi Flask-Login
- CSRF protection với Flask-WTF

### Database
- Prepared statements chống SQL injection
- Validation đầu vào
- Sanitization dữ liệu

## 🐳 Docker

### Services
- **web**: Ứng dụng Flask (port 8000 → 5000)
- **mysql**: Database MySQL (port 3306)
- **nginx**: Reverse proxy với SSL (port 80/443)
- **certbot**: Obtain SSL certificates
- **ssl-renew**: Auto-renewal SSL certificates

### Volumes
- `mysql_data`: Dữ liệu MySQL persistent
- `certbot_certs`: SSL certificates
- `certbot_www`: Webroot cho SSL validation
- `nginx_logs`: Nginx access/error logs

### Networks
- `kbee_network`: Network riêng cho các services

### SSL Auto-Setup
- **Tự động obtain** SSL certificate khi start
- **Auto-renewal** mỗi 12 giờ
- **HTTP to HTTPS** redirect
- **Security headers** tự động

## 📊 Monitoring

### Health Checks
- Application: `GET /health`
- Database: MySQL ping
- Container: Docker health checks

### Logs
```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs specific service
docker compose logs -f web
docker compose logs -f nginx
docker compose logs -f mysql
docker compose logs -f ssl-renew

# Xem nginx access logs
docker compose exec nginx tail -f /var/log/nginx/access.log
```

## 🚀 Deployment

### Production Ready
1. **SSL tự động** - Không cần cấu hình thêm
2. **Environment variables** - Quản lý trong .env
3. **Auto-renewal** - SSL certificates tự động renew
4. **Health checks** - Monitoring tự động
5. **Security headers** - Bảo mật tự động

### Quick Deploy
```bash
# Clone và setup
git clone https://github.com/hoangso7/khainguyenbee.git
cd khainguyenbee
./setup-env.sh
nano .env  # Cập nhật thông tin
docker compose up -d
```

### Backup
```bash
# Backup database
docker exec kbee_mysql mysqldump -u kbee_user -p kbee_manager > backup.sql

# Restore database
docker exec -i kbee_mysql mysql -u kbee_user -p kbee_manager < backup.sql

# Backup SSL certificates
docker cp kbee_nginx:/etc/letsencrypt ./ssl-backup/
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 📁 Cấu trúc dự án

```
kbee-manager/
├── .env                    # Environment variables (not in git)
├── env.example            # Environment template
├── setup-env.sh          # Environment setup script
├── docker compose.yml    # Docker services với SSL
├── nginx.conf           # Nginx configuration
├── app.py              # Flask application
├── config.py          # Configuration settings
├── requirements.txt   # Python dependencies
├── Dockerfile        # Docker image
├── init.sql         # Database initialization
├── .gitignore      # Git ignore rules
├── static/        # Static files
│   ├── css/      # Stylesheets
│   ├── js/       # JavaScript
│   └── icon/     # Logo files
├── templates/     # HTML templates
│   ├── base.html
│   ├── login.html
│   ├── dashboard.html
│   ├── kbee_info.html
│   └── 404.html
├── tests/        # Test suite
│   ├── simple_test.py
│   ├── test_deployment.py
│   ├── requirements-test.txt
│   └── README.md
├── docker compose.yml     # Main Docker Compose file
├── nginx.conf            # Nginx config with SSL
├── setup.sh              # Setup script
└── logs/         # Log files
    └── README.md
```

## 📞 Hỗ trợ

- **Email**: support@kbee.com
- **Issues**: GitHub Issues
- **Documentation**: Wiki

## 🎯 Roadmap

- [x] SSL tự động với Let's Encrypt
- [x] Environment variables management
- [x] Mobile-responsive design
- [x] QR codes với domain integration
- [x] Trang thông tin KBee cho khách hàng
- [x] Custom 404 page
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API documentation (Swagger)
- [ ] Automated testing
- [ ] CI/CD pipeline

---

**KBee Manager** - Quản lý tổ ong thông minh với công nghệ hiện đại! 🐝✨
