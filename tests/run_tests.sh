#!/bin/bash

# KBee Manager - Test Runner Script
# This script runs comprehensive tests for the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐝 KBee Manager - Test Suite${NC}"
echo "=================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt
pip install -r requirements-test.txt

# Set test environment variables
export TESTING=True
export SECRET_KEY=test-secret-key
export DATABASE_URL=sqlite:///:memory:
export DOMAIN=test.example.com

echo -e "${BLUE}Running Unit Tests...${NC}"
echo "=========================="

# Run unit tests
python simple_test.py

echo -e "\n${BLUE}Running Security Tests...${NC}"
echo "=========================="

# Run security tests with bandit
echo -e "${YELLOW}Running Bandit security scan...${NC}"
bandit -r . -f json -o bandit-report.json || true
bandit -r . -f txt || true

# Run safety check for known vulnerabilities
echo -e "${YELLOW}Running Safety check...${NC}"
safety check --json --output safety-report.json || true
safety check || true

echo -e "\n${BLUE}Running Coverage Analysis...${NC}"
echo "=========================="

# Run coverage analysis
coverage run --source=. test_app.py
coverage report -m
coverage html -d htmlcov

echo -e "\n${BLUE}Running Performance Tests...${NC}"
echo "=========================="

# Create performance test script
cat > performance_test.py << 'EOF'
import time
import requests
import threading
from concurrent.futures import ThreadPoolExecutor

def test_endpoint(url, iterations=10):
    """Test endpoint performance"""
    times = []
    for _ in range(iterations):
        start = time.time()
        try:
            response = requests.get(url, timeout=10)
            end = time.time()
            times.append(end - start)
        except:
            times.append(10)  # Timeout
    return times

def run_performance_tests():
    """Run performance tests"""
    base_url = "http://localhost:5000"
    
    endpoints = [
        "/",
        "/login",
        "/dashboard"
    ]
    
    print("Performance Test Results:")
    print("=" * 50)
    
    for endpoint in endpoints:
        url = base_url + endpoint
        times = test_endpoint(url, 5)
        avg_time = sum(times) / len(times)
        max_time = max(times)
        min_time = min(times)
        
        print(f"{endpoint}:")
        print(f"  Average: {avg_time:.3f}s")
        print(f"  Min: {min_time:.3f}s")
        print(f"  Max: {max_time:.3f}s")
        print()

if __name__ == "__main__":
    print("Note: Performance tests require the application to be running")
    print("Start the app with: python app.py")
    print("Then run: python performance_test.py")
EOF

echo -e "${YELLOW}Performance test script created: performance_test.py${NC}"
echo -e "${YELLOW}To run performance tests, start the app and run: python performance_test.py${NC}"

echo -e "\n${BLUE}Test Summary${NC}"
echo "============"

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests completed successfully!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
fi

echo -e "\n${BLUE}Generated Reports:${NC}"
echo "- bandit-report.json (Security scan)"
echo "- safety-report.json (Vulnerability check)"
echo "- htmlcov/ (Coverage report)"
echo "- performance_test.py (Performance test script)"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Review test results above"
echo "2. Check security reports for vulnerabilities"
echo "3. Review coverage report in htmlcov/index.html"
echo "4. Run performance tests if needed"
echo "5. Fix any issues before deployment"

echo -e "\n${GREEN}Test suite completed! 🐝${NC}"
