# 🧪 KBee Manager Comprehensive Test Suite

Bộ test case toàn diện cho hệ thống KBee Manager, bao gồm Frontend, Backend, API, Network, SSL và các User Flows.

## 📋 Tổng quan

Test suite này được thiết kế để kiểm tra toàn bộ chức năng của hệ thống KBee Manager, đảm bảo không có lỗi nào bị bỏ sót.

### 🎯 Các loại test được bao phủ:

- **🔒 SSL & Network Tests**: Kiểm tra SSL certificates, network connectivity, security headers
- **🔐 Authentication Tests**: Login, logout, token validation, setup flow
- **🐝 Beehive Management Tests**: CRUD operations, health status, sales workflow
- **📱 QR Code Tests**: QR generation, scanning, token validation
- **📊 Statistics Tests**: Dashboard stats, reporting
- **🎭 User Flow Tests**: End-to-end user journeys
- **⚡ Performance Tests**: Response times, concurrent requests
- **🛡️ Error Handling Tests**: Edge cases, error recovery

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
# Cài đặt Python dependencies
make install-deps

# Hoặc cài đặt thủ công
pip3 install requests urllib3
```

### 2. Kiểm tra môi trường

```bash
# Kiểm tra environment và services
make check-env

# Test nhanh connectivity
make quick-test
```

### 3. Chạy test suites

```bash
# Chạy tất cả test suites
make all

# Chạy từng loại test riêng biệt
make comprehensive    # API và system tests
make user-flows       # User journey tests  
make ssl-network      # SSL và network tests

# Chạy với output chi tiết
make test-verbose
```

### 4. Test cụ thể

```bash
# Test authentication flow
make test-auth

# Test API endpoints
make test-api

# Test performance
make test-performance
```

## 📁 Cấu trúc Test Suite

```
tests/
├── comprehensive_test_suite.py    # Test suite chính (25 tests)
├── user_flow_tests.py            # User flow tests (6 workflows)
├── ssl_network_tests.py          # SSL & network tests (10 tests)
├── run_all_tests.py              # Master test runner
├── run_comprehensive_tests.py    # Comprehensive test runner
├── Makefile                      # Make commands
└── README.md                     # Documentation này
```

## 🧪 Chi tiết Test Cases

### 1. Comprehensive Test Suite (25 tests)

#### Network & Connectivity (4 tests)
- ✅ SSL Certificate Validity
- ✅ HTTPS Connectivity  
- ✅ Backend Connectivity
- ✅ CORS Headers

#### Authentication Flow (5 tests)
- ✅ Setup Check
- ✅ Admin Setup
- ✅ User Login
- ✅ Token Validation
- ✅ User Logout

#### Beehive CRUD (7 tests)
- ✅ Create Beehive
- ✅ Get Beehives List
- ✅ Get Beehive Details
- ✅ Update Beehive
- ✅ Sell Beehive
- ✅ Get Sold Beehives
- ✅ Unsell Beehive

#### QR Code Functionality (2 tests)
- ✅ QR Code Generation
- ✅ QR Code Scanning

#### Statistics & Reports (1 test)
- ✅ Dashboard Statistics

#### Error Handling (3 tests)
- ✅ Invalid Credentials
- ✅ Unauthorized Access
- ✅ Invalid Beehive ID

#### Performance & Load (2 tests)
- ✅ Response Times
- ✅ Concurrent Requests

#### Cleanup (1 test)
- ✅ Delete Test Beehive

### 2. User Flow Tests (6 workflows)

#### Complete User Journey
- 🚀 **Setup Journey**: Setup check → Admin creation → Login
- 🐝 **Daily Management**: Stats → Create beehives → View list → Update health
- 💰 **Sales Workflow**: Check status → Sell → Verify sold list → QR test → Unsell
- 📱 **QR Workflow**: Get QR token → Scan QR → Test health statuses
- 🛡️ **Error Recovery**: Invalid operations → Unauthorized access → System recovery
- 🧹 **Cleanup**: Delete test data → Verify cleanup

### 3. SSL & Network Tests (10 tests)

#### SSL Configuration (4 tests)
- 🔒 SSL Certificate Presence
- 🔐 SSL Protocols and Ciphers
- 🌐 HTTPS Connectivity
- 🔄 HTTP to HTTPS Redirect

#### Network Connectivity (4 tests)
- ⚙️ Backend Connectivity
- 🔗 API Endpoints Connectivity
- ⏱️ Response Times
- 🔄 Concurrent Connections

#### Security Headers (2 tests)
- 🛡️ Security Headers
- 📊 SSL Grade Check

## 📊 Test Reports

Sau khi chạy tests, các báo cáo chi tiết sẽ được tạo:

- `master_test_report_YYYYMMDD_HHMMSS.json` - Báo cáo tổng hợp
- `test_report_YYYYMMDD_HHMMSS.json` - Báo cáo chi tiết từng suite

### Ví dụ báo cáo:

```json
{
  "timestamp": "20241025_143022",
  "test_suite": "KBee Manager Comprehensive Test Suite",
  "target_url": "https://khainguyenbee.io.vn:8443",
  "summary": {
    "total_test_suites": 3,
    "total_tests": 41,
    "total_passed": 40,
    "total_failed": 1,
    "total_errors": 0,
    "overall_success_rate": 97.6
  }
}
```

## 🎯 Target Environment

Tests được thiết kế để chạy trên:
- **Frontend**: `https://khainguyenbee.io.vn:8443`
- **Backend**: `http://khainguyenbee.io.vn:8000`
- **API Base**: `https://khainguyenbee.io.vn:8443/api`

