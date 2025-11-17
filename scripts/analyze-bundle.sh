#!/bin/bash

# Bundle Analysis Script for Next.js App
# This script builds the app and shows bundle size analysis

echo "🔍 Building Next.js app for production..."
echo ""

# Build the app
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📊 Bundle Analysis Summary:"
echo "================================"
echo ""
echo "Check the output above for:"
echo "  • First Load JS - Size of JavaScript needed for initial page load"
echo "  • Route segments - Individual page bundle sizes"
echo "  • Shared chunks - Common code split across routes"
echo ""
echo "💡 Tips for optimization:"
echo "  • Pages with ⚠️  are larger than recommended"
echo "  • Look for pages with high 'First Load JS' values"
echo "  • Shared chunks should be reasonable in size"
echo ""
echo "🎯 Target metrics:"
echo "  • First Load JS: < 100 KB (excellent), < 200 KB (good)"
echo "  • Individual routes: < 50 KB (excellent), < 100 KB (good)"
echo ""
