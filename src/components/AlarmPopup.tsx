import React, { useState, useEffect } from 'react';
import { AlarmInstance, alarmService } from '@/services/alarmService';

interface AlarmPopupProps {
  alarmInstance: AlarmInstance;
  onAnswerQuestion: () => void;
  onDismiss: () => void;
}

const AlarmPopup: React.FC<AlarmPopupProps> = ({ 
  alarmInstance, 
  onAnswerQuestion,
  onDismiss 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [localAlarmAudio, setLocalAlarmAudio] = useState<{
    oscillator?: OscillatorNode;
    audioContext?: AudioContext;
    gainNode?: GainNode;
    interval?: NodeJS.Timeout;
  } | null>(null);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Trigger alarm sound when popup appears
  useEffect(() => {
    console.log('AlarmPopup mounted - triggering alarm sound');
    console.log('AlarmInstance:', alarmInstance);
    console.log('originalAlarmTime:', alarmInstance.originalAlarmTime);
    
    // Try to play alarm sound (works reliably on desktop, limited on mobile web)
    alarmService.playAlarmSound();
    
    // Clean up when component unmounts
    return () => {
      stopLocalAlarmSound();
    };
  }, []);

  // Enable audio on user interaction
  const enableAudio = async () => {
    try {
      console.log('Attempting to enable audio...');
      
      // First, try to resume any suspended AudioContext
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
          console.log('AudioContext resumed');
        }
      }
      
      // Try to play a test sound to unlock audio
      const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0u2Qlchao4fStZCUF');
      testAudio.volume = 0.1; // Low volume for test
      await testAudio.play();
      testAudio.pause();
      setAudioEnabled(true);
      console.log('Audio enabled successfully - starting local alarm sound');
      
      // Start our own alarm sound directly in the popup
      startLocalAlarmSound();
      
      // Also try the alarm service
      alarmService.playAlarmSound();
      
    } catch (error) {
      console.error('Failed to enable audio:', error);
      console.log('Audio enable failed, but trying alarm sound anyway');
      // Even if test fails, try to play alarm sound anyway
      alarmService.playAlarmSound();
    }
  };

  // Start local alarm sound directly in the popup
  const startLocalAlarmSound = () => {
    try {
      console.log('Starting local alarm sound...');
      stopLocalAlarmSound(); // Stop any existing sound
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure alarm tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'square';
      
      // Create beeping pattern
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      // Schedule beeps manually with interval
      let beepCount = 0;
      const interval = setInterval(() => {
        const currentTime = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.setValueAtTime(0, currentTime + 0.3);
        beepCount++;
        
        if (beepCount > 500) { // Stop after 5 minutes
          clearInterval(interval);
        }
      }, 600); // Every 600ms (0.3s beep + 0.3s silence)
      
      oscillator.start(audioContext.currentTime);
      
      setLocalAlarmAudio({
        oscillator,
        audioContext,
        gainNode,
        interval
      });
      
      console.log('Local alarm sound started successfully');
      
    } catch (error) {
      console.error('Failed to start local alarm sound:', error);
    }
  };

  // Stop local alarm sound
  const stopLocalAlarmSound = () => {
    if (localAlarmAudio) {
      try {
        if (localAlarmAudio.interval) {
          clearInterval(localAlarmAudio.interval);
        }
        if (localAlarmAudio.oscillator) {
          localAlarmAudio.oscillator.stop();
        }
        if (localAlarmAudio.audioContext) {
          localAlarmAudio.audioContext.close();
        }
        setLocalAlarmAudio(null);
        console.log('Local alarm sound stopped');
      } catch (error) {
        console.error('Error stopping local alarm sound:', error);
      }
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Convert 24-hour format (HH:MM) to 12-hour format with AM/PM
  const formatAlarmTime = (timeString: string) => {
    console.log('🕐 formatAlarmTime input:', timeString);
    console.log('🕐 formatAlarmTime input type:', typeof timeString);
    
    // Handle case where originalAlarmTime might not be available
    if (!timeString) {
      console.log('🕐 No timeString provided, using scheduledTime fallback');
      const fallbackTime = alarmInstance.scheduledTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      console.log('🕐 formatAlarmTime fallback result:', fallbackTime);
      return fallbackTime;
    }
    
    // Check if timeString is already in 12-hour format
    if (timeString.includes('AM') || timeString.includes('PM')) {
      console.log('🕐 timeString already in 12-hour format:', timeString);
      return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const result = `${hour12}:${minutes} ${ampm}`;
    console.log('🕐 formatAlarmTime conversion result:', result);
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Alarm</h2>
          <button
            onClick={() => {
              stopLocalAlarmSound(); // Stop our local sound
              onDismiss();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content - Current Time Display */}
        <div className="p-6 text-center">
          {/* Large Time Display */}
          <div className="mb-6">
            <div className="text-6xl font-light text-gray-800 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-gray-600">
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Alarm Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
            <div className="mb-1">
              <strong>Alarm Time:</strong> {formatAlarmTime(alarmInstance.originalAlarmTime)}
            </div>
            <div>
              <strong>Question Ready:</strong> Click below to begin
            </div>
          </div>

          {/* Answer Question Button */}
          <button
            onClick={() => {
              stopLocalAlarmSound(); // Stop our local sound
              onAnswerQuestion();
            }}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg mb-4"
          >
            Answer Question to Stop Alarm
          </button>

          {/* Mobile Web Audio Limitation Notice */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Mobile Web Audio Limitation</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>📱 Mobile browsers restrict audio autoplay. For reliable alarm sounds, use the native mobile app version.</p>
                  <p className="mt-1">⚡ Desktop version has full audio support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmPopup;
