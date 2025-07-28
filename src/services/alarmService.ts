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
  subcategory?: string; // "Random" means pick from all subcategories
  difficulty: 'easy' | 'intermediate' | 'hard';
  isActive: boolean;
  name?: string;
}

export interface AlarmInstance {
  alarmId: number;
  scheduledTime: Date;
  originalAlarmTime: string; // HH:MM format from alarm config
  question: Question;
  isActive: boolean;
}

class AlarmService {
  private activeAlarms: Map<number, AlarmInstance> = new Map();
  private alarmConfigs: AlarmConfig[] = [];
  private readonly STORAGE_KEY = 'alarmprep_alarms';
  private readonly ACTIVE_ALARM_KEY = 'alarmprep_active_alarm';
  private currentAlarmAudio: any = null; // Store current audio context/elements
  private lastTriggeredAlarms: Map<number, number> = new Map(); // Track last trigger time for each alarm
  private audioContext: AudioContext | null = null; // Store audio context for reuse

  constructor() {
    this.loadAlarms();
    this.setupNotificationHandlers();
    this.initializeAudioForMobile();
  }

  // Initialize audio context on user interaction (mobile-friendly)
  private initializeAudioForMobile() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        try {
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log('Audio context created for mobile');
          }
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
              console.log('Audio context unlocked for mobile');
            });
          }
        } catch (error) {
          console.error('Failed to initialize audio for mobile:', error);
        }
        
        // Remove listeners after first successful interaction
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      };

      // Add listeners for user interaction
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('click', unlockAudio, { once: true });
    }
  }

  // Initialize alarm system
  async initialize(): Promise<boolean> {
    try {
      // Check if running on web platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Alarm service initialized on web platform - using browser notifications');
        // For web, we'll use a different approach
        this.setupWebAlarmSystem();
        return true;
      }

      // Request notification permissions for native platforms
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.error('Notification permission denied');
        return false;
      }

      console.log('Alarm service initialized on native platform');
      return true;
    } catch (error) {
      console.error('Failed to initialize alarm service:', error);
      return false;
    }
  }

  // Web-specific alarm system
  private setupWebAlarmSystem() {
    console.log('🚀 Setting up web alarm system...');
    
    // Load existing alarms
    this.scheduleWebAlarms();
    
    // Set up ROBUST periodic check (every 10 seconds for maximum reliability)
    const checkInterval = setInterval(() => {
      this.checkWebAlarms();
    }, 10000); // Check every 10 seconds - more frequent for reliability
    
    // Also check every second during the exact minute an alarm should trigger
    setInterval(() => {
      this.checkWebAlarmsHighFreq();
    }, 1000); // Every second check for precise timing
    
    // Also do an immediate check
    setTimeout(() => {
      console.log('Doing initial alarm check...');
      this.checkWebAlarms();
    }, 1000);
    
    console.log(`✅ Web alarm system initialized with ${this.alarmConfigs.length} alarms`);
    console.log('🔄 Checking every 10 seconds + high-frequency checks during alarm minutes');
    this.logActiveAlarms();
  }

  // Log current active alarms for debugging
  private logActiveAlarms() {
    if (this.alarmConfigs.length === 0) {
      console.log('📅 No alarms configured');
      return;
    }
    
    console.log('📅 Active alarms:');
    this.alarmConfigs.forEach(alarm => {
      if (alarm.isActive) {
        console.log(`  ⏰ Alarm ${alarm.id}: ${alarm.time} on ${this.getDayNames(alarm.days)} (${alarm.examType} - ${alarm.questionType})`);
      }
    });
  }

  // Check for web alarms that should trigger (standard frequency)
  private checkWebAlarms() {
    const now = new Date();
    console.log(`🔍 Checking web alarms at: ${now.toTimeString()}`);
    this.performAlarmCheck(now, false);
  }

  // High-frequency check during alarm minutes (every second)
  private checkWebAlarmsHighFreq() {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    
    // Only do high-freq logging if we're within an alarm minute
    const hasAlarmThisMinute = this.alarmConfigs.some(alarm => {
      if (!alarm.isActive) return false;
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const alarmMinute = hours * 60 + minutes;
      const dayOfWeek = now.getDay();
      return alarm.days[dayOfWeek] && currentMinute === alarmMinute;
    });
    
    if (hasAlarmThisMinute) {
      console.log(`⚡ High-freq check at: ${now.toTimeString()} (alarm minute detected)`);
    }
    
    this.performAlarmCheck(now, true);
  }

  // Unified alarm checking logic
  private performAlarmCheck(now: Date, isHighFreq: boolean) {
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    
    for (const alarm of this.alarmConfigs) {
      if (!alarm.isActive) {
        if (!isHighFreq) console.log(`Alarm ${alarm.id} is not active, skipping`);
        continue;
      }
      
      // Check if alarm is already active (question screen showing)
      if (this.activeAlarms.has(alarm.id)) {
        if (!isHighFreq) console.log(`Alarm ${alarm.id} is already active, skipping`);
        continue;
      }
      
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const alarmMinute = hours * 60 + minutes;
      const dayOfWeek = now.getDay();
      
      // Check if it's the right day and exact minute
      if (alarm.days[dayOfWeek] && currentMinute === alarmMinute) {
        
        // Prevent duplicate triggers within the same minute
        const lastTriggered = this.lastTriggeredAlarms.get(alarm.id) || 0;
        const timeSinceLastTrigger = now.getTime() - lastTriggered;
        
        if (timeSinceLastTrigger < 50000) { // 50 seconds cooldown
          if (!isHighFreq) console.log(`Alarm ${alarm.id} was recently triggered, skipping (${timeSinceLastTrigger}ms ago)`);
          continue;
        }
        
        console.log(`🚨 ALARM TRIGGERED! ${alarm.id} at ${now.toTimeString()}`);
        console.log(`Alarm schedule: ${alarm.time} on ${this.getDayNames(alarm.days)}`);
        
        // Mark as triggered
        this.lastTriggeredAlarms.set(alarm.id, now.getTime());
        
        // Trigger the alarm with offline support
        this.triggerWebAlarmRobust(alarm);
      }
    }
  }

  // Helper method to get day names for logging
  private getDayNames(days: boolean[]): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((active, index) => active ? dayNames[index] : null)
               .filter(day => day !== null)
               .join(', ');
  }

  // Robust alarm trigger with offline support
  private async triggerWebAlarmRobust(alarm: AlarmConfig) {
    console.log('=== ROBUST triggerWebAlarm started ===');
    console.log('Alarm config:', alarm);
    
    try {
      // ALWAYS play alarm sound first - this works offline
      console.log('🔊 Starting alarm sound (offline-capable)...');
      this.playAlarmSound();
      
      // Try to show browser notification (works offline)
      this.showOfflineCapableNotification(alarm);
      
      // Try to get a question with offline fallback
      let question = await this.getQuestionWithOfflineFallback(alarm);
      
      if (!question) {
        console.error('❌ No question available even with fallbacks');
        // Still keep alarm sound going and show generic question
        question = this.createEmergencyQuestion(alarm);
      }

      // Create active alarm instance
      const alarmInstance: AlarmInstance = {
        alarmId: alarm.id,
        scheduledTime: new Date(),
        originalAlarmTime: alarm.time, // Store original HH:MM format
        question,
        isActive: true
      };
      console.log('🚨 REAL ALARM TRIGGERED via web timer - Created alarm instance:', alarmInstance);
      console.log('🚨 REAL ALARM - alarm.time value:', alarm.time);
      console.log('🚨 REAL ALARM - originalAlarmTime:', alarmInstance.originalAlarmTime);

      // Store active alarm (works offline)
      this.activeAlarms.set(alarm.id, alarmInstance);
      await this.saveActiveAlarm(alarmInstance);
      console.log('Saved active alarm');

      // Trigger the alarm screen (this will stop the alarm sound)
      console.log('🚨 Triggering alarm screen...');
      this.showAlarmScreen(alarmInstance);
      console.log('=== ROBUST triggerWebAlarm completed ===');

    } catch (error) {
      console.error('❌ Failed to trigger web alarm:', error);
      // Even if everything fails, keep the alarm sound going
      console.log('🚨 EMERGENCY: Creating basic alarm with sound only');
      this.createEmergencyAlarmWithSound(alarm);
    }
  }

  // Get question with offline fallback strategies
  private async getQuestionWithOfflineFallback(alarm: AlarmConfig): Promise<Question | null> {
    console.log('📚 Attempting to get question with offline fallback...');
    
    try {
      // Try primary data service first
      const questionFilter = {
        exam: alarm.examType,
        type: alarm.questionType,
        subcategory: alarm.subcategory === 'Random' ? undefined : alarm.subcategory,
        difficulty: alarm.difficulty
      };
      console.log('Question filter:', questionFilter);
      
      const question = await Promise.race([
        dataService.getRandomQuestion(questionFilter),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)) // 5 second timeout
      ]);
      
      if (question) {
        console.log('✅ Got question from primary service');
        return question;
      }
      
    } catch (error) {
      console.error('Primary question service failed:', error);
    }
    
    // Try cached questions from localStorage
    console.log('🔄 Trying cached questions...');
    const cachedQuestion = this.getCachedQuestion(alarm);
    if (cachedQuestion) {
      console.log('✅ Got question from cache');
      return cachedQuestion;
    }
    
    console.log('❌ All question sources failed');
    return null;
  }

  // Get cached question from localStorage
  private getCachedQuestion(alarm: AlarmConfig): Question | null {
    try {
      const cacheKey = `alarmprep_questions_${alarm.examType}_${alarm.questionType}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const questions = JSON.parse(cached);
        if (questions.length > 0) {
          return questions[Math.floor(Math.random() * questions.length)];
        }
      }
    } catch (error) {
      console.error('Failed to get cached question:', error);
    }
    return null;
  }

  // Create emergency fallback question
  private createEmergencyQuestion(alarm: AlarmConfig): Question {
    console.log('🆘 Creating emergency fallback question');
    
    const emergencyQuestions = {
      GMAT: {
        quantitative: {
          text: "What is 15% of 200?",
          choices: ["25", "30", "35", "40"],
          correctAnswer: "30"
        },
        verbal: {
          text: "Choose the word that best completes the sentence: 'The data _____ conclusive evidence.'",
          choices: ["provides", "provide", "providing", "provided"],
          correctAnswer: "provides"
        }
      },
      LSAT: {
        reading: {
          text: "If all birds can fly, and penguins are birds, what can we conclude about penguins?",
          choices: ["Penguins can fly", "Penguins cannot fly", "Some penguins can fly", "The statement is contradictory"],
          correctAnswer: "The statement is contradictory"
        },
        logical: {
          text: "Which of the following strengthens the argument that exercise improves mental health?",
          choices: ["Many people enjoy exercising", "Studies show exercise reduces depression", "Exercise is physically demanding", "Gyms are popular"],
          correctAnswer: "Studies show exercise reduces depression"
        }
      }
    };

    const examQuestions = emergencyQuestions[alarm.examType];
    const questionData = examQuestions[alarm.questionType as keyof typeof examQuestions] || 
                        Object.values(examQuestions)[0];

    return {
      id: 999999,
      exam: alarm.examType,
      type: alarm.questionType,
      subcategory: 'Emergency',
      text: questionData.text,
      choices: questionData.choices,
      correctAnswer: questionData.correctAnswer,
      difficulty: alarm.difficulty,
      explanation: 'This is an emergency offline question.',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Show offline-capable notification
  private showOfflineCapableNotification(alarm: AlarmConfig) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('📱 Showing browser notification (offline-capable)');
        new Notification('🚨 AlarmPrep Quiz Time!', {
          body: `Time to practice ${alarm.examType}! Answer correctly to turn off the alarm.`,
          icon: '/favicon.ico',
          tag: `alarm-${alarm.id}`,
          requireInteraction: true
        });
      } else {
        console.log('📱 Browser notifications not available or not permitted');
      }
    } catch (error) {
      console.error('Notification failed:', error);
    }
  }

  // Emergency alarm with just sound (last resort)
  private createEmergencyAlarmWithSound(alarm: AlarmConfig) {
    console.log('🆘 EMERGENCY ALARM: Sound only mode');
    
    // Keep alarm sound going
    this.playAlarmSound();
    
    // Show basic alert after a delay
    setTimeout(() => {
      alert(`🚨 ALARM: ${alarm.examType} practice time!\nTime: ${alarm.time}\nPlease check your connection and try again.`);
    }, 2000);
  }

  // Play alarm sound
  public playAlarmSound() {
    console.log('playAlarmSound called');
    try {
      // Check if alarm is already playing - don't restart it
      if (this.currentAlarmAudio && this.currentAlarmAudio.oscillator) {
        console.log('Alarm sound already playing, not restarting');
        return;
      }
      
      // Stop any existing alarm sound first (only if needed)
      this.stopAlarmSound();
      
      // Try mobile vibration if available
      if ('vibrate' in navigator) {
        console.log('Starting vibration pattern');
        // Vibrate in a pattern: 500ms on, 200ms off, repeat
        const vibratePattern = () => {
          navigator.vibrate([500, 200, 500, 200, 500, 200]);
          setTimeout(vibratePattern, 2000); // Repeat every 2 seconds
        };
        vibratePattern();
      }
      
      // Try Web Audio API
      this.playWebAudioAlarm();
      
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      // Fallback: try to play a repeating audio file
      this.playFallbackAlarmSound();
    }
  }

  // Web Audio API implementation
  private playWebAudioAlarm() {
    try {
      // Use existing audio context or create new one
      const audioContext = this.audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (!this.audioContext) {
        this.audioContext = audioContext;
      }
      
      // Handle suspended context (autoplay policy)
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting to resume...');
        // Try to resume immediately
        audioContext.resume().then(() => {
          console.log('AudioContext resumed successfully');
          this.createOscillatorAlarm(audioContext);
        }).catch((error) => {
          console.error('Failed to resume AudioContext:', error);
          this.playFallbackAlarmSound();
        });
      } else {
        console.log('AudioContext ready, creating oscillator');
        this.createOscillatorAlarm(audioContext);
      }
      
    } catch (error) {
      console.error('Web Audio API failed:', error);
      this.playFallbackAlarmSound();
    }
  }

  // Create oscillator-based alarm
  private createOscillatorAlarm(audioContext: AudioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the alarm tone
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High frequency beep
    oscillator.type = 'square';
    
    // Create a continuous beeping pattern that repeats
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Schedule repeating beeps (on for 0.3s, off for 0.3s)
    const beepDuration = 0.3;
    const silenceDuration = 0.3;
    const totalCycleDuration = beepDuration + silenceDuration;
    
    // Schedule many cycles to create continuous alarm
    for (let i = 0; i < 1000; i++) { // 1000 cycles = ~10 minutes of alarm
      const cycleStartTime = audioContext.currentTime + (i * totalCycleDuration);
      gainNode.gain.setValueAtTime(0.3, cycleStartTime);
      gainNode.gain.setValueAtTime(0, cycleStartTime + beepDuration);
    }
    
    oscillator.start(audioContext.currentTime);
    // Don't set a stop time - we'll stop it manually when alarm is dismissed
    
    // Store references so we can stop the alarm later
    this.currentAlarmAudio = { oscillator, audioContext, gainNode };
    
    console.log('Continuous alarm sound started via Web Audio API');
  }

  // Stop the current alarm sound
  private stopAlarmSound() {
    if (this.currentAlarmAudio) {
      try {
        if (this.currentAlarmAudio.oscillator) {
          this.currentAlarmAudio.oscillator.stop();
        }
        if (this.currentAlarmAudio.audioContext) {
          this.currentAlarmAudio.audioContext.close();
        }
        if (this.currentAlarmAudio.audioElement) {
          this.currentAlarmAudio.audioElement.pause();
          this.currentAlarmAudio.audioElement.currentTime = 0;
        }
        console.log('🔇 Alarm sound stopped');
      } catch (error) {
        console.error('Error stopping alarm sound:', error);
      }
      this.currentAlarmAudio = null;
    }
  }

  // Fallback alarm sound for browsers that don't support Web Audio API
  private playFallbackAlarmSound() {
    try {
      console.log('Playing fallback alarm sound...');
      
      // Create multiple audio elements for better browser compatibility
      const createAlarmAudio = () => {
        // Try different audio formats for better compatibility
        const audio = new Audio();
        
        // Use a simple beep sound data URL
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2Qlchao4fStZCUF';
        audio.loop = true;
        audio.volume = 0.8;
        audio.preload = 'auto';
        
        // Add mobile-friendly play options
        audio.crossOrigin = 'anonymous';
        
        return audio;
      };
      
      const audio = createAlarmAudio();
      
      // Try to play with user gesture handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Fallback audio playing successfully');
        }).catch(error => {
          console.error('Fallback audio play failed:', error);
          // On mobile, might need user interaction - the popup button will handle this
        });
      }
      
      // Store reference for stopping later
      this.currentAlarmAudio = { audioElement: audio } as any;
      
    } catch (error) {
      console.error('Fallback alarm sound failed:', error);
      // Last resort: try to use system notification sound
      this.playSystemAlertSound();
    }
  }

  // System alert sound as last resort
  private playSystemAlertSound() {
    try {
      if ('vibrate' in navigator) {
        // Continuous vibration pattern
        const vibrateRepeat = () => {
          navigator.vibrate([1000, 500]);
          setTimeout(vibrateRepeat, 1500);
        };
        vibrateRepeat();
      }
      console.log('Using system alert (vibration) as audio fallback');
    } catch (error) {
      console.error('System alert failed:', error);
    }
  }

  // Schedule web alarms
  private scheduleWebAlarms() {
    console.log('Setting up web alarm timers for', this.alarmConfigs.length, 'alarms');
    // Web alarms are checked by the interval timer
  }

  // Test method to immediately trigger a web alarm
  async triggerTestWebAlarm(alarmConfig: Omit<AlarmConfig, 'id'>): Promise<void> {
    const testAlarm: AlarmConfig = { ...alarmConfig, id: 999999 }; // Test ID
    console.log('=== AlarmService.triggerTestWebAlarm ===');
    console.log('Test alarm config:', testAlarm);
    
    // Request user interaction for audio (if needed)
    try {
      // Test audio permissions by playing a short test sound first
      await this.testAudioPermissions();
    } catch (error) {
      console.log('Audio test failed, continuing anyway:', error);
    }
    
    try {
      await this.triggerWebAlarm(testAlarm);
      console.log('Test web alarm triggered successfully');
    } catch (error) {
      console.error('Error in triggerTestWebAlarm:', error);
      throw error;
    }
  }

  // Test audio permissions and capabilities
  private async testAudioPermissions(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Try to create an audio context briefly
        const testContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (testContext.state === 'suspended') {
          // Need user interaction to resume context
          console.log('AudioContext suspended - will attempt to resume on alarm trigger');
        }
        
        testContext.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
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
    
    console.log('🆕 Creating new alarm:', {
      id: alarm.id,
      time: alarm.time,
      days: this.getDayNames(alarm.days),
      examType: alarm.examType,
      questionType: alarm.questionType,
      isActive: alarm.isActive
    });
    
    this.alarmConfigs.push(alarm);
    await this.saveAlarms();
    
    if (alarm.isActive) {
      await this.scheduleAlarmNotifications(alarm);
      // Cache questions for offline use when alarm is created
      await this.cacheQuestionsForAlarm(alarm);
    }
    
    // Log updated alarm list
    this.logActiveAlarms();
    
    return id;
  }

  // Cache questions for offline alarm functionality
  private async cacheQuestionsForAlarm(alarm: AlarmConfig) {
    try {
      console.log(`📦 Caching questions for alarm ${alarm.id} (${alarm.examType} - ${alarm.questionType})`);
      
      const questionFilter = {
        exam: alarm.examType,
        type: alarm.questionType,
        subcategory: alarm.subcategory === 'Random' ? undefined : alarm.subcategory,
        difficulty: alarm.difficulty
      };

      // Try to get multiple questions for caching
      const questions = [];
      for (let i = 0; i < 10; i++) { // Cache 10 questions
        try {
          const question = await dataService.getRandomQuestion(questionFilter);
          if (question && !questions.find(q => q.id === question.id)) {
            questions.push(question);
          }
        } catch (error) {
          console.error(`Failed to cache question ${i + 1}:`, error);
        }
      }

      if (questions.length > 0) {
        const cacheKey = `alarmprep_questions_${alarm.examType}_${alarm.questionType}`;
        localStorage.setItem(cacheKey, JSON.stringify(questions));
        console.log(`✅ Cached ${questions.length} questions for offline use`);
      } else {
        console.log('⚠️ No questions could be cached for offline use');
      }
    } catch (error) {
      console.error('Failed to cache questions:', error);
    }
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
    // For web platforms, we use the interval-based checking system
    if (!Capacitor.isNativePlatform()) {
      console.log(`Web alarm ${alarm.id} scheduled for ${alarm.time} on days:`, alarm.days);
      return;
    }

    // Native platform scheduling (original code)
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
              examType: alarm.examType,
              questionType: alarm.questionType,
              subcategory: alarm.subcategory || 'Random',
              difficulty: alarm.difficulty,
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
      const { alarmId, examType, questionType, subcategory, difficulty } = notification.extra || {};
      
      if (!alarmId || !examType || !questionType || !difficulty) {
        console.error('Invalid alarm notification data');
        return;
      }

      // Find the original alarm config to get the time
      const alarmConfig = this.alarmConfigs.find(config => config.id === alarmId);
      const originalTime = alarmConfig ? alarmConfig.time : "00:00"; // Fallback if not found

      // Get a fresh question based on the alarm preferences
      const question = await dataService.getRandomQuestion({
        exam: examType,
        type: questionType,
        subcategory: subcategory || 'Random', // Default to Random if not specified
        difficulty: difficulty
      });
      
      if (!question) {
        console.error('No question found for alarm criteria:', { examType, questionType, difficulty });
        return;
      }

      // Create active alarm instance
      const alarmInstance: AlarmInstance = {
        alarmId,
        scheduledTime: new Date(),
        originalAlarmTime: originalTime, // Store original HH:MM format
        question,
        isActive: true
      };
      console.log('🔔 REAL ALARM TRIGGERED via notification - Created alarm instance:', alarmInstance);
      console.log('🔔 REAL ALARM - originalTime value:', originalTime);
      console.log('🔔 REAL ALARM - alarmConfig found:', !!alarmConfig);
      if (alarmConfig) {
        console.log('🔔 REAL ALARM - alarmConfig.time:', alarmConfig.time);
      }

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
    // Don't stop the alarm sound here - let it continue until user interacts with question
    // The alarm sound will be stopped when:
    // 1. User clicks "Answer Question" and AlarmScreen component is shown
    // 2. User dismisses the alarm entirely
    
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
    // Stop alarm sound when dismissed
    this.stopAlarmSound();
    
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

  // Public method to stop alarm sound (can be called externally)
  public stopCurrentAlarmSound() {
    this.stopAlarmSound();
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
        subcategory: 'Random', // Use Random for test (pick from all subcategories)
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
