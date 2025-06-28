#!/bin/bash

# Test alarm system by creating a quick test alarm

echo "🚨 AlarmPrep Notification Test Script 🚨"
echo "========================================"
echo ""
echo "This script helps test the alarm notification system."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in AlarmPrep directory. Please run from the project root."
    exit 1
fi

echo "📱 Testing Options:"
echo "1. Build and test for iOS"
echo "2. Test web version with dev server"
echo "3. View notification testing guide"
echo ""

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔨 Building for iOS..."
        npm run ios:build
        if [ $? -eq 0 ]; then
            echo "✅ Build successful!"
            echo "📱 Opening Xcode..."
            npm run ios:open
            echo ""
            echo "📋 To test notifications on iOS:"
            echo "1. Enable notification permissions when prompted"
            echo "2. Create an alarm for 1-2 minutes in the future"
            echo "3. Put app in background or lock phone"
            echo "4. Wait for notification to appear"
            echo "5. Tap notification to open alarm screen"
        else
            echo "❌ Build failed. Check the output above for errors."
        fi
        ;;
    2)
        echo "🌐 Starting development server..."
        echo "📋 To test on web:"
        echo "1. App will open in browser"
        echo "2. Click 'Test Alarm' button to simulate notification"
        echo "3. AlarmScreen should appear with a quiz question"
        echo "4. Test answering correctly and incorrectly"
        echo ""
        npm run dev
        ;;
    3)
        echo "📖 Opening notification testing guide..."
        if command -v open &> /dev/null; then
            open NOTIFICATION_SYSTEM_TESTING.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open NOTIFICATION_SYSTEM_TESTING.md
        else
            echo "📄 Please open NOTIFICATION_SYSTEM_TESTING.md manually"
        fi
        ;;
    *)
        echo "❌ Invalid option. Please choose 1, 2, or 3."
        ;;
esac
