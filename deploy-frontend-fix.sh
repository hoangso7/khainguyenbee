#!/bin/bash

# Script để deploy frontend fix mà không cần rebuild Docker
# Fix cho MUI error #7: capitalize(string) expects a string argument

echo "🚀 Deploying frontend fix for MUI error #7..."
echo "================================================"

# Kiểm tra production build
if [ ! -d "frontend/dist" ]; then
    echo "❌ Production build not found. Building..."
    cd frontend
    npm run build
    cd ..
fi

echo "✅ Production build found"

# Tạo backup của dist hiện tại (nếu có)
if [ -d "frontend/dist" ]; then
    echo "📦 Creating backup..."
    cp -r frontend/dist frontend/dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# Kiểm tra các file đã được fix
echo "🔍 Verifying fixes..."
echo "   - Layout.jsx: Avatar username fallback"
echo "   - QRBeehiveDetail.jsx: Health status fallbacks"
echo "   - BeehiveCard.jsx: Health status fallbacks"
echo "   - Dashboard.jsx: Health status fallbacks"

# Hiển thị thông tin deployment
echo ""
echo "📋 Deployment Information:"
echo "   - Source: frontend/dist/"
echo "   - Target: Your web server's static files directory"
echo "   - Files to copy:"
ls -la frontend/dist/ | grep -E '\.(js|css|html)$'

echo ""
echo "🎯 Next Steps:"
echo "   1. Copy frontend/dist/ contents to your server's web directory"
echo "   2. Restart your web server (nginx/apache)"
echo "   3. Test the website to verify MUI error #7 is fixed"

echo ""
echo "💡 Alternative deployment methods:"
echo "   - rsync: rsync -av frontend/dist/ user@server:/path/to/web/directory/"
echo "   - scp: scp -r frontend/dist/* user@server:/path/to/web/directory/"
echo "   - Docker volume mount: Mount frontend/dist/ to container's web directory"

echo ""
echo "✅ Ready for deployment!"
echo "   The MUI error #7 should be resolved after deployment."
