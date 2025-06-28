// iOS-specific utilities for Capacitor
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export class IOSService {
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Request notification permissions
  static async requestNotificationPermissions(): Promise<boolean> {
    if (!this.isNative()) return true; // Web doesn't need explicit permission

    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Schedule an alarm notification
  static async scheduleAlarm(
    id: number,
    title: string,
    body: string,
    time: Date,
    recurring: boolean = false
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestNotificationPermissions();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: {
              at: time,
              repeats: recurring
            },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample'
          }
        ]
      });

      return true;
    } catch (error) {
      console.error('Failed to schedule alarm:', error);
      return false;
    }
  }

  // Cancel an alarm
  static async cancelAlarm(id: number): Promise<boolean> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
      return true;
    } catch (error) {
      console.error('Failed to cancel alarm:', error);
      return false;
    }
  }

  // Get all pending notifications
  static async getPendingAlarms(): Promise<any[]> {
    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch (error) {
      console.error('Failed to get pending alarms:', error);
      return [];
    }
  }

  // Handle notification taps
  static setupNotificationHandlers(onAlarmTrigger: (notification: any) => void) {
    if (!this.isNative()) return;

    LocalNotifications.addListener('localNotificationActionPerformed', (notification: any) => {
      onAlarmTrigger(notification);
    });
  }
}
