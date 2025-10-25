#!/bin/bash

# KBee Manager - Setup Script
# Script thống nhất để setup toàn bộ hệ thống
# Sử dụng: ./setup.sh [option]
# Options: ssl, app, all

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  KBee Manager Setup Script${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_warning "Đang chạy với quyền root - tiếp tục..."
    fi
}

# Check dependencies
check_dependencies() {
    print_info "Kiểm tra dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker chưa được cài đặt!"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose chưa được cài đặt!"
        exit 1
    fi
    
    print_success "Dependencies đã sẵn sàng"
}

# Setup SSL
setup_ssl() {
    print_info "🔐 Setup SSL Certificate..."
    
    # Kiểm tra thư mục certs
    if [ ! -d "certs" ]; then
        print_error "Thư mục certs không tồn tại!"
        exit 1
    fi
    
    echo "📋 Kiểm tra các file SSL:"
    ls -la certs/
    
    echo ""
    echo "🔍 Phân tích các file:"
    
    # Kiểm tra từng file
    for file in certs/*; do
        if [ -f "$file" ]; then
            echo "  - $(basename "$file"): $(file "$file" | cut -d: -f2)"
        fi
    done
    
    echo ""
    
    # Kiểm tra các file cần thiết
    REQUIRED_FILES=(
        "certs/www_khainguyenbee_io_vn_cert.pem"
        "certs/key_khainguyenbee.io.vn.key"
    )
    
    MISSING_FILES=()
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file"
        else
            print_error "$file - THIẾU!"
            MISSING_FILES+=("$file")
        fi
    done
    
    if [ ${#MISSING_FILES[@]} -gt 0 ]; then
        echo ""
        print_error "Thiếu các file cần thiết:"
        for file in "${MISSING_FILES[@]}"; do
            echo "   - $file"
        done
        echo ""
        print_info "Vui lòng đảm bảo các file này có trong thư mục certs/"
        exit 1
    fi
    
    echo ""
    print_success "Tất cả file SSL cần thiết đã có!"
    
    # Thiết lập quyền bảo mật
    print_info "🔒 Thiết lập quyền bảo mật..."
    chmod 600 certs/key_khainguyenbee.io.vn.key
    chmod 644 certs/www_khainguyenbee_io_vn_cert.pem
    chmod 644 certs/ChainCA.crt 2>/dev/null || true
    chmod 644 certs/RootCA.crt 2>/dev/null || true
    chmod 644 certs/Chain_RootCA_Bundle.crt 2>/dev/null || true
    
    print_success "Quyền file đã được thiết lập"
    
    # Kiểm tra cấu hình docker compose
    print_info "🔧 Kiểm tra cấu hình docker compose..."
    if grep -q "www_khainguyenbee_io_vn_cert.pem" docker-compose.yml; then
        print_success "docker-compose.yml đã được cấu hình đúng"
    else
        print_error "docker-compose.yml chưa được cấu hình đúng"
        exit 1
    fi
    
    # Kiểm tra cấu hình nginx
    print_info "🔧 Kiểm tra cấu hình nginx..."
    if grep -q "khainguyenbee.io.vn.crt" nginx.conf; then
        print_success "nginx.conf đã được cấu hình đúng"
    else
        print_error "nginx.conf chưa được cấu hình đúng"
        exit 1
    fi
    
    print_success "SSL setup hoàn tất!"
}

# Setup application
setup_app() {
    print_info "🚀 Setup Application..."
    
    # Tạo thư mục logs nếu chưa có
    mkdir -p logs/nginx
    
    # Kiểm tra file .env
    if [ ! -f ".env" ]; then
        print_warning "File .env không tồn tại, tạo từ .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Đã tạo .env từ .env.example"
        else
            print_error "File .env.example không tồn tại!"
            exit 1
        fi
    fi
    
    # Build và start containers
    print_info "🔨 Building và starting containers..."
    docker compose down
    docker compose up --build -d
    
    # Chờ services khởi động
    print_info "⏳ Chờ services khởi động..."
    sleep 15
    
    # Kiểm tra trạng thái
    print_info "📊 Kiểm tra trạng thái containers..."
    docker compose ps
    
    print_success "Application setup hoàn tất!"
}

# Test system
test_system() {
    print_info "🧪 Testing system..."
    
    # Kiểm tra logs nginx
    print_info "📋 Kiểm tra logs nginx..."
    if docker logs kbee_nginx 2>&1 | grep -q "started\|ready\|listening"; then
        print_success "Nginx đã khởi động thành công"
    else
        print_warning "Có thể có lỗi khi khởi động nginx. Kiểm tra logs:"
        docker logs kbee_nginx
    fi
    
    # Test HTTP redirect
    print_info "📡 Test HTTP redirect..."
    if curl -s -I http://localhost | grep -q "301\|302"; then
        print_success "HTTP redirect to HTTPS hoạt động"
    else
        print_warning "HTTP redirect có thể chưa hoạt động"
    fi
    
    # Test HTTPS
    print_info "📡 Test HTTPS..."
    if curl -s -k -I https://localhost | grep -q "200\|301\|302"; then
        print_success "HTTPS hoạt động"
    else
        print_warning "HTTPS có thể chưa hoạt động hoàn toàn"
    fi
    
    print_success "System test hoàn tất!"
}

# Show status
show_status() {
    print_info "📊 Trạng thái hệ thống:"
    echo ""
    echo "🔍 Containers:"
    docker compose ps
    echo ""
    echo "📋 SSL Files:"
    ls -la certs/ 2>/dev/null || echo "Thư mục certs không tồn tại"
    echo ""
    echo "📝 Logs nginx:"
    echo "   docker logs kbee_nginx"
    echo ""
    echo "🌐 URLs:"
    echo "   HTTP:  http://khainguyenbee.io.vn"
    echo "   HTTPS: https://khainguyenbee.io.vn"
    echo ""
}

# Main function
main() {
    print_header
    
    # Check root
    check_root
    
    # Check dependencies
    check_dependencies
    
    # Parse arguments
    case "${1:-all}" in
        "ssl")
            setup_ssl
            ;;
        "app")
            setup_app
            ;;
        "test")
            test_system
            ;;
        "status")
            show_status
            ;;
        "all")
            setup_ssl
            setup_app
            test_system
            show_status
            ;;
        *)
            echo "Usage: $0 [ssl|app|test|status|all]"
            echo ""
            echo "Options:"
            echo "  ssl     - Setup SSL certificate only"
            echo "  app     - Setup application only"
            echo "  test    - Test system"
            echo "  status  - Show system status"
            echo "  all     - Setup everything (default)"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Setup hoàn tất!"
    echo ""
    print_info "📋 Thông tin hệ thống:"
    echo "   - Domain: khainguyenbee.io.vn"
    echo "   - HTTP: http://khainguyenbee.io.vn (redirects to HTTPS)"
    echo "   - HTTPS: https://khainguyenbee.io.vn"
    echo "   - Logs: docker logs kbee_nginx"
    echo "   - Status: docker compose ps"
    echo ""
    print_info "⚠️  Lưu ý bảo mật:"
    echo "   - File private key đã được thiết lập quyền 600"
    echo "   - Thư mục certs/ đã được thêm vào .gitignore"
    echo "   - SSL certificates đã được mount vào container"
    echo ""
    print_success "🚀 Hệ thống đã sẵn sàng cho production!"
}

# Run main function
main "$@"