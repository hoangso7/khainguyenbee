# 🐝 KBee Manager - Hệ thống quản lý tổ ong

KBee Manager là một ứng dụng web được phát triển bằng Python Flask để quản lý tổ ong với đầy đủ các tính năng hiện đại bao gồm mã QR, xuất PDF và giao diện thân thiện.

## ✨ Tính năng chính

### 🏠 Quản lý tổ ong
- **Thông tin chi tiết**: Ngày nhập tổ, ngày tách tổ, tình trạng sức khỏe, ghi chú, số thứ tự
- **Không giới hạn số lượng**: Quản lý vô số tổ ong
- **Trạng thái bán**: Đánh dấu tổ đã bán với thông tin ngày bán

### 📱 Mã QR thông minh
- **Tự động tạo mã QR** cho mỗi tổ ong
- **Thông tin động**: 
  - Tổ chưa bán: Hiển thị thông tin chi tiết tổ ong
  - Tổ đã bán: Hiển thị thông tin trại ong KBee (địa chỉ, SĐT, ngày bán)
- **Quét mã QR** để xem thông tin nhanh chóng

### 📄 Xuất PDF
- **Mã QR 3x3cm** theo yêu cầu
- **Bố cục đẹp mắt** với thông tin tổ ong
- **Tải xuống hàng loạt** tất cả mã QR

### 🔐 Bảo mật
- **Hệ thống đăng nhập** an toàn
- **Phân quyền người dùng**
- **Mã hóa mật khẩu**

### 🎨 Giao diện
- **Thiết kế thân thiện** với màu sắc mật ong
- **Responsive** trên mọi thiết bị (mobile, tablet, desktop)
- **Touch-friendly** cho thiết bị di động
- **Logo integration** với bee.png và apiary.png

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Python 3.9+
- MySQL 8.0+
- Docker & Docker Compose (tùy chọn)

### Cách 1: Chạy với Docker (Khuyến nghị)

1. **Clone repository**
```bash
git clone https://github.com/hoangso7/khainguyenbee.git
cd khainguyenbee
```

2. **Chạy với Docker Compose**
```bash
docker-compose up -d
```

3. **Truy cập ứng dụng**
- Web: http://localhost:5000
- MySQL: localhost:3306
- Tài khoản mặc định: admin / admin123

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
docker-compose down

# Với Docker (bao gồm volumes)
docker-compose down -v
```

## 🔧 Cấu hình

### Biến môi trường
```env
SECRET_KEY=your-secret-key-change-this-in-production
DATABASE_URL=mysql+pymysql://user:password@localhost/kbee_manager
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=kbee_manager
FLASK_ENV=development
FLASK_DEBUG=True
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
- **web**: Ứng dụng Flask (port 5000)
- **mysql**: Database MySQL (port 3306)
- **nginx**: Reverse proxy (port 80/443)

### Volumes
- `mysql_data`: Dữ liệu MySQL persistent
- Static files được mount từ host

### Networks
- `kbee_network`: Network riêng cho các services

## 📊 Monitoring

### Health Checks
- Application: `GET /health`
- Database: MySQL ping
- Container: Docker health checks

### Logs
```bash
# Xem logs
docker-compose logs -f web
docker-compose logs -f mysql

# Logs real-time
docker-compose logs -f
```

## 🚀 Deployment

### Production
1. **Cập nhật SECRET_KEY**
2. **Cấu hình SSL** (uncomment nginx SSL config)
3. **Backup database** thường xuyên
4. **Monitor logs** và performance

### Backup
```bash
# Backup database
docker exec kbee_mysql mysqldump -u kbee_user -p kbee_manager > backup.sql

# Restore database
docker exec -i kbee_mysql mysql -u kbee_user -p kbee_manager < backup.sql
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 📞 Hỗ trợ

- **Email**: support@kbee.com
- **Issues**: GitHub Issues
- **Documentation**: Wiki

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API documentation (Swagger)
- [ ] Automated testing
- [ ] CI/CD pipeline

---

**KBee Manager** - Quản lý tổ ong thông minh với công nghệ hiện đại! 🐝✨
