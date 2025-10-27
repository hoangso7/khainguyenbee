#!/usr/bin/env python3
"""
Test script to verify refactored KBee Manager backend
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_app_import():
    """Test if the refactored app can be imported"""
    try:
        from app import create_app
        print("✅ App import successful")
        return True
    except Exception as e:
        print(f"❌ App import failed: {e}")
        return False

def test_config_loading():
    """Test configuration loading"""
    try:
        from backend.config import config, DevelopmentConfig, ProductionConfig
        print("✅ Configuration loading successful")
        
        # Test development config
        dev_config = config['development']
        print(f"✅ Development config: {dev_config.FLASK_ENV}")
        
        # Test CORS origins
        print(f"✅ CORS origins: {dev_config.CORS_ORIGINS}")
        return True
    except Exception as e:
        print(f"❌ Configuration loading failed: {e}")
        return False

def test_models_import():
    """Test models import"""
    try:
        from backend.models import User, Beehive, db
        print("✅ Models import successful")
        
        # Test model methods
        serial_number = Beehive.generate_serial_number()
        qr_token = Beehive.generate_qr_token()
        print(f"✅ Beehive methods: serial={serial_number}, token={qr_token[:8]}...")
        return True
    except Exception as e:
        print(f"❌ Models import failed: {e}")
        return False

def test_validators():
    """Test validation system"""
    try:
        from backend.utils.validators import UserValidator, BeehiveValidator, Validator
        print("✅ Validators import successful")
        
        # Test user validation
        test_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        try:
            validated = UserValidator.validate_registration_data(test_data)
            print(f"✅ User validation: {validated['username']}")
        except Exception as e:
            print(f"❌ User validation failed: {e}")
            return False
        
        # Test beehive validation
        beehive_data = {
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': 'Test beehive'
        }
        
        try:
            validated = BeehiveValidator.validate_beehive_data(beehive_data)
            print(f"✅ Beehive validation: {validated['health_status']}")
        except Exception as e:
            print(f"❌ Beehive validation failed: {e}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Validators import failed: {e}")
        return False

def test_error_handling():
    """Test error handling system"""
    try:
        from backend.utils.errors import (
            KBeeError, ValidationError, AuthenticationError, 
            NotFoundError, DatabaseError, register_error_handlers
        )
        print("✅ Error handling import successful")
        
        # Test custom exceptions
        try:
            raise ValidationError("Test validation error", field="test_field")
        except ValidationError as e:
            print(f"✅ ValidationError: {e.message}, field: {e.field}")
        
        try:
            raise AuthenticationError("Test auth error")
        except AuthenticationError as e:
            print(f"✅ AuthenticationError: {e.message}")
        
        return True
    except Exception as e:
        print(f"❌ Error handling import failed: {e}")
        return False

def test_qr_generator():
    """Test QR code generator"""
    try:
        from backend.utils.qr_generator import QRCodeGenerator
        print("✅ QR generator import successful")
        
        # Test QR URL generation
        qr_url = QRCodeGenerator.generate_qr_url("testtoken123")
        print(f"✅ QR URL: {qr_url}")
        
        return True
    except Exception as e:
        print(f"❌ QR generator import failed: {e}")
        return False

def test_routes_import():
    """Test routes import"""
    try:
        from backend.routes import auth_bp, beehives_bp
        print("✅ Routes import successful")
        
        # Test blueprint names
        print(f"✅ Auth blueprint: {auth_bp.name}")
        print(f"✅ Beehives blueprint: {beehives_bp.name}")
        
        return True
    except Exception as e:
        print(f"❌ Routes import failed: {e}")
        return False

def test_app_creation():
    """Test app creation"""
    try:
        from app import create_app
        
        # Test development app creation
        app = create_app('development')
        print("✅ Development app creation successful")
        
        # Test production app creation
        app = create_app('production')
        print("✅ Production app creation successful")
        
        # Test default app creation
        app = create_app()
        print("✅ Default app creation successful")
        
        return True
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 KBee Manager Backend Refactoring Test")
    print("=" * 50)
    
    tests = [
        ("App Import", test_app_import),
        ("Configuration Loading", test_config_loading),
        ("Models Import", test_models_import),
        ("Validators", test_validators),
        ("Error Handling", test_error_handling),
        ("QR Generator", test_qr_generator),
        ("Routes Import", test_routes_import),
        ("App Creation", test_app_creation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed! Refactoring successful!")
        return True
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
