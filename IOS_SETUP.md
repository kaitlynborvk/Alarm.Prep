# iOS App Setup Guide

## 🍎 Building AlarmPrep for iOS

This guide will help you build and deploy the AlarmPrep app on iOS devices.

### Prerequisites

1. **macOS with Xcode installed**
2. **Apple Developer Account** (for device testing and App Store)
3. **iOS device or simulator**

### Step 1: Install Xcode

1. Download Xcode from the Mac App Store
2. Install iOS simulators through Xcode preferences
3. Accept Xcode license: `sudo xcodebuild -license accept`

### Step 2: Build the Static App

```bash
# Build the static version (excludes admin pages)
npm run build:static

# Verify the build
ls -la out/
```

### Step 3: Sync iOS Project

```bash
# Sync Capacitor with iOS
npm run ios:build

# This runs:
# 1. NEXT_OUTPUT=export next build
# 2. npx cap sync ios
```

### Step 4: Open in Xcode

```bash
# Open the iOS project in Xcode
npm run ios:open

# Or manually:
# npx cap open ios
```

### Step 5: Configure iOS Project

In Xcode:

1. **Set Bundle Identifier**
   - Select the project in navigator
   - Change Bundle Identifier to your unique ID
   - Example: `com.yourname.alarmprep`

2. **Set Team (for device deployment)**
   - Select your Apple Developer team
   - Required for running on physical devices

3. **Configure Capabilities**
   - Background Modes: Enable "Background processing"
   - Push Notifications: Enable if using remote notifications

### Step 6: Test on Simulator

1. Select an iOS simulator (iPhone 14, etc.)
2. Click the "Play" button in Xcode
3. Test alarm functionality

### Step 7: Test on Device

1. Connect your iOS device via USB
2. Select your device in Xcode
3. Click "Play" button
4. Accept developer app on device (Settings > General > VPN & Device Management)

### App Architecture

#### Static App (iOS)
- **Main quiz interface** - Works offline
- **Local question cache** - Downloaded questions stored locally
- **Local notifications** - iOS native alarms
- **Settings & stats** - Local storage

#### Dynamic Admin (Web Only)
- **Question management** - Add/edit/delete questions
- **Database access** - Live connection to Railway PostgreSQL
- **Web interface** - Not included in iOS build

### Key Features for iOS

#### Offline Support
- Questions cached locally
- App works without internet
- Automatic sync when online

#### Native Notifications
- iOS local notifications for alarms
- Custom alarm sounds
- Snooze functionality

#### Background Processing
- Alarms work when app is closed
- Background question refresh

### Deployment Options

#### TestFlight (Beta Testing)
1. Archive app in Xcode
2. Upload to App Store Connect
3. Add testers via TestFlight

#### App Store
1. Complete app review guidelines
2. Submit for review
3. Release to App Store

### Troubleshooting

#### Build Issues
```bash
# Clean and rebuild
rm -rf out/ node_modules/
npm install
npm run ios:build
```

#### Notification Issues
- Check permissions in iOS Settings
- Verify Background App Refresh is enabled
- Test on physical device (simulator limitations)

#### Cache Issues
```bash
# Clear iOS cache
npx cap copy ios
npx cap sync ios
```

### Development Workflow

1. **Develop features** - Use `npm run dev`
2. **Test admin** - Web browser for database features
3. **Test iOS** - `npm run ios:build && npm run ios:open`
4. **Deploy** - Upload to TestFlight/App Store

### Admin vs iOS App

| Feature | iOS App | Web Admin |
|---------|---------|-----------|
| Quiz Interface | ✅ | ✅ |
| Offline Mode | ✅ | ❌ |
| Native Alarms | ✅ | ❌ |
| Question Management | ❌ | ✅ |
| Database Access | Cache Only | Live |
| Question Creation | ❌ | ✅ |

The iOS app is optimized for the end-user experience with offline support and native features, while the admin interface remains web-based for content management.
