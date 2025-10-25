#!/usr/bin/env python3
"""
Local Test Suite for KBee Manager
Tests all functionality on localhost before SSL deployment
"""

import unittest
import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta
import urllib3

# Suppress SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class LocalKBeeTestSuite(unittest.TestCase):
    """Local test suite for KBee Manager system"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment for local testing"""
        cls.base_url = "http://localhost:8080"
        cls.api_base = f"{cls.base_url}/api"
        cls.backend_url = "http://localhost:8000"
        
        # Test credentials
        cls.test_user = {
            'username': 'local_test_admin',
            'password': 'local_test_password_123',
            'email': 'localtest@localhost.com'
        }
        
        cls.auth_token = None
        cls.test_beehive_id = None
        
        print(f"\n🏠 Starting Local Test Suite")
        print(f"📡 Testing against: {cls.base_url}")
        print(f"🔗 API Base: {cls.api_base}")
        print(f"⚙️  Backend: {cls.backend_url}")
    
    def setUp(self):
        """Set up for each test"""
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'KBee-Local-Test/1.0'
        })
    
    def tearDown(self):
        """Clean up after each test"""
        self.session.close()

class TestLocalConnectivity(LocalKBeeTestSuite):
    """Test local connectivity and basic infrastructure"""
    
    def test_01_local_frontend_connectivity(self):
        """Test local frontend connectivity"""
        print("\n🌐 Testing Local Frontend Connectivity...")
        
        try:
            response = self.session.get(self.base_url, timeout=10)
            self.assertEqual(response.status_code, 200, "Local frontend should return 200")
            self.assertIn('text/html', response.headers.get('content-type', ''), 
                         "Should return HTML content")
            print("✅ Local frontend connectivity working")
            
        except Exception as e:
            self.fail(f"Local frontend connectivity failed: {e}")
    
    def test_02_local_backend_connectivity(self):
        """Test local backend connectivity"""
        print("\n⚙️ Testing Local Backend Connectivity...")
        
        try:
            response = self.session.get(f"{self.backend_url}/", timeout=10)
            self.assertEqual(response.status_code, 200, "Local backend should return 200")
            
            data = response.json()
            self.assertEqual(data.get('status'), 'healthy', "Backend should be healthy")
            print("✅ Local backend connectivity working")
            
        except Exception as e:
            self.fail(f"Local backend connectivity failed: {e}")
    
    def test_03_local_api_endpoints(self):
        """Test local API endpoints"""
        print("\n🔗 Testing Local API Endpoints...")
        
        api_endpoints = [
            "/api/setup/check",
            "/api/stats",
            "/api/beehives"
        ]
        
        for endpoint in api_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                response = self.session.get(url, timeout=10)
                
                # Should return 200 or 401 (for protected endpoints)
                self.assertIn(response.status_code, [200, 401], 
                             f"Endpoint {endpoint} should be accessible")
                
                print(f"   ✅ {endpoint}: HTTP {response.status_code}")
                
            except Exception as e:
                self.fail(f"API endpoint {endpoint} test failed: {e}")

class TestLocalAuthentication(LocalKBeeTestSuite):
    """Test local authentication flow"""
    
    def test_04_local_setup_check(self):
        """Test local setup check"""
        print("\n🔧 Testing Local Setup Check...")
        
        try:
            response = self.session.get(f"{self.api_base}/setup/check", timeout=10)
            self.assertEqual(response.status_code, 200, "Setup check should return 200")
            
            data = response.json()
            self.assertIn('setup_needed', data, "Should return setup status")
            print(f"✅ Local setup check working: setup_needed={data.get('setup_needed')}")
            
        except Exception as e:
            self.fail(f"Local setup check failed: {e}")
    
    def test_05_local_admin_setup(self):
        """Test local admin setup"""
        print("\n👤 Testing Local Admin Setup...")
        
        try:
            setup_data = {
                'username': self.test_user['username'],
                'password': self.test_user['password'],
                'email': self.test_user['email']
            }
            
            response = self.session.post(f"{self.api_base}/setup", 
                                       json=setup_data, timeout=10)
            
            # Should return 200, 201, or 400 (user already exists)
            self.assertIn(response.status_code, [200, 201, 400], 
                         "Setup should be successful or user already exists")
            
            data = response.json()
            self.assertIn('message', data, "Should return message")
            print("✅ Local admin setup working")
            
        except Exception as e:
            self.fail(f"Local admin setup failed: {e}")
    
    def test_06_local_user_login(self):
        """Test local user login"""
        print("\n🔐 Testing Local User Login...")
        
        try:
            login_data = {
                'username': self.test_user['username'],
                'password': self.test_user['password']
            }
            
            response = self.session.post(f"{self.api_base}/auth/login", 
                                       json=login_data, timeout=10)
            
            self.assertEqual(response.status_code, 200, "Login should be successful")
            
            data = response.json()
            self.assertIn('token', data, "Should return authentication token")
            self.assertIn('user', data, "Should return user information")
            
            # Store token for subsequent tests
            self.__class__.auth_token = data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
            
            print("✅ Local user login working")
            
        except Exception as e:
            self.fail(f"Local user login failed: {e}")
    
    def test_07_local_token_validation(self):
        """Test local JWT token validation"""
        print("\n🎫 Testing Local Token Validation...")
        
        try:
            # Re-login to get fresh token
            login_data = {
                'username': self.test_user['username'],
                'password': self.test_user['password']
            }
            
            login_response = self.session.post(f"{self.api_base}/auth/login", 
                                             json=login_data, timeout=10)
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                token = login_data['token']
                self.session.headers.update({
                    'Authorization': f'Bearer {token}'
                })
                
                response = self.session.get(f"{self.api_base}/auth/me", timeout=10)
                self.assertEqual(response.status_code, 200, "Token should be valid")
                
                data = response.json()
                self.assertIn('id', data, "Should return user ID")
                self.assertIn('username', data, "Should return username")
                
                print("✅ Local token validation working")
            else:
                self.fail(f"Re-login failed: {login_response.status_code}")
            
        except Exception as e:
            self.fail(f"Local token validation failed: {e}")