## 🔧 Configuration

### Environment Variables

Tests sử dụng các biến môi trường sau:

```bash
# Test credentials
TEST_USERNAME=flow_test_admin
TEST_PASSWORD=flow_test_password_123
TEST_EMAIL=flowtest@khainguyenbee.io.vn

# Target URLs
FRONTEND_URL=https://khainguyenbee.io.vn:8443
BACKEND_URL=http://khainguyenbee.io.vn:8000
```

### SSL Configuration

Tests tắt SSL verification để test trong môi trường development:
```python
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
```

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **SSL Certificate Error**
   ```bash
   # Kiểm tra SSL certificate
   openssl s_client -connect khainguyenbee.io.vn:8443 -servername khainguyenbee.io.vn
   ```

2. **Connection Timeout**
   ```bash
   # Kiểm tra services
   docker-compose ps
   docker-compose logs frontend
   docker-compose logs backend
   ```

3. **CORS Errors**
   ```bash
   # Kiểm tra nginx config
   docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
   ```

4. **Authentication Failures**
   ```bash
   # Kiểm tra database
   docker-compose exec db mysql -u kbee_user -p kbee_manager
   ```

## 📈 Continuous Testing

### Watch Mode
```bash
# Chạy tests liên tục mỗi 30 giây
make watch
```

### Docker Testing
```bash
# Chạy tests trong Docker environment
make test-docker
```

## 🎉 Success Criteria

Hệ thống được coi là **READY FOR PRODUCTION** khi:

- ✅ **Overall Success Rate ≥ 95%**
- ✅ **SSL Tests**: 100% pass
- ✅ **Authentication Tests**: 100% pass  
- ✅ **Core API Tests**: 100% pass
- ✅ **User Flow Tests**: 100% pass
- ✅ **Response Times**: < 5 seconds
- ✅ **Concurrent Requests**: ≥ 80% success rate

## 📞 Support

Nếu gặp vấn đề với test suite:

1. Kiểm tra logs: `docker-compose logs`
2. Chạy quick test: `make quick-test`
3. Kiểm tra environment: `make check-env`
4. Xem báo cáo chi tiết trong file JSON

---

**🎯 Mục tiêu**: Đảm bảo KBee Manager hoạt động hoàn hảo trong mọi tình huống!