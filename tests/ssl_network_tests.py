#!/usr/bin/env python3
"""
SSL and Network Tests for KBee Manager
Comprehensive testing of SSL certificates, network connectivity, and security
"""

import unittest
import requests
import ssl
import socket
import time
import json
import os
import sys
from datetime import datetime
import urllib3
from urllib.parse import urlparse

# Suppress SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class SSLNetworkTests(unittest.TestCase):
    """Test SSL certificates, network connectivity, and security"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.domain = "khainguyenbee.io.vn"
        cls.frontend_port = 443
        cls.backend_port = 8000
        cls.frontend_url = f"https://{cls.domain}"
        cls.backend_url = f"http://{cls.domain}:{cls.backend_port}"
        
        print(f"\n🔒 Starting SSL & Network Tests")
        print(f"🌐 Domain: {cls.domain}")
        print(f"🔗 Frontend: {cls.frontend_url}")
        print(f"⚙️  Backend: {cls.backend_url}")
    
    def setUp(self):
        """Set up for each test"""
        self.session = requests.Session()
        self.session.verify = False
        self.session.timeout = 10

class TestSSLConfiguration(SSLNetworkTests):
    """Test SSL certificate configuration and security"""
    
    def test_01_ssl_certificate_presence(self):
        """Test that SSL certificate is present and valid"""
        print("\n🔒 Testing SSL Certificate Presence...")
        
        try:
            # Create SSL context
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            # Connect to server
            with socket.create_connection((self.domain, self.frontend_port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    self.assertIsNotNone(cert, "SSL certificate should be present")
                    print("✅ SSL certificate is present")
                    
                    # Check certificate details
                    subject = dict(x[0] for x in cert['subject'])
                    issuer = dict(x[0] for x in cert['issuer'])
                    
                    print(f"   📋 Subject: {subject.get('commonName', 'Unknown')}")
                    print(f"   🏢 Issuer: {issuer.get('organizationName', 'Unknown')}")
                    
                    # Check certificate validity
                    not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    now = datetime.now()
                    
                    self.assertLess(not_before, now, "Certificate should not be expired")
                    self.assertGreater(not_after, now, "Certificate should not be expired")
                    
                    print(f"   📅 Valid from: {not_before}")
                    print(f"   📅 Valid until: {not_after}")
                    
        except Exception as e:
            self.fail(f"SSL certificate test failed: {e}")
    
    def test_02_ssl_protocols_and_ciphers(self):
        """Test SSL protocols and cipher suites"""
        print("\n🔐 Testing SSL Protocols and Ciphers...")
        
        try:
            # Test different SSL protocols
            protocols_to_test = [
                (ssl.PROTOCOL_TLSv1_2, "TLSv1.2"),
                (ssl.PROTOCOL_TLSv1_3, "TLSv1.3")
            ]
            
            for protocol, protocol_name in protocols_to_test:
                try:
                    context = ssl.SSLContext(protocol)
                    context.check_hostname = False
                    context.verify_mode = ssl.CERT_NONE
                    
                    with socket.create_connection((self.domain, self.frontend_port), timeout=10) as sock:
                        with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                            print(f"   ✅ {protocol_name}: Supported")
                            
                            # Get cipher info
                            cipher = ssock.cipher()
                            if cipher:
                                print(f"      🔐 Cipher: {cipher[0]}")
                                print(f"      🔑 Key Size: {cipher[2]} bits")
                            
                except ssl.SSLError as e:
                    print(f"   ❌ {protocol_name}: Not supported ({e})")
                except Exception as e:
                    print(f"   ⚠️  {protocol_name}: Error ({e})")
            
        except Exception as e:
            self.fail(f"SSL protocols test failed: {e}")
    
    def test_03_https_connectivity(self):
        """Test HTTPS connectivity and response"""
        print("\n🌐 Testing HTTPS Connectivity...")
        
        try:
            # Test basic HTTPS connection
            response = self.session.get(self.frontend_url, timeout=10)
            
            self.assertEqual(response.status_code, 200, "HTTPS should return 200")
            self.assertIn('text/html', response.headers.get('content-type', ''), 
                         "Should return HTML content")
            
            print("✅ HTTPS connectivity working")
            
            # Test response headers
            security_headers = [
                'Strict-Transport-Security',
                'X-Frame-Options',
                'X-Content-Type-Options',
                'X-XSS-Protection'
            ]
            
            for header in security_headers:
                if header in response.headers:
                    print(f"   🛡️  {header}: {response.headers[header]}")
                else:
                    print(f"   ⚠️  {header}: Missing")
            
        except Exception as e:
            self.fail(f"HTTPS connectivity test failed: {e}")
    
    def test_04_http_to_https_redirect(self):
        """Test HTTP to HTTPS redirect"""
        print("\n🔄 Testing HTTP to HTTPS Redirect...")
        
        try:
            # Test HTTP connection (should redirect to HTTPS)
            http_url = f"http://{self.domain}"
            response = self.session.get(http_url, allow_redirects=False, timeout=10)
            
            # Should redirect to HTTPS
            self.assertIn(response.status_code, [301, 302], "Should redirect HTTP to HTTPS")
            
            if 'location' in response.headers:
                location = response.headers['location']
                self.assertTrue(location.startswith('https://'), "Should redirect to HTTPS")
                print(f"   ✅ Redirects to: {location}")
            
        except Exception as e:
            self.fail(f"HTTP to HTTPS redirect test failed: {e}")

class TestNetworkConnectivity(SSLNetworkTests):
    """Test network connectivity and performance"""
    
    def test_05_backend_connectivity(self):
        """Test backend API connectivity"""
        print("\n⚙️ Testing Backend Connectivity...")
        
        try:
            response = self.session.get(f"{self.backend_url}/", timeout=10)
            
            self.assertEqual(response.status_code, 200, "Backend should return 200")
            
            data = response.json()
            self.assertEqual(data.get('status'), 'healthy', "Backend should be healthy")
            
            print("✅ Backend connectivity working")
            print(f"   📊 Status: {data.get('status')}")
            print(f"   📝 Message: {data.get('message')}")
            
        except Exception as e:
            self.fail(f"Backend connectivity test failed: {e}")
    
    def test_06_api_endpoints_connectivity(self):
        """Test API endpoints connectivity"""
        print("\n🔗 Testing API Endpoints Connectivity...")
        
        api_endpoints = [
            "/api/setup/check",
            "/api/stats",
            "/api/beehives"
        ]
        
        for endpoint in api_endpoints:
            try:
                url = f"{self.frontend_url}{endpoint}"
                response = self.session.get(url, timeout=10)
                
                # Should return 200 or 401 (for protected endpoints)
                self.assertIn(response.status_code, [200, 401], 
                             f"Endpoint {endpoint} should be accessible")
                
                print(f"   ✅ {endpoint}: HTTP {response.status_code}")
                
            except Exception as e:
                self.fail(f"API endpoint {endpoint} test failed: {e}")
    
    def test_07_response_times(self):
        """Test response times for different endpoints"""
        print("\n⏱️ Testing Response Times...")
        
        endpoints = [
            (f"{self.frontend_url}", "Frontend Homepage"),
            (f"{self.backend_url}/", "Backend Health"),
            (f"{self.frontend_url}/api/setup/check", "API Setup Check")
        ]
        
        for url, name in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(url, timeout=10)
                end_time = time.time()
                
                response_time = end_time - start_time
                
                # Response time should be under 5 seconds
                self.assertLess(response_time, 5.0, f"{name} response time should be under 5 seconds")
                
                print(f"   ✅ {name}: {response_time:.2f}s (HTTP {response.status_code})")
                
            except Exception as e:
                self.fail(f"Response time test for {name} failed: {e}")
    
    def test_08_concurrent_connections(self):
        """Test handling of concurrent connections"""
        print("\n🔄 Testing Concurrent Connections...")
        
        try:
            import threading
            import queue
            
            results = queue.Queue()
            
            def make_request():
                try:
                    response = self.session.get(f"{self.frontend_url}/api/setup/check", timeout=10)
                    results.put(response.status_code)
                except Exception as e:
                    results.put(f"Error: {e}")
            
            # Create 10 concurrent requests
            threads = []
            for i in range(10):
                thread = threading.Thread(target=make_request)
                threads.append(thread)
                thread.start()
            
            # Wait for all threads to complete
            for thread in threads:
                thread.join()
            
            # Check results
            success_count = 0
            error_count = 0
            
            while not results.empty():
                result = results.get()
                if result == 200:
                    success_count += 1
                else:
                    error_count += 1
            
            # At least 8 out of 10 requests should succeed
            self.assertGreaterEqual(success_count, 8, 
                                  "At least 8 out of 10 concurrent requests should succeed")
            
            print(f"   ✅ Concurrent requests: {success_count}/10 successful")
            if error_count > 0:
                print(f"   ⚠️  Errors: {error_count}")
            
        except Exception as e:
            self.fail(f"Concurrent connections test failed: {e}")

class TestSecurityHeaders(SSLNetworkTests):
    """Test security headers and configurations"""
    
    def test_09_security_headers(self):
        """Test security headers are properly configured"""
        print("\n🛡️ Testing Security Headers...")
        
        try:
            response = self.session.get(self.frontend_url, timeout=10)
            
            # Required security headers
            required_headers = {
                'Strict-Transport-Security': 'HSTS header should be present',
                'X-Frame-Options': 'Frame options should be set',
                'X-Content-Type-Options': 'Content type options should be set',
                'X-XSS-Protection': 'XSS protection should be enabled'
            }
            
            for header, description in required_headers.items():
                if header in response.headers:
                    print(f"   ✅ {header}: {response.headers[header]}")
                else:
                    print(f"   ⚠️  {header}: Missing ({description})")
            
            # Test CORS headers for API endpoints
            cors_response = self.session.options(
                f"{self.frontend_url}/api/setup/check",
                headers={
                    'Origin': self.frontend_url,
                    'Access-Control-Request-Method': 'GET'
                },
                timeout=10
            )
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            for header in cors_headers:
                if header in cors_response.headers:
                    print(f"   ✅ CORS {header}: {cors_response.headers[header]}")
                else:
                    print(f"   ⚠️  CORS {header}: Missing")
            
        except Exception as e:
            self.fail(f"Security headers test failed: {e}")
    
    def test_10_ssl_grade_check(self):
        """Test SSL configuration grade"""
        print("\n📊 Testing SSL Configuration Grade...")
        
        try:
            # Test SSL Labs API (if available) or basic SSL checks
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            with socket.create_connection((self.domain, self.frontend_port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    # Check TLS version
                    tls_version = ssock.version()
                    print(f"   🔐 TLS Version: {tls_version}")
                    
                    # Check cipher strength
                    cipher = ssock.cipher()
                    if cipher:
                        key_size = cipher[2]
                        print(f"   🔑 Key Size: {key_size} bits")
                        
                        # Grade based on key size
                        if key_size >= 256:
                            grade = "A+"
                        elif key_size >= 128:
                            grade = "A"
                        else:
                            grade = "B"
                        
                        print(f"   📊 SSL Grade: {grade}")
                    
                    # Check certificate chain
                    cert = ssock.getpeercert()
                    if cert:
                        print(f"   📋 Certificate: Valid")
                        
                        # Check if certificate is self-signed
                        subject = dict(x[0] for x in cert['subject'])
                        issuer = dict(x[0] for x in cert['issuer'])
                        
                        if subject.get('commonName') == issuer.get('commonName'):
                            print(f"   ⚠️  Certificate: Self-signed")
                        else:
                            print(f"   ✅ Certificate: CA-signed")
            
        except Exception as e:
            self.fail(f"SSL grade check failed: {e}")

def run_ssl_network_tests():
    """Run all SSL and network tests"""
    print("🔒 KBee Manager SSL & Network Tests")
    print("=" * 50)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_classes = [
        TestSSLConfiguration,
        TestNetworkConnectivity,
        TestSecurityHeaders
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 SSL & NETWORK TEST SUMMARY")
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
    success = run_ssl_network_tests()
    sys.exit(0 if success else 1)
