#!/usr/bin/env python3
"""
User Flow Tests for KBee Manager
Tests complete user journeys and workflows
"""

import unittest
import requests
import json
import time
import os
import sys
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class UserFlowTests(unittest.TestCase):
    """Test complete user workflows and journeys"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.base_url = "https://khainguyenbee.io.vn"
        cls.api_base = f"{cls.base_url}/api"
        
        # Test user credentials - using production user
        cls.test_user = {
            'username': 'khai',
            'password': 'khai123',
            'email': 'khai@khainguyenbee.io.vn'
        }
        
        cls.auth_token = None
        cls.created_beehives = []
        
        print(f"\n🎭 Starting User Flow Tests")
        print(f"📡 Testing against: {cls.base_url}")
    
    def setUp(self):
        """Set up for each test"""
        self.session = requests.Session()
        self.session.verify = False
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'KBee-UserFlow-Test/1.0'
        })
    
    def tearDown(self):
        """Clean up after each test"""
        self.session.close()

class TestCompleteUserJourney(UserFlowTests):
    """Test complete user journey from setup to daily operations"""
    
    def test_01_complete_setup_journey(self):
        """Test complete setup journey for new user"""
        print("\n🚀 Testing Complete Setup Journey...")
        
        try:
            # Step 1: Check if setup is needed
            response = self.session.get(f"{self.api_base}/setup/check", timeout=10)
            self.assertEqual(response.status_code, 200, "Setup check should work")
            
            setup_data = response.json()
            print(f"   📋 Setup needed: {setup_data.get('setup_needed')}")
            
            # Step 2: Create admin user if needed
            if setup_data.get('setup_needed', True):
                setup_payload = {
                    'username': self.test_user['username'],
                    'password': self.test_user['password'],
                    'email': self.test_user['email']
                }
                
                response = self.session.post(f"{self.api_base}/setup", 
                                           json=setup_payload, timeout=10)
                self.assertIn(response.status_code, [200, 201], "Setup should succeed")
                print("   ✅ Admin user created")
            
            # Step 3: Login with new credentials
            login_payload = {
                'username': self.test_user['username'],
                'password': self.test_user['password']
            }
            
            response = self.session.post(f"{self.api_base}/auth/login", 
                                       json=login_payload, timeout=10)
            self.assertEqual(response.status_code, 200, "Login should succeed")
            
            login_data = response.json()
            self.assertIn('token', login_data, "Should receive auth token")
            
            # Store token for subsequent tests
            self.__class__.auth_token = login_data['token']
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
            
            print("   ✅ User logged in successfully")
            print("✅ Complete setup journey working")
            
        except Exception as e:
            self.fail(f"Complete setup journey failed: {e}")
    
    def test_02_daily_beehive_management_flow(self):
        """Test daily beehive management workflow"""
        print("\n🐝 Testing Daily Beehive Management Flow...")
        
        try:
            if not self.__class__.auth_token:
                self.skipTest("No auth token available")
            
            # Step 1: Check dashboard statistics
            response = self.session.get(f"{self.api_base}/stats", timeout=10)
            self.assertEqual(response.status_code, 200, "Stats should be accessible")
            
            stats = response.json()
            print(f"   📊 Total beehives: {stats.get('total_beehives', 0)}")
            print(f"   📊 Active beehives: {stats.get('active_beehives', 0)}")
            
            # Step 2: Create multiple beehives
            beehive_data_list = [
                {
                    'serial_number': f'FLOW-TEST-{int(time.time())}-1',
                    'import_date': datetime.now().strftime('%Y-%m-%d'),
                    'split_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                    'health_status': 'good',
                    'notes': 'Flow test beehive 1'
                },
                {
                    'serial_number': f'FLOW-TEST-{int(time.time())}-2',
                    'import_date': datetime.now().strftime('%Y-%m-%d'),
                    'split_date': (datetime.now() + timedelta(days=45)).strftime('%Y-%m-%d'),
                    'health_status': 'normal',
                    'notes': 'Flow test beehive 2'
                }
            ]
            
            created_beehives = []
            for beehive_data in beehive_data_list:
                response = self.session.post(f"{self.api_base}/beehives", 
                                           json=beehive_data, timeout=10)
                self.assertEqual(response.status_code, 201, "Beehive creation should succeed")
                
                created_data = response.json()
                created_beehives.append(created_data['serial_number'])
                print(f"   ✅ Created beehive: {created_data['serial_number']}")
            
            # Store for cleanup
            self.__class__.created_beehives.extend(created_beehives)
            
            # Step 3: View beehives list
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Beehives list should be accessible")
            
            beehives_data = response.json()
            self.assertIn('beehives', beehives_data, "Should return beehives array")
            print(f"   📋 Retrieved {len(beehives_data['beehives'])} beehives")
            
            # Step 4: Update beehive health status
            if created_beehives:
                update_data = {
                    'health_status': 'weak',
                    'notes': 'Updated during flow test - health declined'
                }
                
                response = self.session.put(f"{self.api_base}/beehives/{created_beehives[0]}", 
                                          json=update_data, timeout=10)
                self.assertEqual(response.status_code, 200, "Beehive update should succeed")
                print(f"   ✏️ Updated beehive: {created_beehives[0]}")
            
            # Step 5: Check updated statistics
            response = self.session.get(f"{self.api_base}/stats", timeout=10)
            self.assertEqual(response.status_code, 200, "Updated stats should be accessible")
            
            updated_stats = response.json()
            print(f"   📊 Updated total beehives: {updated_stats.get('total_beehives', 0)}")
            
            print("✅ Daily beehive management flow working")
            
        except Exception as e:
            self.fail(f"Daily beehive management flow failed: {e}")
    
    def test_03_sales_workflow(self):
        """Test complete sales workflow"""
        print("\n💰 Testing Sales Workflow...")
        
        try:
            if not self.__class__.auth_token or not self.__class__.created_beehives:
                self.skipTest("No auth token or beehives available")
            
            beehive_id = self.__class__.created_beehives[0]
            
            # Step 1: Check initial status (should be active)
            response = self.session.get(f"{self.api_base}/beehives/{beehive_id}", timeout=10)
            self.assertEqual(response.status_code, 200, "Should get beehive details")
            
            beehive_data = response.json()
            self.assertFalse(beehive_data.get('is_sold', False), "Beehive should not be sold initially")
            print(f"   📋 Initial status: Active")
            
            # Step 2: Sell the beehive
            response = self.session.post(f"{self.api_base}/beehives/{beehive_id}/sell", timeout=10)
            self.assertEqual(response.status_code, 200, "Beehive sale should succeed")
            
            sale_data = response.json()
            self.assertIn('message', sale_data, "Should return success message")
            print(f"   💰 Beehive sold: {beehive_id}")
            
            # Step 3: Verify beehive is now in sold list
            response = self.session.get(f"{self.api_base}/sold-beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Sold beehives should be accessible")
            
            sold_data = response.json()
            sold_beehives = [b['serial_number'] for b in sold_data.get('beehives', [])]
            self.assertIn(beehive_id, sold_beehives, "Beehive should appear in sold list")
            print(f"   📦 Beehive appears in sold list")
            
            # Step 4: Test QR code for sold beehive
            response = self.session.get(f"{self.api_base}/beehives/{beehive_id}", timeout=10)
            beehive_data = response.json()
            
            if 'qr_token' in beehive_data:
                qr_response = self.session.get(f"{self.api_base}/beehive/{beehive_data['qr_token']}", 
                                             timeout=10)
                self.assertEqual(qr_response.status_code, 200, "QR code should work for sold beehive")
                print(f"   📱 QR code working for sold beehive")
            
            # Step 5: Unsell the beehive (restore)
            response = self.session.post(f"{self.api_base}/beehives/{beehive_id}/unsell", timeout=10)
            self.assertEqual(response.status_code, 200, "Beehive unsell should succeed")
            
            unsell_data = response.json()
            self.assertIn('message', unsell_data, "Should return success message")
            print(f"   🔄 Beehive restored: {beehive_id}")
            
            # Step 6: Verify beehive is back in active list
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            beehives_data = response.json()
            active_beehives = [b['serial_number'] for b in beehives_data.get('beehives', [])]
            self.assertIn(beehive_id, active_beehives, "Beehive should be back in active list")
            print(f"   ✅ Beehive restored to active list")
            
            print("✅ Sales workflow working")
            
        except Exception as e:
            self.fail(f"Sales workflow failed: {e}")
    
    def test_04_qr_code_workflow(self):
        """Test complete QR code workflow"""
        print("\n📱 Testing QR Code Workflow...")
        
        try:
            if not self.__class__.auth_token or not self.__class__.created_beehives:
                self.skipTest("No auth token or beehives available")
            
            beehive_id = self.__class__.created_beehives[-1]  # Use last created beehive
            
            # Step 1: Get beehive details and QR token
            response = self.session.get(f"{self.api_base}/beehives/{beehive_id}", timeout=10)
            self.assertEqual(response.status_code, 200, "Should get beehive details")
            
            beehive_data = response.json()
            self.assertIn('qr_token', beehive_data, "Beehive should have QR token")
            
            qr_token = beehive_data['qr_token']
            print(f"   🎫 QR token: {qr_token[:20]}...")
            
            # Step 2: Test QR code scanning (public endpoint)
            qr_response = self.session.get(f"{self.api_base}/beehive/{qr_token}", timeout=10)
            self.assertEqual(qr_response.status_code, 200, "QR scan should work")
            
            qr_data = qr_response.json()
            self.assertIn('serial_number', qr_data, "QR should return beehive info")
            self.assertEqual(qr_data['serial_number'], beehive_id, "QR should return correct beehive")
            print(f"   📷 QR scan successful: {qr_data['serial_number']}")
            
            # Step 3: Test QR code with different health statuses
            health_statuses = ['good', 'normal', 'weak']
            for status in health_statuses:
                # Update health status
                update_data = {'health_status': status}
                response = self.session.put(f"{self.api_base}/beehives/{beehive_id}", 
                                          json=update_data, timeout=10)
                self.assertEqual(response.status_code, 200, f"Health update to {status} should succeed")
                
                # Test QR code again
                qr_response = self.session.get(f"{self.api_base}/beehive/{qr_token}", timeout=10)
                self.assertEqual(qr_response.status_code, 200, f"QR should work with {status} status")
                
                qr_data = qr_response.json()
                self.assertEqual(qr_data['health_status'], status, f"QR should show {status} status")
                print(f"   🏥 QR works with {status} health status")
            
            print("✅ QR code workflow working")
            
        except Exception as e:
            self.fail(f"QR code workflow failed: {e}")
    
    def test_05_error_recovery_workflow(self):
        """Test error recovery and edge cases"""
        print("\n🛡️ Testing Error Recovery Workflow...")
        
        try:
            if not self.__class__.auth_token:
                self.skipTest("No auth token available")
            
            # Step 1: Test invalid beehive operations
            invalid_id = "INVALID-BEEHIVE-ID"
            
            # Try to get invalid beehive
            response = self.session.get(f"{self.api_base}/beehives/{invalid_id}", timeout=10)
            self.assertEqual(response.status_code, 404, "Invalid beehive should return 404")
            print("   ❌ Invalid beehive ID handled correctly")
            
            # Try to update invalid beehive
            update_data = {'health_status': 'good'}
            response = self.session.put(f"{self.api_base}/beehives/{invalid_id}", 
                                      json=update_data, timeout=10)
            self.assertEqual(response.status_code, 404, "Update invalid beehive should return 404")
            print("   ❌ Invalid beehive update handled correctly")
            
            # Step 2: Test unauthorized access
            unauth_session = requests.Session()
            unauth_session.verify = False
            
            response = unauth_session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 401, "Unauthorized access should return 401")
            print("   🔒 Unauthorized access handled correctly")
            
            # Step 3: Test malformed requests
            malformed_data = {'invalid_field': 'invalid_value'}
            response = self.session.post(f"{self.api_base}/beehives", 
                                       json=malformed_data, timeout=10)
            self.assertIn(response.status_code, [400, 422], "Malformed request should return error")
            print("   📝 Malformed request handled correctly")
            
            # Step 4: Test system recovery after errors
            # Try normal operation after errors
            response = self.session.get(f"{self.api_base}/stats", timeout=10)
            self.assertEqual(response.status_code, 200, "System should recover after errors")
            print("   🔄 System recovery working")
            
            print("✅ Error recovery workflow working")
            
        except Exception as e:
            self.fail(f"Error recovery workflow failed: {e}")
    
    def test_06_cleanup_workflow(self):
        """Test cleanup and maintenance workflow"""
        print("\n🧹 Testing Cleanup Workflow...")
        
        try:
            if not self.__class__.auth_token:
                self.skipTest("No auth token available")
            
            # Step 1: Delete all test beehives
            deleted_count = 0
            for beehive_id in self.__class__.created_beehives:
                response = self.session.delete(f"{self.api_base}/beehives/{beehive_id}", timeout=10)
                if response.status_code == 200:
                    deleted_count += 1
                    print(f"   🗑️ Deleted beehive: {beehive_id}")
            
            print(f"   📊 Cleaned up {deleted_count} test beehives")
            
            # Step 2: Verify cleanup
            response = self.session.get(f"{self.api_base}/beehives", timeout=10)
            self.assertEqual(response.status_code, 200, "Should get beehives list after cleanup")
            
            beehives_data = response.json()
            remaining_beehives = [b['serial_number'] for b in beehives_data.get('beehives', [])]
            
            # Check that no test beehives remain
            test_beehives_remaining = [b for b in remaining_beehives if 'FLOW-TEST-' in b]
            self.assertEqual(len(test_beehives_remaining), 0, "No test beehives should remain")
            print("   ✅ Cleanup verification successful")
            
            # Step 3: Final statistics check
            response = self.session.get(f"{self.api_base}/stats", timeout=10)
            self.assertEqual(response.status_code, 200, "Final stats should be accessible")
            
            final_stats = response.json()
            print(f"   📊 Final total beehives: {final_stats.get('total_beehives', 0)}")
            
            print("✅ Cleanup workflow working")
            
        except Exception as e:
            self.fail(f"Cleanup workflow failed: {e}")

def run_user_flow_tests():
    """Run all user flow tests"""
    print("🎭 KBee Manager User Flow Tests")
    print("=" * 50)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test class
    tests = unittest.TestLoader().loadTestsFromTestCase(TestCompleteUserJourney)
    test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 USER FLOW TEST SUMMARY")
    print("=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    # Suppress SSL warnings for testing
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    success = run_user_flow_tests()
    sys.exit(0 if success else 1)