class TestLocalBeehiveOperations(LocalKBeeTestSuite):
    """Test local beehive operations"""
    
    def setUp(self):
        """Set up authentication for beehive tests"""
        super().setUp()
        # Always re-login to get fresh token
        login_data = {
            'username': self.test_user['username'],
            'password': self.test_user['password']
        }
        
        login_response = self.session.post(f"{self.api_base}/auth/login", 
                                         json=login_data, timeout=10)
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
            self.__class__.auth_token = token
    
    def test_08_local_create_beehive(self):
        """Test creating a beehive locally"""
        print("\n🐝 Testing Local Beehive Creation...")
        
        try:
            beehive_data = {
                'serial_number': f'LOCAL-TEST-{int(time.time())}',
                'import_date': datetime.now().strftime('%Y-%m-%d'),
                'split_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                'health_status': 'good',
                'notes': 'Local test beehive'
            }
            
            response = self.session.post(f"{self.api_base}/beehives", 
                                       json=beehive_data, timeout=10)
            
            self.assertEqual(response.status_code, 201, "Beehive creation should be successful")
            
            data = response.json()
            self.assertIn('serial_number', data, "Should return serial number")
            
            # Store beehive ID for subsequent tests (use serial_number as ID)
            self.__class__.test_beehive_id = data['serial_number']
            
            print(f"✅ Local beehive creation working: {data['serial_number']}")
            
        except Exception as e:
            self.fail(f"Local beehive creation failed: {e}")
    
    def test_09_local_get_beehives(self):
        """Test getting beehives list locally"""
        print("\n📋 Testing Local Beehives List...")
        
        try:
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Should return beehives list")
            
            data = response.json()
            self.assertIn('beehives', data, "Should return beehives array")
            self.assertIn('pagination', data, "Should return pagination info")
            
            print(f"✅ Local beehives list working: {len(data.get('beehives', []))} beehives")
            
        except Exception as e:
            self.fail(f"Local beehives list failed: {e}")
    
    def test_10_local_update_beehive(self):
        """Test updating beehive locally"""
        print("\n✏️ Testing Local Beehive Update...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            update_data = {
                'health_status': 'normal',
                'notes': 'Updated local test beehive'
            }
            
            response = self.session.put(f"{self.api_base}/beehives/{self.__class__.test_beehive_id}", 
                                      json=update_data, timeout=10)
            
            self.assertEqual(response.status_code, 200, "Beehive update should be successful")
            
            data = response.json()
            self.assertEqual(data['health_status'], 'normal', "Health status should be updated")
            
            print("✅ Local beehive update working")
            
        except Exception as e:
            self.fail(f"Local beehive update failed: {e}")
    
    def test_11_local_sell_beehive(self):
        """Test selling beehive locally"""
        print("\n💰 Testing Local Beehive Sale...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            response = self.session.post(f"{self.api_base}/beehives/{self.__class__.test_beehive_id}/sell", 
                                       timeout=10)
            
            self.assertEqual(response.status_code, 200, "Beehive sale should be successful")
            
            data = response.json()
            self.assertIn('is_sold', data, "Should return beehive data")
            self.assertTrue(data['is_sold'], "Beehive should be marked as sold")
            
            print("✅ Local beehive sale working")
            
        except Exception as e:
            self.fail(f"Local beehive sale failed: {e}")
    
    def test_12_local_get_sold_beehives(self):
        """Test getting sold beehives locally"""
        print("\n📦 Testing Local Sold Beehives...")
        
        try:
            response = self.session.get(f"{self.api_base}/sold-beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Should return sold beehives")
            
            data = response.json()
            self.assertIn('beehives', data, "Should return beehives array")
            
            print(f"✅ Local sold beehives working: {len(data.get('beehives', []))} sold beehives")
            
        except Exception as e:
            self.fail(f"Local sold beehives failed: {e}")
    
    def test_13_local_unsell_beehive(self):
        """Test unselling beehive locally"""
        print("\n🔄 Testing Local Beehive Unsell...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            response = self.session.post(f"{self.api_base}/beehives/{self.__class__.test_beehive_id}/unsell", 
                                       timeout=10)
            
            self.assertEqual(response.status_code, 200, "Beehive unsell should be successful")
            
            data = response.json()
            self.assertIn('is_sold', data, "Should return beehive data")
            self.assertFalse(data['is_sold'], "Beehive should be marked as not sold")
            
            print("✅ Local beehive unsell working")
            
        except Exception as e:
            self.fail(f"Local beehive unsell failed: {e}")

