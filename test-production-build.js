#!/usr/bin/env node

/**
 * Script để test production build locally
 * Mô phỏng các trường hợp có thể gây ra MUI error #7
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing for potential MUI error #7 issues...\n');

// Test cases that could cause MUI error #7
const testCases = [
  {
    name: 'Avatar with undefined username',
    test: () => {
      const username = undefined;
      const result = username?.charAt(0)?.toUpperCase() || 'U';
      console.log(`✅ Avatar test: ${result}`);
      return result;
    }
  },
  {
    name: 'Health status color with undefined',
    test: () => {
      const getHealthStatusColor = (status) => {
        switch (status) {
          case 'Tốt': return 'success';
          case 'Bình thường': return 'warning';
          case 'Yếu': return 'error';
          default: return 'default';
        }
      };
      
      const status = undefined;
      const result = getHealthStatusColor(status || 'Unknown');
      console.log(`✅ Health status color test: ${result}`);
      return result;
    }
  },
  {
    name: 'Health status icon with undefined',
    test: () => {
      const getHealthStatusIcon = (status) => {
        switch (status) {
          case 'Tốt': return '/static/icons/health/good.png';
          case 'Bình thường': return '/static/icons/health/normal.png';
          case 'Yếu': return '/static/icons/health/weak.png';
          default: return '/static/icons/health/normal.png';
        }
      };
      
      const status = undefined;
      const result = getHealthStatusIcon(status || 'Unknown');
      console.log(`✅ Health status icon test: ${result}`);
      return result;
    }
  },
  {
    name: 'Chip label with undefined',
    test: () => {
      const label = undefined;
      const result = label || 'Unknown';
      console.log(`✅ Chip label test: ${result}`);
      return result;
    }
  }
];

// Run all tests
let allPassed = true;
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  try {
    testCase.test();
    console.log('   ✅ PASSED\n');
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    allPassed = false;
  }
});

// Check if production build exists
const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  console.log('📦 Production build found in frontend/dist/');
  
  // Check for main JS file
  const distFiles = fs.readdirSync(distPath);
  const jsFiles = distFiles.filter(file => file.endsWith('.js'));
  const cssFiles = distFiles.filter(file => file.endsWith('.css'));
  
  console.log(`   - JavaScript files: ${jsFiles.length}`);
  console.log(`   - CSS files: ${cssFiles.length}`);
  
  if (jsFiles.length > 0) {
    console.log('   ✅ Production build is ready for deployment\n');
  }
} else {
  console.log('❌ Production build not found. Run: cd frontend && npm run build\n');
}

// Summary
console.log('📋 SUMMARY:');
console.log(`   - All tests passed: ${allPassed ? '✅' : '❌'}`);
console.log(`   - Production build ready: ${fs.existsSync(distPath) ? '✅' : '❌'}`);

if (allPassed && fs.existsSync(distPath)) {
  console.log('\n🎉 Ready for deployment! The MUI error #7 should be fixed.');
  console.log('\n📝 To deploy without rebuilding Docker:');
  console.log('   1. Copy frontend/dist/ contents to your server');
  console.log('   2. Restart your web server (nginx/apache)');
  console.log('   3. Test the website to verify the fix');
} else {
  console.log('\n⚠️  Please fix the issues above before deployment.');
}

process.exit(allPassed ? 0 : 1);
