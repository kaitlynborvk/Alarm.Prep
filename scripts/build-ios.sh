#!/bin/bash

# Script to build iOS-optimized static version

echo "🍎 Building iOS static version..."

# Temporarily move API routes out of the way
if [ -d "src/app/api" ]; then
    echo "📁 Temporarily moving API routes..."
    mv src/app/api ./api_temp_backup
fi

# Temporarily move admin page
if [ -d "src/app/admin" ]; then
    echo "📁 Temporarily moving admin page..."
    mv src/app/admin ./admin_temp_backup
fi

# Build static version
echo "🔨 Building static export..."
NEXT_OUTPUT=export npm run build

# Restore API routes and admin
if [ -d "./api_temp_backup" ]; then
    echo "📁 Restoring API routes..."
    mv ./api_temp_backup src/app/api
fi

if [ -d "./admin_temp_backup" ]; then
    echo "📁 Restoring admin page..."
    mv ./admin_temp_backup src/app/admin
fi

echo "✅ iOS build complete! Files are in 'out/' directory"
