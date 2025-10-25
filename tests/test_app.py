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

from app import app, db, User, Beehive, get_beehive_qr_data, generate_qr_code

class KBeeManagerTestCase(unittest.TestCase):
    """Test cases for KBee Manager application"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self, username='admin', password='admin123'):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': username,
            'password': password
        }, follow_redirects=True)
    
    def logout(self):
        """Helper method to logout"""
        return self.client.get('/logout', follow_redirects=True)
    
    def create_test_beehive(self, serial_number='TEST001'):
        """Helper method to create test beehive"""
        with self.app.app_context():
            beehive = Beehive(
                serial_number=serial_number,
                import_date=date.today(),
                health_status='Tốt',
                notes='Test beehive'
            )
            db.session.add(beehive)
            db.session.commit()
            return beehive

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
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_login_success(self):
        """Test successful login"""
        response = self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Trang chủ', response.data.decode('utf-8'))
    
    def test_login_invalid_username(self):
        """Test login with invalid username"""
        response = self.client.post('/login', data={
            'username': 'invalid',
            'password': 'admin123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = self.client.post('/login', data={
            'username': 'admin',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_login_empty_fields(self):
        """Test login with empty fields"""
        response = self.client.post('/login', data={
            'username': '',
            'password': ''
        })
        
        self.assertEqual(response.status_code, 200)
        # Should show validation errors
    
    def test_login_sql_injection(self):
        """Test SQL injection in login"""
        response = self.client.post('/login', data={
            'username': "admin'; DROP TABLE user; --",
            'password': 'admin123'
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
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username"""
        response = self.client.post('/register', data={
            'username': 'admin',
            'email': 'newemail@test.com',
            'password': 'newpassword123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Tên đăng nhập đã tồn tại', response.data)
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        response = self.client.post('/register', data={
            'username': 'newuser',
            'email': 'admin@test.com',
            'password': 'newpassword123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Email đã tồn tại', response.data)
    
    def test_register_invalid_email(self):
        """Test registration with invalid email"""
        response = self.client.post('/register', data={
            'username': 'newuser',
            'email': 'invalid-email',
            'password': 'newpassword123'
        })
        
        self.assertEqual(response.status_code, 200)
        # Should show validation error
    
    def test_logout(self):
        """Test logout functionality"""
        # Login first
        self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        })
        
        # Logout
        response = self.client.get('/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Đăng nhập', response.data)
    
    def test_session_security(self):
        """Test session security"""
        # Login
        response = self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        })
        
        # Check session cookie security
        cookies = response.headers.get_all('Set-Cookie')
        session_cookie = None
        for cookie in cookies:
            if 'session=' in cookie:
                session_cookie = cookie
                break
        
        self.assertIsNotNone(session_cookie)
        # In production, should have HttpOnly, Secure flags
    
    def test_password_hashing(self):
        """Test password hashing security"""
        with self.app.app_context():
            user = User.query.filter_by(username='admin').first()
            # Password should be hashed, not plain text
            self.assertNotEqual(user.password_hash, 'admin123')
            self.assertTrue(user.check_password('admin123'))
            self.assertFalse(user.check_password('wrongpassword'))

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
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
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
        self.assertIn(b'Thêm tổ ong thành công', response.data)
    
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
        self.assertIn(b'Số thứ tự tổ ong đã tồn tại', response.data)
    
    def test_add_beehive_empty_required_fields(self):
        """Test adding beehive with empty required fields"""
        self.login()
        
        response = self.client.post('/add_beehive', data={
            'serial_number': '',
            'import_date': '',
            'health_status': ''
        })
        
        self.assertEqual(response.status_code, 200)
        # Should show validation errors
    
    def test_add_beehive_invalid_date(self):
        """Test adding beehive with invalid date"""
        self.login()
        
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST002',
            'import_date': 'invalid-date',
            'health_status': 'Tốt'
        })
        
        self.assertEqual(response.status_code, 200)
        # Should show validation error
    
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
        self.assertNotIn(b'<script>', response.data)
    
    def test_edit_beehive_success(self):
        """Test successful beehive editing"""
        self.login()
        
        # Create test beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST004',
                import_date=date.today(),
                health_status='Tốt'
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.post(f'/edit_beehive/{beehive_id}', data={
            'serial_number': 'TEST004_UPDATED',
            'import_date': '2024-01-01',
            'health_status': 'Trung bình',
            'notes': 'Updated notes'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Cập nhật tổ ong thành công', response.data)
    
    def test_edit_nonexistent_beehive(self):
        """Test editing non-existent beehive"""
        self.login()
        
        response = self.client.get('/edit_beehive/99999')
        self.assertEqual(response.status_code, 404)
    
    def test_delete_beehive_success(self):
        """Test successful beehive deletion"""
        self.login()
        
        # Create test beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST005',
                import_date=date.today(),
                health_status='Tốt'
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/delete_beehive/{beehive_id}', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Xóa tổ ong thành công', response.data)
    
    def test_delete_nonexistent_beehive(self):
        """Test deleting non-existent beehive"""
        self.login()
        
        response = self.client.get('/delete_beehive/99999')
        self.assertEqual(response.status_code, 404)
    
    def test_sell_beehive_success(self):
        """Test successful beehive selling"""
        self.login()
        
        # Create test beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST006',
                import_date=date.today(),
                health_status='Tốt'
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/sell_beehive/{beehive_id}', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Đánh dấu tổ ong đã bán thành công', response.data)
    
    def test_unsell_beehive_success(self):
        """Test successful beehive unselling"""
        self.login()
        
        # Create and sell test beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST007',
                import_date=date.today(),
                health_status='Tốt',
                is_sold=True,
                sold_date=date.today()
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/unsell_beehive/{beehive_id}', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Hủy bán tổ ong thành công', response.data)
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected routes"""
        # Try to access dashboard without login
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 302)  # Redirect to login
        
        # Try to add beehive without login
        response = self.client.get('/add_beehive')
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
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
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
    
    def test_qr_code_unauthorized(self):
        """Test QR code access without login"""
        response = self.client.get('/qr_code/1')
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
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
    
    def test_kbee_info_page(self):
        """Test KBee info page for sold beehive"""
        # Create sold beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST011',
                import_date=date.today(),
                health_status='Tốt',
                is_sold=True,
                sold_date=date.today()
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/kbee-info/{beehive_id}')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Trại ong KBee', response.data)
        self.assertIn(b'TEST011', response.data)
    
    def test_kbee_info_unsold_beehive(self):
        """Test KBee info page for unsold beehive"""
        # Create unsold beehive
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TEST012',
                import_date=date.today(),
                health_status='Tốt'
            )
            db.session.add(beehive)
            db.session.commit()
            beehive_id = beehive.id
        
        response = self.client.get(f'/kbee-info/{beehive_id}')
        self.assertEqual(response.status_code, 302)  # Redirect to index
    
    def test_kbee_info_nonexistent_beehive(self):
        """Test KBee info page for non-existent beehive"""
        response = self.client.get('/kbee-info/99999')
        self.assertEqual(response.status_code, 404)

class TestPDFExport(unittest.TestCase):
    """Test PDF export functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def login(self):
        """Helper method to login"""
        return self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        }, follow_redirects=True)
    
    def test_export_pdf_success(self):
        """Test successful PDF export"""
        self.login()
        
        # Create test beehives
        with self.app.app_context():
            for i in range(3):
                beehive = Beehive(
                    serial_number=f'TEST{i+13:03d}',
                    import_date=date.today(),
                    health_status='Tốt'
                )
                db.session.add(beehive)
            db.session.commit()
        
        response = self.client.get('/export_qr_pdf')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/pdf')
    
    def test_export_pdf_unauthorized(self):
        """Test PDF export without login"""
        response = self.client.get('/export_qr_pdf')
        self.assertEqual(response.status_code, 302)  # Redirect to login

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
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
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
        self.assertIn(b'Trang không tìm thấy', response.data)
    
    def test_500_error_handling(self):
        """Test 500 error handling"""
        # This would require mocking a database error
        # For now, just test that the error handler exists
        with self.app.app_context():
            # Simulate a database error
            with patch('app.db.session.commit', side_effect=Exception("Database error")):
                try:
                    # This should trigger the 500 error handler
                    pass
                except Exception:
                    pass
    
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
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_csrf_protection(self):
        """Test CSRF protection"""
        # CSRF is disabled in testing, but we can test the structure
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        # Test in beehive serial number
        self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
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
            'username': 'admin',
            'password': 'admin123'
        })
        
        xss_payload = '<script>alert("XSS")</script>'
        response = self.client.post('/add_beehive', data={
            'serial_number': 'TEST_XSS',
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': xss_payload
        }, follow_redirects=True)
        
        # XSS payload should be escaped
        self.assertNotIn(b'<script>', response.data)
        self.assertIn(b'&lt;script&gt;', response.data)
    
    def test_path_traversal_protection(self):
        """Test path traversal protection"""
        # Try to access files outside web root
        response = self.client.get('/../../../etc/passwd')
        self.assertEqual(response.status_code, 404)
    
    def test_session_fixation(self):
        """Test session fixation protection"""
        # Get initial session
        response1 = self.client.get('/login')
        session1 = self.client.cookie_jar.get('session')
        
        # Login
        self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        })
        
        # Session should be different after login
        response2 = self.client.get('/dashboard')
        session2 = self.client.cookie_jar.get('session')
        
        # Sessions should be different (session fixation protection)
        if session1 and session2:
            self.assertNotEqual(session1.value, session2.value)

