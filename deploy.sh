#!/bin/bash

echo "🚀 Deploying ScholarVault..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start the production server
    echo "🌐 Starting production server..."
    npm start
else
    echo "❌ Build failed!"
    exit 1
fi
