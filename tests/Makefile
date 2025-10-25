# KBee Manager Test Suite Makefile
# Provides easy commands to run different test suites

.PHONY: help all comprehensive user-flows ssl-network local local-start local-stop clean install-deps check-env

# Default target
help:
	@echo "🧪 KBee Manager Test Suite"
	@echo "=========================="
	@echo ""
	@echo "Available commands:"
	@echo "  make all              - Run all test suites"
	@echo "  make comprehensive    - Run comprehensive API tests"
	@echo "  make user-flows       - Run user flow tests"
	@echo "  make ssl-network      - Run SSL and network tests"
	@echo "  make local            - Run local tests (localhost)"
	@echo "  make local-start      - Start local services"
	@echo "  make local-stop       - Stop local services"
	@echo "  make check-env        - Check environment and services"
	@echo "  make install-deps     - Install test dependencies"
	@echo "  make clean            - Clean test artifacts"
	@echo "  make help             - Show this help message"
	@echo ""

# Run all test suites
all: check-env
	@echo "🚀 Running all test suites..."
	python3 run_all_tests.py --suite all

# Run comprehensive test suite
comprehensive: check-env
	@echo "🧪 Running comprehensive test suite..."
	python3 run_all_tests.py --suite comprehensive

# Run user flow tests
user-flows: check-env
	@echo "🎭 Running user flow tests..."
	python3 run_all_tests.py --suite user-flows

# Run SSL and network tests
ssl-network: check-env
	@echo "🔒 Running SSL and network tests..."
	python3 ssl_network_tests.py

# Run local tests
local: check-env
	@echo "🏠 Running local tests..."
	python3 run_local_tests.py

# Start local services
local-start:
	@echo "🚀 Starting local services..."
	docker-compose -f docker-compose.local.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 15
	@echo "✅ Local services started"

# Stop local services
local-stop:
	@echo "🛑 Stopping local services..."
	docker-compose -f docker-compose.local.yml down
	@echo "✅ Local services stopped"

# Check environment and services
check-env:
	@echo "🔍 Checking environment..."
	@python3 -c "import requests, ssl, socket; print('✅ Required modules available')" || (echo "❌ Missing required modules. Run 'make install-deps'" && exit 1)
	@echo "✅ Environment check passed"

# Install test dependencies
install-deps:
	@echo "📦 Installing test dependencies..."
	pip3 install requests urllib3
	@echo "✅ Dependencies installed"

# Clean test artifacts
clean:
	@echo "🧹 Cleaning test artifacts..."
	rm -f test_report_*.json
	rm -f master_test_report_*.json
	rm -f *.pyc
	rm -rf __pycache__
	@echo "✅ Cleanup completed"

# Quick test (just connectivity)
quick-test:
	@echo "⚡ Running quick connectivity test..."
	@python3 -c "\
import requests, urllib3; \
urllib3.disable_warnings(); \
try: \
    r = requests.get('https://khainguyenbee.io.vn', verify=False, timeout=5); \
    print('✅ Frontend: OK' if r.status_code == 200 else f'⚠️  Frontend: HTTP {r.status_code}'); \
except Exception as e: \
    print(f'❌ Frontend: {e}'); \
try: \
    r = requests.get('http://khainguyenbee.io.vn:8000', timeout=5); \
    print('✅ Backend: OK' if r.status_code == 200 else f'⚠️  Backend: HTTP {r.status_code}'); \
except Exception as e: \
    print(f'❌ Backend: {e}'); \
"

# Test with verbose output
test-verbose: check-env
	@echo "🔍 Running tests with verbose output..."
	python3 run_all_tests.py --suite all --verbose

# Test specific functionality
test-auth:
	@echo "🔐 Testing authentication flow..."
	python3 -c "\
import sys; sys.path.append('.'); \
from comprehensive_test_suite import TestAuthenticationFlow; \
import unittest; \
suite = unittest.TestLoader().loadTestsFromTestCase(TestAuthenticationFlow); \
runner = unittest.TextTestRunner(verbosity=2); \
result = runner.run(suite); \
exit(0 if result.wasSuccessful() else 1)"

test-api:
	@echo "🔗 Testing API endpoints..."
	python3 -c "\
import sys; sys.path.append('.'); \
from comprehensive_test_suite import TestBeehiveCRUD; \
import unittest; \
suite = unittest.TestLoader().loadTestsFromTestCase(TestBeehiveCRUD); \
runner = unittest.TextTestRunner(verbosity=2); \
result = runner.run(suite); \
exit(0 if result.wasSuccessful() else 1)"

# Continuous testing (run tests every 30 seconds)
watch:
	@echo "👀 Watching for changes and running tests..."
	@while true; do \
		echo "🔄 Running tests at $$(date)"; \
		make quick-test; \
		echo "⏳ Waiting 30 seconds..."; \
		sleep 30; \
	done

# Generate test report
report:
	@echo "📊 Generating test report..."
	python3 run_all_tests.py --suite all
	@echo "📄 Check the generated JSON report files for detailed results"

# Docker-based testing
test-docker:
	@echo "🐳 Running tests in Docker environment..."
	@echo "⚠️  This requires Docker to be running"
	docker-compose exec frontend python3 /app/tests/run_all_tests.py --suite all

# Performance testing
test-performance:
	@echo "⚡ Running performance tests..."
	python3 -c "\
import time, requests, urllib3; \
urllib3.disable_warnings(); \
urls = ['https://khainguyenbee.io.vn:8443', 'http://khainguyenbee.io.vn:8000']; \
for url in urls: \
    start = time.time(); \
    try: \
        r = requests.get(url, verify=False, timeout=10); \
        end = time.time(); \
        print(f'✅ {url}: {end-start:.2f}s (HTTP {r.status_code})'); \
    except Exception as e: \
        print(f'❌ {url}: {e}'); \
"
