#!/bin/bash

# Production Test Runner for KBee Manager
# Activates virtual environment and runs all production tests

echo "🚀 KBee Manager Production Test Runner"
echo "======================================"

# Check if virtual environment exists
if [ ! -d "test_env" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv test_env
    source test_env/bin/activate
    pip install requests PyJWT qrcode pillow
else
    echo "✅ Virtual environment found"
    source test_env/bin/activate
fi

echo "🐍 Python: $(python --version)"
echo "📦 Virtual environment activated"

# Check if production services are running
echo ""
echo "🏥 Checking Production Services..."
if curl -s -I https://khainguyenbee.io.vn > /dev/null; then
    echo "✅ Frontend HTTPS: OK"
else
    echo "❌ Frontend HTTPS: Not accessible"
    exit 1
fi

if curl -s -I http://khainguyenbee.io.vn:8000 > /dev/null; then
    echo "✅ Backend API: OK"
else
    echo "❌ Backend API: Not accessible"
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running Production Tests..."
echo "=============================="

cd tests

# Run comprehensive tests
echo ""
echo "📝 Running Comprehensive Tests..."
python3 run_all_tests.py --suite comprehensive

# Run SSL and network tests
echo ""
echo "🔒 Running SSL & Network Tests..."
python3 ssl_network_tests.py

# Run user flow tests
echo ""
echo "🎭 Running User Flow Tests..."
python3 run_all_tests.py --suite user-flows

echo ""
echo "🎉 Production tests completed!"
echo "Check the generated reports for detailed results."
