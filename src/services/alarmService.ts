import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { dataService, Question } from './dataService';

export interface AlarmConfig {
  id: number;
  time: string; // HH:MM format
  days: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  examType: 'GMAT' | 'LSAT';
  questionType: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  isActive: boolean;
  name?: string;
}

export interface AlarmInstance {
  alarmId: number;
  scheduledTime: Date;
  question: Question;
  isActive: boolean;
}

class AlarmService {
  private activeAlarms: Map<number, AlarmInstance> = new Map();
  private alarmConfigs: AlarmConfig[] = [];
  private readonly STORAGE_KEY = 'alarmprep_alarms';
  private readonly ACTIVE_ALARM_KEY = 'alarmprep_active_alarm';

  constructor() {
    this.loadAlarms();
    this.setupNotificationHandlers();
  }

  // Initialize alarm system
  async initialize(): Promise<boolean> {
    try {
      // Request notification permissions
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.error('Notification permission denied');
        return false;
      }

      // Check if running on device
      if (Capacitor.isNativePlatform()) {
        console.log('Alarm service initialized on native platform');
      } else {
        console.log('Alarm service initialized on web platform');
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize alarm service:', error);
      return false;
    }
  }

  // Setup notification event handlers
  private setupNotificationHandlers() {
    LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
      console.log('Notification tapped:', notification);
      await this.handleAlarmTrigger(notification.notification);
    });

    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
    });
  }

  // Create a new alarm
  async createAlarm(config: Omit<AlarmConfig, 'id'>): Promise<number> {
    const id = Date.now(); // Simple ID generation
    const alarm: AlarmConfig = { ...config, id };
    
    this.alarmConfigs.push(alarm);
    await this.saveAlarms();
    
    if (alarm.isActive) {
      await this.scheduleAlarmNotifications(alarm);
    }
    
    return id;
  }

  // Update existing alarm
  async updateAlarm(id: number, updates: Partial<AlarmConfig>): Promise<boolean> {
    const index = this.alarmConfigs.findIndex(alarm => alarm.id === id);
    if (index === -1) return false;

    // Cancel existing notifications for this alarm
    await this.cancelAlarmNotifications(id);

    // Update the alarm
    this.alarmConfigs[index] = { ...this.alarmConfigs[index], ...updates };
    await this.saveAlarms();

    // Reschedule if active
    if (this.alarmConfigs[index].isActive) {
      await this.scheduleAlarmNotifications(this.alarmConfigs[index]);
    }

    return true;
  }

  // Delete alarm
  async deleteAlarm(id: number): Promise<boolean> {
    await this.cancelAlarmNotifications(id);
    this.alarmConfigs = this.alarmConfigs.filter(alarm => alarm.id !== id);
    await this.saveAlarms();
    return true;
  }

  // Schedule notifications for an alarm
  private async scheduleAlarmNotifications(alarm: AlarmConfig) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    const now = new Date();
    
    console.log(`Scheduling alarm ${alarm.id} for ${alarm.time} on days:`, alarm.days);
    
    // Schedule for the next 30 days
    for (let day = 0; day < 30; day++) {
      const scheduleDate = new Date(now);
      scheduleDate.setDate(now.getDate() + day);
      scheduleDate.setHours(hours, minutes, 0, 0);
      
      // Only schedule if the day of week is selected
      const dayOfWeek = scheduleDate.getDay();
      if (!alarm.days[dayOfWeek]) continue;
      
      // Don't schedule for past times today
      if (day === 0 && scheduleDate <= now) continue;

      try {
        // Get a question for this alarm
        const question = await dataService.getRandomQuestion({
          exam: alarm.examType,
          type: alarm.questionType,
          difficulty: alarm.difficulty
        });

        if (!question) {
          console.error('No question found for alarm criteria');
          continue;
        }

        const notificationId = parseInt(`${alarm.id}${day.toString().padStart(2, '0')}`);
        
        console.log(`Scheduling notification ${notificationId} for ${scheduleDate.toISOString()}`);
        
        await LocalNotifications.schedule({
          notifications: [{
            id: notificationId,
            title: '🚨 AlarmPrep Quiz Time!',
            body: `Time to practice ${alarm.examType}! Answer correctly to turn off the alarm.`,
            schedule: { at: scheduleDate },
            sound: 'default',
            extra: {
              alarmId: alarm.id,
              questionId: question.id,
              examType: alarm.examType,
              isAlarmNotification: true
            }
          }]
        });

        console.log(`Successfully scheduled alarm ${alarm.id} for ${scheduleDate.toISOString()}`);
      } catch (error) {
        console.error('Failed to schedule notification:', error);
      }
    }
  }

  // Cancel all notifications for an alarm
  private async cancelAlarmNotifications(alarmId: number) {
    try {
      const pending = await LocalNotifications.getPending();
      const alarmNotifications = pending.notifications.filter(n => 
        n.extra?.alarmId === alarmId
      );
      
      if (alarmNotifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: alarmNotifications.map(n => ({ id: parseInt(n.id.toString()) }))
        });
      }
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  // Handle when alarm notification is triggered
  private async handleAlarmTrigger(notification: LocalNotificationSchema) {
    try {
      const { alarmId, questionId, examType } = notification.extra || {};
      
      if (!alarmId || !questionId) {
        console.error('Invalid alarm notification data');
        return;
      }

      // Get the question
      const questions = await dataService.getQuestions();
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        console.error('Question not found for alarm');
        return;
      }

      // Create active alarm instance
      const alarmInstance: AlarmInstance = {
        alarmId,
        scheduledTime: new Date(),
        question,
        isActive: true
      };

      // Store active alarm
      this.activeAlarms.set(alarmId, alarmInstance);
      await this.saveActiveAlarm(alarmInstance);

      // Trigger haptic feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }

      // Navigate to alarm screen or show modal
      this.showAlarmScreen(alarmInstance);

    } catch (error) {
      console.error('Failed to handle alarm trigger:', error);
    }
  }

  // Show the alarm screen (this will trigger navigation in the main app)
  private showAlarmScreen(alarmInstance: AlarmInstance) {
    // Dispatch custom event that the main app can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alarmTriggered', {
        detail: alarmInstance
      }));
    }
  }

  // Answer alarm question
  async answerAlarmQuestion(alarmId: number, answer: string): Promise<boolean> {
    const alarmInstance = this.activeAlarms.get(alarmId);
    if (!alarmInstance) {
      console.error('No alarm instance found for ID:', alarmId);
      return false;
    }

    console.log('Answer validation:');
    console.log('User answer:', answer);
    console.log('Correct answer:', alarmInstance.question.correctAnswer);
    console.log('Question:', alarmInstance.question.text);
    console.log('Choices:', alarmInstance.question.choices);

    const isCorrect = answer === alarmInstance.question.correctAnswer;
    console.log('Is correct:', isCorrect);
    
    if (isCorrect) {
      // Correct answer - dismiss alarm
      await this.dismissAlarm(alarmId);
      
      // Success haptic feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } else {
      // Wrong answer - keep alarm active, maybe add snooze
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
    }

    return isCorrect;
  }

  // Dismiss alarm (after correct answer)
  async dismissAlarm(alarmId: number) {
    this.activeAlarms.delete(alarmId);
    
    // Clear from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.ACTIVE_ALARM_KEY}_${alarmId}`);
    }

    // Dispatch event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alarmDismissed', {
        detail: { alarmId }
      }));
    }
  }

  // Snooze alarm (reschedule for 5 minutes later)
  async snoozeAlarm(alarmId: number): Promise<boolean> {
    const alarmInstance = this.activeAlarms.get(alarmId);
    if (!alarmInstance) return false;

    try {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);

      await LocalNotifications.schedule({
        notifications: [{
          id: parseInt(`${alarmId}999`), // Special snooze ID
          title: '🚨 AlarmPrep - Snoozed',
          body: 'Time to try again! Answer correctly to turn off the alarm.',
          schedule: { at: snoozeTime },
          sound: 'default',
          extra: {
            alarmId,
            questionId: alarmInstance.question.id,
            isSnooze: true,
            isAlarmNotification: true
          }
        }]
      });

      return true;
    } catch (error) {
      console.error('Failed to snooze alarm:', error);
      return false;
    }
  }

  // Test method to schedule an immediate alarm (for development testing)
  async scheduleTestAlarm(delaySeconds: number = 10): Promise<number> {
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + delaySeconds);
    
    const testAlarm: AlarmConfig = {
      id: 9999,
      time: `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`,
      days: [true, true, true, true, true, true, true], // All days
      examType: 'GMAT',
      questionType: 'quantitative',
      difficulty: 'easy',
      isActive: true,
      name: 'Test Alarm'
    };

    try {
      // Get a test question
      const question = await dataService.getRandomQuestion({
        exam: 'GMAT',
        type: 'quantitative',
        difficulty: 'easy'
      });

      if (!question) {
        throw new Error('No test question available');
      }

      console.log(`Scheduling test alarm for ${testTime.toISOString()}`);

      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title: '🚨 AlarmPrep Test Alarm!',
          body: 'This is a test alarm. Tap to answer the quiz!',
          schedule: { at: testTime },
          sound: 'default',
          extra: {
            alarmId: 9999,
            questionId: question.id,
            examType: 'GMAT',
            isAlarmNotification: true,
            isTestAlarm: true
          }
        }]
      });

      console.log('Test alarm scheduled successfully');
      return 9999;
    } catch (error) {
      console.error('Failed to schedule test alarm:', error);
      throw error;
    }
  }

  // Add a test alarm instance (for development testing)
  addTestAlarmInstance(alarmInstance: AlarmInstance) {
    this.activeAlarms.set(alarmInstance.alarmId, alarmInstance);
  }

  // Get all alarms
  getAlarms(): AlarmConfig[] {
    return [...this.alarmConfigs];
  }

  // Get active alarm instances
  getActiveAlarms(): AlarmInstance[] {
    return Array.from(this.activeAlarms.values());
  }

  // Save alarms to storage
  private async saveAlarms() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.alarmConfigs));
    }
  }

  // Load alarms from storage
  private loadAlarms() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.alarmConfigs = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load alarms:', error);
      }
    }
  }

  // Save active alarm instance
  private async saveActiveAlarm(alarm: AlarmInstance) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `${this.ACTIVE_ALARM_KEY}_${alarm.alarmId}`, 
        JSON.stringify(alarm)
      );
    }
  }

  // Load active alarms on startup
  async loadActiveAlarms() {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.ACTIVE_ALARM_KEY)
      );

      for (const key of keys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const alarm: AlarmInstance = JSON.parse(stored);
          this.activeAlarms.set(alarm.alarmId, alarm);
        }
      }
    } catch (error) {
      console.error('Failed to load active alarms:', error);
    }
  }
}

// Create singleton instance
export const alarmService = new AlarmService();
