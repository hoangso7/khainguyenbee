# 🐝 KBee Manager - Hệ thống quản lý tổ ong thông minh

Ứng dụng web quản lý tổ ong với mã QR, xuất PDF và SSL tự động. Hệ thống được thiết kế đặc biệt cho việc quản lý trang trại ong với các tính năng theo dõi sức khỏe và chủng loại ong.

## ✨ Tính năng chính

### 🏠 Quản lý tổ ong
- **Thông tin chi tiết**: Số thứ tự, ngày nhập, ngày tách đàn, ngày bán
- **Theo dõi sức khỏe**: Tình trạng "Tốt" hoặc "Yếu" với biểu tượng trực quan
- **Chủng loại ong**: Hỗ trợ "Furva Vàng" và "Furva Đen"
- **Ghi chú**: Lưu trữ thông tin bổ sung cho mỗi tổ
- **Không giới hạn**: Thêm bao nhiêu tổ tùy ý

### 📊 Dashboard thống kê
- **Tổng quan**: Số tổ đang quản lý và đã bán
- **Biểu đồ sức khỏe**: Phân tích tỷ lệ tổ khỏe/yếu
- **Biểu đồ chủng loại**: Thống kê phân bố Furva Vàng/Đen
- **Bộ lọc thông minh**: Lọc theo sức khỏe và chủng loại
- **Tìm kiếm**: Tìm kiếm nhanh theo mã tổ

### 📱 Mã QR thông minh
- **Tự động tạo**: Mỗi tổ có mã QR riêng
- **Thông tin công khai**: Hiển thị thông tin tổ cho khách hàng
- **Tích hợp domain**: QR code tự động trỏ đến domain của bạn
- **Responsive**: Tối ưu cho mobile và desktop

### 📄 Xuất PDF
- **Mã QR 3x3cm**: Kích thước chuẩn cho in ấn
- **Tải xuống hàng loạt**: Xuất tất cả mã QR cùng lúc
- **Thông tin đầy đủ**: Bao gồm mã tổ, sức khỏe và chủng loại

### 🔒 Bảo mật & Hiệu suất
- **SSL tự động**: Let's Encrypt với auto-renewal
- **Session 30 ngày**: Đăng nhập một lần, sử dụng lâu dài
- **Mã hóa mật khẩu**: Werkzeug security
- **Mobile-friendly**: Responsive design hoàn toàn

## 🚀 Cài đặt nhanh

### Yêu cầu hệ thống
- Docker & Docker Compose
- Domain name (cho SSL)
- Server với ports 80, 443 mở
- RAM tối thiểu: 1GB
- Disk space: 2GB

### Cài đặt

1. **Clone repository**
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

3. **Deploy ứng dụng**
```bash
./setup.sh
```

4. **Truy cập hệ thống**
- **HTTPS**: https://your-domain.com (SSL tự động)
- **Tài khoản**: Tạo tài khoản admin đầu tiên khi truy cập

### Dừng ứng dụng
```bash
docker compose down
```

## 🔧 Quản lý hệ thống

### SSL Certificate
```bash
# Kiểm tra trạng thái SSL
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Gia hạn SSL thủ công
docker compose exec certbot certbot renew
```

### Logs & Monitoring
```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs specific service
docker compose logs -f web
docker compose logs -f nginx
docker compose logs -f mysql
```

### Backup & Restore
```bash
# Backup database
docker exec kbee_mysql mysqldump -u kbee_user -p kbee_manager > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i kbee_mysql mysql -u kbee_user -p kbee_manager < backup.sql
```

## 📖 Hướng dẫn sử dụng

### 1. Thiết lập ban đầu
- Truy cập hệ thống lần đầu
- Tạo tài khoản admin đầu tiên
- Cấu hình thông tin trang trại (tùy chọn)

### 2. Thêm tổ ong

#### Thêm từng tổ:
1. Click "Thêm tổ ong"
2. Điền thông tin:
   - **Số thứ tự**: Mã định danh tổ
   - **Ngày nhập**: Ngày đưa tổ vào hệ thống
   - **Tình trạng sức khỏe**: Tốt hoặc Yếu
   - **Chủng loại**: Furva Vàng hoặc Furva Đen
   - **Ghi chú**: Thông tin bổ sung
3. Click "Lưu tổ ong"

