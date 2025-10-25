#!/bin/bash

# KBee Manager - Test Runner Script
# This script runs tests from the tests/ directory

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
pip install -r tests/requirements-test.txt

# Set test environment variables
export TESTING=True
export SECRET_KEY=test-secret-key
export DATABASE_URL=sqlite:///:memory:
export DOMAIN=test.example.com

echo -e "${BLUE}Running Unit Tests...${NC}"
echo "=========================="

# Run unit tests from tests directory
cd tests
python simple_test.py
cd ..

echo -e "\n${BLUE}Running Security Tests...${NC}"
echo "=========================="

# Run security tests with bandit
echo -e "${YELLOW}Running Bandit security scan...${NC}"
bandit -r . -f json -o tests/bandit-report.json || true
bandit -r . -f txt || true

# Run safety check for known vulnerabilities
echo -e "${YELLOW}Running Safety check...${NC}"
safety check --json --output tests/safety-report.json || true
safety check || true

echo -e "\n${BLUE}Running Coverage Analysis...${NC}"
echo "=========================="

# Run coverage analysis
coverage run --source=. tests/simple_test.py
coverage report -m
coverage html -d htmlcov

echo -e "\n${BLUE}Test Summary${NC}"
echo "============"

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests completed successfully!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
fi

echo -e "\n${BLUE}Generated Reports:${NC}"
echo "- tests/bandit-report.json (Security scan)"
echo "- tests/safety-report.json (Vulnerability check)"
echo "- htmlcov/ (Coverage report)"
echo "- tests/TEST_SUMMARY.md (Test documentation)"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Review test results above"
echo "2. Check security reports for vulnerabilities"
echo "3. Review coverage report in htmlcov/index.html"
echo "4. Run deployment tests if needed: python tests/test_deployment.py"
echo "5. Fix any issues before deployment"

echo -e "\n${GREEN}Test suite completed! 🐝${NC}"
