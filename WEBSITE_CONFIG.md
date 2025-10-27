# Cấu hình thông tin Website

## 📋 Tổng quan

KBee Manager hỗ trợ cấu hình động thông tin website thông qua environment variables. Bạn có thể thay đổi domain, tên ứng dụng, phiên bản và tên công ty mà không cần sửa code.

## 🔧 Cách cấu hình

### 1. Chỉnh sửa file `.env`

Mở file `.env` và cập nhật các giá trị sau:

```bash
# Frontend Configuration
REACT_APP_DOMAIN=khainguyenbee.io.vn
REACT_APP_NAME=Quản lý tổ ong
REACT_APP_VERSION=2.0.0
REACT_APP_COMPANY_NAME=KhaiNguyenBee
```

### 2. Rebuild frontend

Sau khi cập nhật `.env`, rebuild frontend để áp dụng thay đổi:

```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 📍 Nơi hiển thị thông tin

Thông tin website sẽ được hiển thị tại:

### 1. **Trang About** (`/about`)
- Tên phần mềm
- Phiên bản
- Domain
- Tên công ty

### 2. **User Menu** (Click vào logo user)
- Thông tin ứng dụng
- Phiên bản với chip màu
- Domain và tên công ty

## 🔄 Ví dụ cấu hình

### Cấu hình cho công ty khác:

```bash
# File .env
REACT_APP_DOMAIN=mycompany.com
REACT_APP_NAME=Hệ thống quản lý ong
REACT_APP_VERSION=1.5.0
REACT_APP_COMPANY_NAME=MyCompany Ltd
```

### Cấu hình cho môi trường test:

```bash
# File .env
REACT_APP_DOMAIN=test.khainguyenbee.io.vn
REACT_APP_NAME=KBee Manager (Test)
REACT_APP_VERSION=2.0.0-beta
REACT_APP_COMPANY_NAME=KhaiNguyenBee Test
```

## ⚡ Script tự động

Sử dụng script `test_env.sh` để kiểm tra cấu hình:

```bash
./test_env.sh
```

## 🚨 Lưu ý quan trọng

1. **File `.env` không được commit vào Git** (đã có trong `.gitignore`)
2. **Luôn rebuild frontend** sau khi thay đổi environment variables
3. **Backup file `.env`** trước khi thay đổi
4. **Test trên môi trường staging** trước khi deploy production

## 🔍 Troubleshooting

### Frontend không cập nhật thông tin mới:
```bash
# Xóa cache và rebuild
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Environment variables không được load:
```bash
# Kiểm tra file .env
cat .env | grep REACT_APP

# Kiểm tra trong container
docker exec kbee_frontend env | grep REACT_APP
```