#### Thêm hàng loạt:
1. Click "Thêm nhiều tổ"
2. Nhập số lượng tổ cần thêm
3. Chọn tình trạng sức khỏe và chủng loại mặc định
4. Click "Tạo tổ ong"

### 3. Quản lý tổ ong

#### Dashboard:
- **Xem tổng quan**: Thống kê tổng số tổ và biểu đồ phân tích
- **Lọc dữ liệu**: Sử dụng bộ lọc để xem tổ theo sức khỏe/chủng loại
- **Tìm kiếm**: Nhập mã tổ để tìm nhanh

#### Thao tác với tổ:
- **Xem chi tiết**: Click vào mã tổ để xem thông tin đầy đủ
- **Chỉnh sửa**: Click biểu tượng edit để cập nhật thông tin
- **Đánh dấu bán**: Click nút "Bán" để chuyển trạng thái
- **Xóa**: Click biểu tượng trash (cẩn thận!)

### 4. Mã QR và xuất PDF
- **Xem QR**: Click vào mã QR để xem trang công khai
- **Xuất PDF**: Click "Xuất PDF QR" để tải file PDF với tất cả mã QR
- **In ấn**: Mã QR có kích thước 3x3cm, phù hợp cho in nhãn

### 5. Quản lý tài khoản
- **Profile**: Cập nhật thông tin cá nhân
- **Đăng xuất**: Click "Đăng xuất" để kết thúc phiên

## 🐳 Kiến trúc hệ thống

### Docker Services
- **web**: Ứng dụng Flask (port 5000)
- **mysql**: Database MySQL (port 3306)
- **nginx**: Reverse proxy với SSL (port 80/443)
- **certbot**: SSL certificates management
- **ssl-renew**: Auto-renewal SSL certificates

### Database Schema
```sql
-- Bảng tổ ong
beehives (
  id, serial_number, import_date, split_date, 
  sold_date, health_status, species, notes, 
  qr_token, is_sold, created_at, updated_at
)

-- Bảng người dùng
users (
  id, username, email, password_hash, 
  is_admin, created_at, updated_at
)

-- Bảng thông tin doanh nghiệp
business_info (
  id, farm_name, farm_address, farm_phone,
  qr_show_farm_info, qr_show_owner_contact,
  qr_custom_message, qr_footer_text
)
```

## 🔒 Bảo mật

### SSL/TLS
- **Let's Encrypt**: SSL certificates tự động
- **Auto-renewal**: Gia hạn tự động mỗi 3 tháng
- **HTTP redirect**: Tự động chuyển HTTP sang HTTPS
- **Security headers**: HSTS, CSP, X-Frame-Options

### Authentication
- **Session management**: 30 ngày timeout
- **Password hashing**: Werkzeug security
- **Admin protection**: Chỉ admin mới có quyền quản lý

### Data Protection
- **Input validation**: Kiểm tra dữ liệu đầu vào
- **SQL injection**: Sử dụng SQLAlchemy ORM
- **XSS protection**: Escape HTML output

## 🧪 Testing

### Chạy tests
```bash
# Tests toàn bộ hệ thống
cd tests
python run_all_tests.py

# Tests local development
python run_local_tests.py

# Tests production environment
./run_production_tests.sh
```

### Test Coverage
- **Unit tests**: Backend API endpoints
- **Integration tests**: Database operations
- **UI tests**: Frontend components
- **SSL tests**: Certificate validation

## 📞 Hỗ trợ & Đóng góp

### Báo lỗi
- **GitHub Issues**: [Tạo issue mới](https://github.com/hoangso7/khainguyenbee/issues)
- **Bug report**: Mô tả chi tiết lỗi và cách tái tạo
- **Feature request**: Đề xuất tính năng mới

### Đóng góp code
1. Fork repository
2. Tạo feature branch
3. Commit changes với message rõ ràng
4. Push và tạo Pull Request

### Liên hệ
- **Email**: support@kbee.com
- **Documentation**: [Wiki](https://github.com/hoangso7/khainguyenbee/wiki)

## 📄 License

Dự án này được phát hành dưới [MIT License](LICENSE).

---

**KBee Manager** - Quản lý tổ ong thông minh với công nghệ hiện đại! 🐝✨

*Phiên bản: 2.0 | Cập nhật: 2024*