class TestLocalQRCode(LocalKBeeTestSuite):
    """Test local QR code functionality"""
    
    def setUp(self):
        """Set up authentication for QR tests"""
        super().setUp()
        # Always re-login to get fresh token
        login_data = {
            'username': self.test_user['username'],
            'password': self.test_user['password']
        }
        
        login_response = self.session.post(f"{self.api_base}/auth/login", 
                                         json=login_data, timeout=10)
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
        
        # Get a beehive ID if we don't have one
        if not self.__class__.test_beehive_id:
            try:
                response = self.session.get(f"{self.api_base}/beehives", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    beehives = data.get('beehives', [])
                    if beehives:
                        self.__class__.test_beehive_id = beehives[0]['serial_number']
            except:
                pass
    
    def test_14_local_qr_code_generation(self):
        """Test QR code generation locally"""
        print("\n📱 Testing Local QR Code Generation...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            # Get beehive details from list to verify QR token
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Should get beehives list")
            
            data = response.json()
            beehives = data.get('beehives', [])
            beehive_data = None
            
            # Find the beehive with our test ID
            for beehive in beehives:
                if beehive['serial_number'] == self.__class__.test_beehive_id:
                    beehive_data = beehive
                    break
            
            self.assertIsNotNone(beehive_data, "Should find test beehive")
            self.assertIn('qr_token', beehive_data, "Should have QR token")
            
            # Test QR code endpoint
            qr_response = self.session.get(f"{self.api_base}/beehive/{beehive_data['qr_token']}", 
                                         timeout=10)
            self.assertEqual(qr_response.status_code, 200, "QR endpoint should work")
            
            print("✅ Local QR code generation working")
            
        except Exception as e:
            self.fail(f"Local QR code generation failed: {e}")
    
    def test_15_local_qr_code_scanning(self):
        """Test QR code scanning locally"""
        print("\n📷 Testing Local QR Code Scanning...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            # Get beehive QR token from list
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            data = response.json()
            beehives = data.get('beehives', [])
            beehive_data = None
            
            # Find the beehive with our test ID
            for beehive in beehives:
                if beehive['serial_number'] == self.__class__.test_beehive_id:
                    beehive_data = beehive
                    break
            
            self.assertIsNotNone(beehive_data, "Should find test beehive")
            qr_token = beehive_data['qr_token']
            
            # Test QR scanning (public endpoint)
            qr_response = self.session.get(f"{self.api_base}/beehive/{qr_token}", 
                                         timeout=10)
            self.assertEqual(qr_response.status_code, 200, "QR scan should work")
            
            qr_data = qr_response.json()
            self.assertIn('beehive', qr_data, "Should return beehive info")
            self.assertIn('serial_number', qr_data['beehive'], "Should return beehive serial number")
            
            print("✅ Local QR code scanning working")
            
        except Exception as e:
            self.fail(f"Local QR code scanning failed: {e}")

class TestLocalStatistics(LocalKBeeTestSuite):
    """Test local statistics and reporting"""
    
    def setUp(self):
        """Set up authentication for stats tests"""
        super().setUp()
        # Always re-login to get fresh token
        login_data = {
            'username': self.test_user['username'],
            'password': self.test_user['password']
        }
        
        login_response = self.session.post(f"{self.api_base}/auth/login", 
                                         json=login_data, timeout=10)
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
    
    def test_16_local_dashboard_statistics(self):
        """Test local dashboard statistics"""
        print("\n📊 Testing Local Dashboard Statistics...")
        
        try:
            response = self.session.get(f"{self.api_base}/stats", timeout=10)
            self.assertEqual(response.status_code, 200, "Should return statistics")
            
            data = response.json()
            self.assertIn('total', data, "Should return total beehives")
            self.assertIn('active', data, "Should return active beehives")
            self.assertIn('sold', data, "Should return sold beehives")
            self.assertIn('healthy', data, "Should return health statistics")
            
            print("✅ Local dashboard statistics working")
            
        except Exception as e:
            self.fail(f"Local dashboard statistics failed: {e}")

class TestLocalErrorHandling(LocalKBeeTestSuite):
    """Test local error handling"""
    
    def test_17_local_invalid_credentials(self):
        """Test login with invalid credentials locally"""
        print("\n❌ Testing Local Invalid Credentials...")
        
        try:
            invalid_data = {
                'username': 'invalid_user',
                'password': 'wrong_password'
            }
            
            response = self.session.post(f"{self.api_base}/auth/login", 
                                       json=invalid_data, timeout=10)
            
            self.assertEqual(response.status_code, 401, "Should return 401 for invalid credentials")
            
            data = response.json()
            self.assertIn('message', data, "Should return error message")
            
            print("✅ Local invalid credentials handling working")
            
        except Exception as e:
            self.fail(f"Local invalid credentials test failed: {e}")
    
    def test_18_local_unauthorized_access(self):
        """Test unauthorized access locally"""
        print("\n🔒 Testing Local Unauthorized Access...")
        
        try:
            # Create session without auth token
            unauth_session = requests.Session()
            
            response = unauth_session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 401, "Should return 401 for unauthorized access")
            
            print("✅ Local unauthorized access handling working")
            
        except Exception as e:
            self.fail(f"Local unauthorized access test failed: {e}")

class TestLocalPerformance(LocalKBeeTestSuite):
    """Test local performance"""
    
    def test_19_local_response_times(self):
        """Test local response times"""
        print("\n⏱️ Testing Local Response Times...")
        
        try:
            endpoints = [
                (f"{self.base_url}", "Local Frontend"),
                (f"{self.backend_url}/", "Local Backend"),
                (f"{self.api_base}/setup/check", "Local API Setup Check")
            ]
            
            for url, name in endpoints:
                start_time = time.time()
                response = self.session.get(url, timeout=10)
                end_time = time.time()
                
                response_time = end_time - start_time
                self.assertLess(response_time, 5.0, f"{name} response time should be under 5 seconds")
                
                print(f"   ✅ {name}: {response_time:.2f}s")
            
        except Exception as e:
            self.fail(f"Local response time test failed: {e}")

class TestLocalCleanup(LocalKBeeTestSuite):
    """Test local cleanup"""
    
    def setUp(self):
        """Set up authentication for cleanup tests"""
        super().setUp()
        # Always re-login to get fresh token
        login_data = {
            'username': self.test_user['username'],
            'password': self.test_user['password']
        }
        
        login_response = self.session.post(f"{self.api_base}/auth/login", 
                                         json=login_data, timeout=10)
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
        
        # Get a beehive ID if we don't have one
        if not self.__class__.test_beehive_id:
            try:
                response = self.session.get(f"{self.api_base}/beehives", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    beehives = data.get('beehives', [])
                    if beehives:
                        self.__class__.test_beehive_id = beehives[0]['serial_number']
            except:
                pass
    
    def test_20_local_delete_test_beehive(self):
        """Test deleting test beehive locally"""
        print("\n🗑️ Testing Local Beehive Deletion...")
        
        try:
            if not self.__class__.test_beehive_id:
                self.skipTest("No test beehive ID available")
            
            response = self.session.delete(f"{self.api_base}/beehives/{self.__class__.test_beehive_id}", 
                                         timeout=10)
            
            self.assertEqual(response.status_code, 200, "Beehive deletion should be successful")
            
            data = response.json()
            self.assertIn('message', data, "Should return success message")
            
            print("✅ Local beehive deletion working")
            
        except Exception as e:
            self.fail(f"Local beehive deletion failed: {e}")

def run_local_tests():
    """Run all local tests"""
    print("🏠 KBee Manager Local Test Suite")
    print("=" * 50)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestLocalConnectivity,
        TestLocalAuthentication,
        TestLocalBeehiveOperations,
        TestLocalQRCode,
        TestLocalStatistics,
        TestLocalErrorHandling,
        TestLocalPerformance,
        TestLocalCleanup
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 LOCAL TEST SUMMARY")
    print("=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\n❌ FAILURES:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.split('AssertionError: ')[-1].split('\\n')[0]}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.split('\\n')[-2]}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_local_tests()
    sys.exit(0 if success else 1)
