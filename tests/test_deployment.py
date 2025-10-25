#!/usr/bin/env python3
"""
Deployment test script for KBee Manager
Tests Docker deployment and production readiness
"""

import os
import sys
import subprocess
import time
import requests
from datetime import datetime

def print_status(message, status="INFO"):
    """Print status message with color"""
    colors = {
        "INFO": "\033[94m",
        "SUCCESS": "\033[92m", 
        "WARNING": "\033[93m",
        "ERROR": "\033[91m",
        "RESET": "\033[0m"
    }
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{colors.get(status, '')}[{timestamp}] {message}{colors['RESET']}")

def check_docker():
    """Check if Docker is installed and running"""
    print_status("Checking Docker installation...", "INFO")
    
    try:
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, text=True, check=True)
        print_status(f"Docker version: {result.stdout.strip()}", "SUCCESS")
        
        result = subprocess.run(['docker-compose', '--version'], 
                              capture_output=True, text=True, check=True)
        print_status(f"Docker Compose version: {result.stdout.strip()}", "SUCCESS")
        
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print_status("Docker or Docker Compose not found!", "ERROR")
        return False

def check_environment():
    """Check environment setup"""
    print_status("Checking environment setup...", "INFO")
    
    required_files = [
        'docker-compose.yml',
        'Dockerfile', 
        'requirements.txt',
        'app.py',
        'nginx.conf',
        'init.sql',
        'env.example'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print_status(f"Missing files: {', '.join(missing_files)}", "ERROR")
        return False
    
    print_status("All required files present", "SUCCESS")
    return True

def check_env_file():
    """Check if .env file exists"""
    print_status("Checking .env file...", "INFO")
    
    if not os.path.exists('.env'):
        print_status(".env file not found. Creating from template...", "WARNING")
        
        if os.path.exists('env.example'):
            try:
                with open('env.example', 'r') as src:
                    content = src.read()
                with open('.env', 'w') as dst:
                    dst.write(content)
                print_status(".env file created from template", "SUCCESS")
                print_status("Please update .env with your actual values", "WARNING")
                return True
            except Exception as e:
                print_status(f"Failed to create .env file: {e}", "ERROR")
                return False
        else:
            print_status("env.example not found!", "ERROR")
            return False
    else:
        print_status(".env file exists", "SUCCESS")
        return True

def test_docker_build():
    """Test Docker image build"""
    print_status("Testing Docker image build...", "INFO")
    
    try:
        result = subprocess.run(['docker-compose', 'build', '--no-cache'], 
                              capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print_status("Docker image built successfully", "SUCCESS")
            return True
        else:
            print_status(f"Docker build failed: {result.stderr}", "ERROR")
            return False
            
    except subprocess.TimeoutExpired:
        print_status("Docker build timed out", "ERROR")
        return False
    except Exception as e:
        print_status(f"Docker build error: {e}", "ERROR")
        return False

def test_docker_start():
    """Test Docker services start"""
    print_status("Testing Docker services start...", "INFO")
    
    try:
        # Start services
        result = subprocess.run(['docker-compose', 'up', '-d'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print_status("Docker services started successfully", "SUCCESS")
            
            # Wait for services to be ready
            print_status("Waiting for services to be ready...", "INFO")
            time.sleep(10)
            
            # Check service status
            result = subprocess.run(['docker-compose', 'ps'], 
                                  capture_output=True, text=True)
            print_status("Service status:", "INFO")
            print(result.stdout)
            
            return True
        else:
            print_status(f"Failed to start services: {result.stderr}", "ERROR")
            return False
            
    except subprocess.TimeoutExpired:
        print_status("Service start timed out", "ERROR")
        return False
    except Exception as e:
        print_status(f"Service start error: {e}", "ERROR")
        return False

def test_application_health():
    """Test application health endpoints"""
    print_status("Testing application health...", "INFO")
    
    endpoints = [
        ('http://localhost:8000/', 'Application root'),
        ('http://localhost:8000/login', 'Login page'),
        ('http://localhost:8000/favicon.ico', 'Favicon')
    ]
    
    success_count = 0
    for url, description in endpoints:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code in [200, 302]:  # 302 for redirects
                print_status(f"✅ {description}: {response.status_code}", "SUCCESS")
                success_count += 1
            else:
                print_status(f"❌ {description}: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            print_status(f"❌ {description}: Connection failed - {e}", "ERROR")
    
    if success_count == len(endpoints):
        print_status("All application endpoints healthy", "SUCCESS")
        return True
    else:
        print_status(f"Only {success_count}/{len(endpoints)} endpoints healthy", "WARNING")
        return False

def test_database_connection():
    """Test database connection"""
    print_status("Testing database connection...", "INFO")
    
    try:
        result = subprocess.run(['docker-compose', 'exec', '-T', 'mysql', 
                               'mysqladmin', 'ping', '-h', 'localhost'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print_status("Database connection successful", "SUCCESS")
            return True
        else:
            print_status(f"Database connection failed: {result.stderr}", "ERROR")
            return False
            
    except subprocess.TimeoutExpired:
        print_status("Database connection timed out", "ERROR")
        return False
    except Exception as e:
        print_status(f"Database connection error: {e}", "ERROR")
        return False

def test_ssl_setup():
    """Test SSL setup (if domain is configured)"""
    print_status("Testing SSL setup...", "INFO")
    
    # Check if domain is configured
    try:
        with open('.env', 'r') as f:
            env_content = f.read()
            
        if 'DOMAIN=' in env_content and 'localhost' not in env_content:
            print_status("Domain configured - SSL setup will be tested on deployment", "INFO")
            return True
        else:
            print_status("Local development - SSL not applicable", "INFO")
            return True
            
    except Exception as e:
        print_status(f"Could not check SSL setup: {e}", "WARNING")
        return True

def cleanup():
    """Clean up test environment"""
    print_status("Cleaning up test environment...", "INFO")
    
    try:
        subprocess.run(['docker-compose', 'down'], 
                      capture_output=True, text=True, timeout=30)
        print_status("Test environment cleaned up", "SUCCESS")
    except Exception as e:
        print_status(f"Cleanup error: {e}", "WARNING")

def main():
    """Main test function"""
    print_status("🐝 KBee Manager - Deployment Test Suite", "INFO")
    print_status("=" * 60, "INFO")
    
    tests = [
        ("Docker Installation", check_docker),
        ("Environment Setup", check_environment),
        ("Environment File", check_env_file),
        ("Docker Build", test_docker_build),
        ("Docker Start", test_docker_start),
        ("Application Health", test_application_health),
        ("Database Connection", test_database_connection),
        ("SSL Setup", test_ssl_setup)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print_status(f"\n--- {test_name} ---", "INFO")
        try:
            if test_func():
                passed += 1
                print_status(f"✅ {test_name} PASSED", "SUCCESS")
            else:
                print_status(f"❌ {test_name} FAILED", "ERROR")
        except Exception as e:
            print_status(f"❌ {test_name} ERROR: {e}", "ERROR")
    
    print_status("\n" + "=" * 60, "INFO")
    print_status(f"DEPLOYMENT TEST SUMMARY", "INFO")
    print_status(f"Tests passed: {passed}/{total}", "INFO")
    print_status(f"Success rate: {(passed/total*100):.1f}%", "INFO")
    
    if passed == total:
        print_status("🎉 All deployment tests passed! Ready for production!", "SUCCESS")
        print_status("\nNext steps:", "INFO")
        print_status("1. Update .env with your production values", "INFO")
        print_status("2. Configure your domain DNS", "INFO")
        print_status("3. Run: docker-compose up -d", "INFO")
        print_status("4. Access your application at https://your-domain.com", "INFO")
        return True
    else:
        print_status("❌ Some deployment tests failed. Please fix issues.", "ERROR")
        return False

if __name__ == '__main__':
    try:
        success = main()
    finally:
        cleanup()
    
    sys.exit(0 if success else 1)
