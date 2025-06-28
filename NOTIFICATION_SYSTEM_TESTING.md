# Alarm Notification System Testing Guide

## Overview
The AlarmPrep app now includes a comprehensive alarm/notification system that triggers quiz questions at scheduled times. This guide explains how to test and verify the system works correctly.

## System Components

### 1. Alarm Service (`alarmService.ts`)
- Manages alarm creation, scheduling, and triggering
- Uses Capacitor LocalNotifications for native iOS notifications
- Handles alarm instances and question delivery
- Supports snooze functionality

### 2. Alarm Screen (`AlarmScreen.tsx`)
- Full-screen modal that appears when alarm triggers
- Displays question with multiple choice answers
- Requires correct answer to dismiss alarm
- Includes snooze option (5 minutes)

### 3. Main App Integration (`page.tsx`)
- Initializes alarm service on app start
- Listens for alarm trigger events
- Shows AlarmScreen when alarm activates
- Manages alarm CRUD operations

## Testing the Notification System

### Web Testing (Development)
1. **Start the dev server**: `npm run dev`
2. **Open the app**: Click the "Test Alarm" button
3. **Verify**: AlarmScreen should appear with a question
4. **Test answers**: 
   - Wrong answer → Shows error, alarm continues
   - Correct answer → Shows success, alarm dismisses
5. **Test snooze**: Should close alarm and reschedule

### iOS Testing (Native)

#### Prerequisites
1. **Build for iOS**: `npm run ios:build`
2. **Open in Xcode**: `npm run ios:open`
3. **Enable notifications**: Allow notification permissions when prompted

#### Test Scenarios

##### 1. Create Real Alarm
```
1. Set alarm for 1-2 minutes in the future
2. Select exam type (GMAT/LSAT)
3. Choose question type and difficulty
4. Save alarm
5. Lock phone/put app in background
6. Wait for scheduled time
```

##### 2. Notification Behavior
- **Notification appears**: Should show on lock screen
- **Tap notification**: Should open app and show AlarmScreen
- **Background trigger**: Should work even when app is closed

##### 3. Alarm Screen Testing
- **Question display**: Should show proper exam question
- **Answer selection**: Should allow selecting answers
- **Wrong answer**: Shows error, haptic feedback, alarm continues
- **Correct answer**: Shows success, haptic feedback, dismisses alarm
- **Snooze**: Reschedules alarm for 5 minutes later

#### Verification Points

✅ **Notification Permissions**: App requests and receives notification permissions  
✅ **Alarm Scheduling**: Alarms are scheduled in iOS notification system  
✅ **Background Triggering**: Notifications fire when app is backgrounded  
✅ **Foreground Handling**: Events trigger AlarmScreen when app is active  
✅ **Question Loading**: Questions load correctly from database/cache  
✅ **Answer Validation**: Correct/incorrect answers handled properly  
✅ **Haptic Feedback**: Device vibrates on interactions  
✅ **Snooze Functionality**: Snooze reschedules notifications  
✅ **Persistence**: Alarms survive app restarts  

## Debugging Tips

### Check Console Logs
- Alarm service initialization
- Notification scheduling
- Event triggering
- Question loading

### Verify iOS Notifications
1. Open iOS Settings → Notifications → AlarmPrep
2. Ensure notifications are enabled
3. Check notification history

### Test with Short Intervals
- Create alarms 1-2 minutes in the future
- Use test button for immediate testing
- Check iOS notification center

## Known Limitations

### iOS Restrictions
- **Background Processing**: iOS may limit background execution
- **Notification Limits**: iOS has notification scheduling limits
- **Battery Optimization**: Low power mode may affect timing
- **Focus Modes**: Do Not Disturb may block notifications

### Development vs Production
- **Simulator**: May not fully replicate notification behavior
- **Device Testing**: Always test on real iOS device
- **Background Refresh**: Ensure app has background refresh enabled

## Troubleshooting

### Notifications Not Appearing
1. Check notification permissions
2. Verify alarm is active in app
3. Check iOS notification settings
4. Test with immediate alarm (1-2 minutes)

### AlarmScreen Not Showing
1. Check console for event listeners
2. Verify alarm service initialization
3. Test with "Test Alarm" button
4. Check for JavaScript errors

### Questions Not Loading
1. Verify database connection
2. Check offline fallback questions
3. Test dataService independently
4. Verify question format matches interface

## Production Deployment

### iOS App Store
- Request notification permissions in app description
- Test thoroughly on multiple iOS versions
- Verify background refresh works
- Include notification usage in privacy policy

### User Experience
- Clear onboarding for notification permissions
- Explain alarm behavior to users
- Provide troubleshooting in app help
- Allow users to test alarm system

## Next Steps

1. **Remove Test Button**: Remove "Test Alarm" button before production
2. **Enhanced Error Handling**: Add more robust error recovery
3. **Analytics**: Track alarm usage and success rates
4. **Customization**: Allow custom snooze times
5. **Sound Options**: Implement custom alarm sounds
6. **Multi-Platform**: Test on Android with Capacitor

## Support

For issues with the notification system:
1. Check this guide first
2. Verify iOS device settings
3. Test with simple alarms
4. Review console logs for errors
5. Test on physical iOS device
