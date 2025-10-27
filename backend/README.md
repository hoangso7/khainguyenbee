# KBee Manager Backend - Refactored Architecture

## 📁 Cấu Trúc Thư Mục

```
backend/
├── __init__.py                 # Backend package initialization
├── config.py                  # Configuration management
├── models/                    # Database models
│   ├── __init__.py
│   ├── user.py               # User model
│   └── beehive.py            # Beehive model
├── routes/                    # API routes
│   ├── __init__.py
│   ├── auth.py               # Authentication routes
│   └── beehives.py           # Beehive management routes
└── utils/                     # Utility functions
    ├── __init__.py
    ├── errors.py             # Error handling
    ├── validators.py         # Input validation
    └── qr_generator.py       # QR code generation
```

## 🔧 Cải Thiện Chính

### 1. **Code Splitting**
- ✅ Tách `app.py` (823 lines) thành các modules riêng biệt
- ✅ Models tách riêng: `User`, `Beehive`
- ✅ Routes tách riêng: `auth`, `beehives`
- ✅ Utils tách riêng: `errors`, `validators`, `qr_generator`

### 2. **Error Handling**
- ✅ Custom exception classes: `KBeeError`, `ValidationError`, `AuthenticationError`, etc.
- ✅ Centralized error handlers với proper HTTP status codes
- ✅ Decorators cho error handling: `@handle_database_error`, `@handle_validation_error`
- ✅ Structured error responses với error types

### 3. **Input Validation**
- ✅ Comprehensive validation classes: `Validator`, `UserValidator`, `BeehiveValidator`
- ✅ Field-specific validation: email, password, date, choice, etc.
- ✅ Query parameter validation: pagination, sorting
- ✅ Detailed error messages với field names

### 4. **Security Improvements**
- ✅ Environment-based CORS configuration
- ✅ Rate limiting với Flask-Limiter
- ✅ JWT token management với Flask-JWT-Extended
- ✅ Input sanitization và validation
- ✅ Secure session configuration

### 5. **Configuration Management**
- ✅ Environment-based configuration classes
- ✅ Separate configs cho development, production, testing
- ✅ Centralized CORS origins management
- ✅ Security settings per environment

## 🚀 Sử Dụng

### Development
```bash
export FLASK_ENV=development
python app.py
```

### Production
```bash
export FLASK_ENV=production
gunicorn app:app
```

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /logout` - User logout
- `PUT /profile` - Update profile
- `GET /setup/check` - Check setup status
- `POST /setup` - Create admin user

### Beehives (`/api`)
- `GET /beehives` - Get active beehives (paginated)
- `GET /sold-beehives` - Get sold beehives (paginated)
- `GET /stats` - Get statistics
- `POST /beehives` - Create beehive
- `GET /beehives/<id>` - Get beehive details
- `PUT /beehives/<id>` - Update beehive
- `DELETE /beehives/<id>` - Delete beehive
- `POST /beehives/<id>/sell` - Mark as sold
- `POST /beehives/<id>/unsell` - Mark as not sold
- `GET /beehive/<token>` - Get by QR token (public)
- `GET /qr/<id>` - Generate QR code
- `GET /export_pdf/<id>` - Export PDF

## 🔒 Security Features

1. **Authentication**: JWT tokens với 30-day expiry
2. **Authorization**: User-specific data access
3. **Input Validation**: Comprehensive validation cho tất cả inputs
4. **Rate Limiting**: Configurable rate limits
5. **CORS**: Environment-based CORS configuration
6. **Error Handling**: Secure error messages không expose internal details

## 🧪 Testing

```bash
# Run tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_auth.py
```

## 📊 Monitoring

- Structured logging với different levels
- Error tracking với detailed context
- Performance monitoring ready
- Health check endpoint

## 🔄 Migration từ Old App

1. **Backup**: `app.py` được backup thành `app_backup.py`
2. **Compatibility**: Tất cả API endpoints giữ nguyên
3. **Database**: Không cần migration, models tương thích
4. **Configuration**: Sử dụng environment variables như cũ

## 🎯 Benefits

- **Maintainability**: Code dễ đọc và maintain
- **Scalability**: Dễ dàng thêm features mới
- **Security**: Improved security với proper validation
- **Testing**: Dễ dàng unit test từng module
- **Documentation**: Clear separation of concerns