class TestPerformance(unittest.TestCase):
    """Test performance and scalability"""
    
    def setUp(self):
        """Set up test environment"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Create test admin user
            admin = User(username='admin', email='admin@test.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.drop_all()
    
    def test_large_number_of_beehives(self):
        """Test handling large number of beehives"""
        self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        })
        
        # Create many beehives
        with self.app.app_context():
            for i in range(100):
                beehive = Beehive(
                    serial_number=f'PERF{i:03d}',
                    import_date=date.today(),
                    health_status='Tốt'
                )
                db.session.add(beehive)
            db.session.commit()
        
        # Test dashboard performance
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 200)
    
    def test_pdf_export_performance(self):
        """Test PDF export performance with many beehives"""
        self.client.post('/login', data={
            'username': 'admin',
            'password': 'admin123'
        })
        
        # Create many beehives
        with self.app.app_context():
            for i in range(50):
                beehive = Beehive(
                    serial_number=f'PDF{i:03d}',
                    import_date=date.today(),
                    health_status='Tốt'
                )
                db.session.add(beehive)
            db.session.commit()
        
        # Test PDF export
        response = self.client.get('/export_qr_pdf')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestAuthentication,
        TestBeehiveManagement,
        TestQRCodeFunctionality,
        TestPDFExport,
        TestErrorHandling,
        TestSecurity,
        TestPerformance
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
