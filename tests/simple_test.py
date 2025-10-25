#!/usr/bin/env python3
"""
Simple test script for KBee Manager
Tests basic functionality without complex dependencies
"""

import os
import sys
import unittest
from datetime import date

# Set test environment
os.environ['TESTING'] = 'True'
os.environ['SECRET_KEY'] = 'test-secret-key'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['DOMAIN'] = 'test.example.com'

# Import after setting environment
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, User, Beehive, get_beehive_qr_data

class SimpleKBeeTest(unittest.TestCase):
    """Simple tests for KBee Manager"""
    
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
    
    def test_app_creation(self):
        """Test that app is created successfully"""
        self.assertIsNotNone(self.app)
        self.assertTrue(self.app.config['TESTING'])
    
    def test_database_connection(self):
        """Test database connection"""
        with self.app.app_context():
            users = User.query.all()
            self.assertEqual(len(users), 1)
            self.assertEqual(users[0].username, 'testadmin')
    
    def test_user_authentication(self):
        """Test user authentication"""
        with self.app.app_context():
            user = User.query.filter_by(username='testadmin').first()
            self.assertIsNotNone(user)
            self.assertTrue(user.check_password('testpass123'))
            self.assertFalse(user.check_password('wrongpassword'))
    
    def test_beehive_creation(self):
        """Test beehive creation"""
        with self.app.app_context():
            # Test automatic serial number generation
            serial_number = Beehive.generate_serial_number()
            self.assertEqual(serial_number, 'TO001')
            
            beehive = Beehive(
                serial_number=serial_number,
                import_date=date.today(),
                health_status='Tốt',
                notes='Test beehive'
            )
            db.session.add(beehive)
            db.session.commit()
            
            # Verify beehive was created
            beehives = Beehive.query.all()
            self.assertEqual(len(beehives), 1)
            self.assertEqual(beehives[0].serial_number, 'TO001')
    
    def test_qr_data_generation(self):
        """Test QR data generation"""
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TO002',
                import_date=date.today(),
                health_status='Tốt',
                notes='Test notes'
            )
            db.session.add(beehive)
            db.session.commit()
            
            qr_data = get_beehive_qr_data(beehive)
            self.assertIn('Tổ ong KBee', qr_data)
            self.assertIn('TO002', qr_data)
            self.assertIn('Tốt', qr_data)
    
    def test_sold_beehive_qr_data(self):
        """Test QR data for sold beehive"""
        with self.app.app_context():
            beehive = Beehive(
                serial_number='TO003',
                import_date=date.today(),
                health_status='Tốt',
                is_sold=True,
                sold_date=date.today()
            )
            db.session.add(beehive)
            db.session.commit()
            
            qr_data = get_beehive_qr_data(beehive)
            self.assertIn('https://test.example.com/kbee-info/', qr_data)
    
    def test_login_page(self):
        """Test login page loads"""
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Đăng nhập', response.data.decode('utf-8'))
    
    def test_index_page(self):
        """Test index page redirects to login"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_404_page(self):
        """Test 404 page"""
        response = self.client.get('/nonexistent-page')
        self.assertEqual(response.status_code, 404)
        self.assertIn('Trang không tìm thấy', response.data.decode('utf-8'))
    
    def test_favicon(self):
        """Test favicon endpoint"""
        response = self.client.get('/favicon.ico')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'image/png')
    
    def test_successful_login(self):
        """Test successful login"""
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        }, follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Trang chủ', response.data.decode('utf-8'))
    
    def test_failed_login(self):
        """Test failed login"""
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
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
    
    def test_change_password(self):
        """Test change password functionality"""
        # Login first
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        # Test change password page access
        response = self.client.get('/change-password')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Đổi mật khẩu', response.data.decode('utf-8'))
        
        # Test change password with wrong current password
        response = self.client.post('/change-password', data={
            'current_password': 'wrongpassword',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        })
        self.assertIn('Mật khẩu hiện tại không đúng', response.data.decode('utf-8'))
        
        # Test change password with mismatched new passwords
        response = self.client.post('/change-password', data={
            'current_password': 'testpass123',
            'new_password': 'newpass123',
            'confirm_password': 'differentpass'
        })
        self.assertIn('Mật khẩu mới và xác nhận mật khẩu không khớp', response.data.decode('utf-8'))
        
        # Test change password with short password
        response = self.client.post('/change-password', data={
            'current_password': 'testpass123',
            'new_password': '123',
            'confirm_password': '123'
        })
        self.assertIn('Mật khẩu mới phải có ít nhất 6 ký tự', response.data.decode('utf-8'))
        
        # Test successful password change
        response = self.client.post('/change-password', data={
            'current_password': 'testpass123',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect to dashboard
        
        # Test login with new password
        self.client.get('/logout')  # Logout first
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, 302)  # Should redirect to dashboard
        
        # Test login with old password (should fail)
        self.client.get('/logout')  # Logout first
        response = self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        self.assertIn('Tên đăng nhập hoặc mật khẩu không đúng', response.data.decode('utf-8'))
    
    def test_dashboard_sorting(self):
        """Test dashboard sorting functionality"""
        # Login first
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        # Create a test beehive first
        self.client.post('/add_beehive', data={
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': 'Test beehive for sorting'
        })
        
        # Test dashboard with sorting parameters
        response = self.client.get('/dashboard?sort=import_date&order=asc')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Mã tổ', response.data.decode('utf-8'))
        
        # Test different sorting options
        sorting_options = [
            ('created_at', 'desc'),
            ('import_date', 'asc'),
            ('health_status', 'desc'),
            ('status', 'asc')
        ]
        
        for sort_by, order in sorting_options:
            response = self.client.get(f'/dashboard?sort={sort_by}&order={order}')
            self.assertEqual(response.status_code, 200)
    
    def test_dashboard_pie_chart(self):
        """Test dashboard pie chart data"""
        # Login first
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        # Test dashboard loads with health stats
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Thống kê sức khỏe tổ ong', response.data.decode('utf-8'))
        self.assertIn('healthChart', response.data.decode('utf-8'))
    
    def test_pdf_export(self):
        """Test PDF export functionality"""
        # Login first
        self.client.post('/login', data={
            'username': 'testadmin',
            'password': 'testpass123'
        })
        
        # Create a test beehive first
        self.client.post('/add_beehive', data={
            'import_date': '2024-01-01',
            'health_status': 'Tốt',
            'notes': 'Test beehive for PDF'
        })
        
        # Test PDF export
        response = self.client.get('/export_qr_pdf')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/pdf')
        
        # Check that PDF content is not empty
        self.assertGreater(len(response.data), 1000)  # PDF should be at least 1KB

def run_tests():
    """Run all tests"""
    print("🐝 KBee Manager - Simple Test Suite")
    print("=" * 50)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    tests = unittest.TestLoader().loadTestsFromTestCase(SimpleKBeeTest)
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
    
    if result.wasSuccessful():
        print("✅ All tests passed! Application is ready for deployment.")
        return True
    else:
        print("❌ Some tests failed. Please fix issues before deployment.")
        return False

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
