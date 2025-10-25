import unittest
import os
import tempfile
import json
from datetime import datetime, date
from unittest.mock import patch, MagicMock
import io

# Set test environment
os.environ['TESTING'] = 'True'
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['DOMAIN'] = 'test.example.com'

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, User, Beehive, get_beehive_qr_data, generate_qr_code

class TestAuthentication(unittest.TestCase):
    """Test authentication functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='testadmin', email='testadmin@test.com')
            admin.set_password('testpass123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_login_success(self):
        """Test successful login"""
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Trang chủ', response.data.decode('utf-8'))
    
    def test_login_invalid_username(self):
        """Test login with invalid username"""
        response = self.client.post('/login', data={
            'username': 'invalid',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_login_sql_injection(self):
        """Test SQL injection in login"""
        response = self.client.post('/login', data={
            'username': "admin'; DROP TABLE user; --",
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
        
        # Verify table still exists
        with self.app.app_context():
            users = User.query.all()
            self.assertGreater(len(users), 0)
    
    def test_register_success(self):
        """Test successful registration"""
        response = self.client.post('/register', data={
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'newpassword123'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Đăng ký thành công', response.data.decode('utf-8'))
    
    def test_logout(self):
        """Test logout functionality"""
        # Login first
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        # Logout
        response = self.client.get('/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn('Đăng nhập', response.data.decode('utf-8'))

class TestBeehiveManagement(unittest.TestCase):
    """Test beehive management functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='testadmin', email='testadmin@test.com')
            admin.set_password('testpass123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        }, follow_redirects=True)
    
    def test_add_beehive_success(self):
        """Test successful beehive creation"""
        self.login()
        
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST001',
            'import_date': '2024-01-01',
            'split_date': '',
            'health_status': 'Tốt',
            'notes': 'Test beehive'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Thêm tổ ong thành công', response.data.decode('utf-8'))
    
    def test_add_beehive_duplicate_serial(self):
        """Test adding beehive with duplicate serial number"""
        self.login()
        
        # Add first beehive
        self.client.post('/add_beehive', data={
            'serial_number': 'TEST001',
            'import_date': '2024-01-01',
            'health_status': 'Tốt'
        })
        
        # Try to add second beehive with same serial
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST001',
            'import_date': '2024-01-02',
            'health_status': 'Tốt'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Số thứ tự tổ ong đã tồn tại', response.data.decode('utf-8'))
    
    def test_add_beehive_xss_attack(self):
        """Test XSS protection in beehive creation"""
        self.login()
        
        xss_payload = '<script>alert("XSS")</script>'
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST003',
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': xss_payload
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        # XSS payload should be escaped in response
        self.assertNotIn('<script>', response.data.decode('utf-8'))
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected routes"""
        # Try to access dashboard without login
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 302)  # Redirect to login

class TestQRCodeFunctionality(unittest.TestCase):
    """Test QR code functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='testadmin', email='testadmin@test.com')
            admin.set_password('testpass123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        }, follow_redirects=True)
    
    def test_qr_code_generation(self):
        """Test QR code generation"""
        self.login()
        
        # Create test beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST008',
                import_date=date.today(),
                health_status='Tốt'
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/qr_code/{beehive_id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'image/png')
    
    def test_qr_code_nonexistent_beehive(self):
        """Test QR code for non-existent beehive"""
        self.login()
        
        response = self.client.get('/qr_code/99999')
        self.assertEqual(response.status_code, 404)
    
    def test_qr_data_for_unsold_beehive(self):
        """Test QR data for unsold beehive"""
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST009',
                import_date=date.today(),
                health_status='Tốt',
                notes='Test notes'
            )
            db.session.add(beehive)
            db.session.commit()
            
            qr_data = get_beehive_qr_data(beehive)
            self.assertIn('Tổ ong KBee', qr_data)
            self.assertIn('TEST009', qr_data)
            self.assertIn('Tốt', qr_data)
    
    def test_qr_data_for_sold_beehive(self):
        """Test QR data for sold beehive"""
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST010',
                import_date=date.today(),
                health_status='Tốt',
                is_sold=True,
                sold_date=date.today()
            )
            db.session.add(beehive)
            db.session.commit()
            
            qr_data = get_beehive_qr_data(beehive)
            self.assertIn('https://test.example.com/kbee-info/', qr_data)

class TestErrorHandling(unittest.TestCase):
    """Test error handling and edge cases"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='testadmin', email='testadmin@test.com')
            admin.set_password('testpass123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_404_page(self):
        """Test custom 404 page"""
        response = self.client.get('/nonexistent-page')
        self.assertEqual(response.status_code, 404)
        self.assertIn('Trang không tìm thấy', response.data.decode('utf-8'))
    
    def test_favicon(self):
        """Test favicon endpoint"""
        response = self.client.get('/favicon.ico')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'image/png')

class TestSecurity(unittest.TestCase):
    """Test security vulnerabilities"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='testadmin', email='testadmin@test.com')
            admin.set_password('testpass123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        # Test in beehive serial number
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        response = self.client.post('/add_beehive', data={
            'serial_number': "'; DROP TABLE beehive; --",
            'import_date': '2024-01-01',
            'health_status': 'Tốt'
        })
        
        # Should not cause database error
        self.assertEqual(response.status_code, 200)
        
        # Verify table still exists
        with self.app.app_context():
            beehives = Beehive.query.all()
            self.assertIsNotNone(beehives)
    
    def test_xss_protection(self):
        """Test XSS protection"""
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        xss_payload = '<script>alert("XSS")</script>'
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST_XSS',
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': xss_payload
        }, follow_redirects=True)
        
        # XSS payload should be escaped
        self.assertNotIn('<script>', response.data.decode('utf-8'))
        self.assertIn('&lt;script&gt;', response.data.decode('utf-8'))

if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestAuthentication,
        TestBeehiveManagement,
        TestQRCodeFunctionality,
        TestErrorHandling,
        TestSecurity
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"TEST SUMMARY")
    print(f"{'='*50}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    print(f"\n{'='*50}")
    
    # Exit with appropriate code
    exit(0 if result.wasSuccessful() else 1)
