'use client';

import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { AlarmInstance, alarmService } from '@/services/alarmService';

interface AlarmScreenProps {
  alarmInstance: AlarmInstance;
  onDismiss: () => void;
}

export default function AlarmScreen({ alarmInstance, onDismiss }: AlarmScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { question } = alarmInstance;

  // Helper function to render text with LaTeX support
  const renderMathText = (text: string) => {
    if (!text) return text;
    
    // Split text by LaTeX delimiters and render accordingly
    // The regex captures both $...$ and $$...$$ patterns
    const parts = text.split(/(\$\$.*?\$\$|\$[^$]*?\$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math (display mode)
        const mathContent = part.slice(2, -2);
        return <BlockMath key={index} math={mathContent} />;
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const mathContent = part.slice(1, -1);
        return <InlineMath key={index} math={mathContent} />;
      } else {
        // Regular text
        return part ? <span key={index}>{part}</span> : null;
      }
    }).filter(Boolean);
  };

  // Timer for alarm duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time elapsed
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!selectedAnswer.trim()) return;

    setIsSubmitting(true);
    
    try {
      const correct = await alarmService.answerAlarmQuestion(
        alarmInstance.alarmId, 
        selectedAnswer
      );
      
      setIsCorrect(correct);
      setShowResult(true);

      if (correct) {
        // Auto-dismiss after showing success
        setTimeout(() => {
          onDismiss();
        }, 2000);
      } else {
        // Reset after showing error
        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer('');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle snooze
  const handleSnooze = async () => {
    try {
      await alarmService.snoozeAlarm(alarmInstance.alarmId);
      onDismiss();
    } catch (error) {
      console.error('Failed to snooze alarm:', error);
    }
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <div className="max-w-md w-full mx-4 p-6 text-center">
          {isCorrect ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Correct! 🎉</h2>
              <p className="text-gray-300 mb-4">Alarm dismissed. Great job studying!</p>
              <p className="text-sm text-gray-400">Time taken: {formatTime(timeElapsed)}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Incorrect ❌</h2>
              <p className="text-gray-300 mb-4">Try again! The alarm will continue.</p>
              <div className="bg-gray-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300 mb-2">Correct answer:</p>
                <div className="text-green-400 font-semibold">
                  {renderMathText(question.correctAnswer)}
                </div>
                {question.explanation && (
                  <div className="text-xs text-gray-400 mt-2">
                    {renderMathText(question.explanation)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">🚨 ALARM ACTIVE</h1>
          <p className="text-red-400 font-semibold">Answer correctly to turn off the alarm</p>
          <p className="text-gray-400 text-sm mt-2">Time: {formatTime(timeElapsed)}</p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {question.exam} - {question.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty}
            </span>
          </div>
          
          <div className="text-lg font-semibold text-gray-900 mb-4">
            {renderMathText(question.text)}
          </div>
          
          {/* Answer Choices */}
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === choice
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={selectedAnswer === choice}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAnswer === choice
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === choice && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900 font-medium">
                  {renderMathText(choice)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || isSubmitting}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              selectedAnswer && !isSubmitting
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Answer'
            )}
          </button>
          
          <button
            onClick={handleSnooze}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            Snooze (5 minutes)
          </button>
        </div>
      </div>
    </div>
  );
}
