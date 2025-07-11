// Simple user service for stats tracking
// We'll integrate this with AlarmScreen to record question attempts

export interface QuestionAttempt {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  source: 'alarm' | 'test' | 'practice';
  questionType: string;
  difficulty: string;
  exam: string;
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  
  difficultyStats: {
    easy: { correct: number; total: number; accuracy: number };
    intermediate: { correct: number; total: number; accuracy: number };
    hard: { correct: number; total: number; accuracy: number };
  };
  
  typeStats: Record<string, { correct: number; total: number; accuracy: number }>;
  
  recentPerformance: Array<{
    date: string;
    correct: number;
    total: number;
    accuracy: number;
  }>;
}

class SimpleUserService {
  private readonly STORAGE_KEY = 'alarmprep_user_stats';
  private readonly HISTORY_KEY = 'alarmprep_question_history';

  // Get user statistics from localStorage
  getUserStats(): UserStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }

    return this.getDefaultStats();
  }

  // Record a question attempt
  recordQuestionAttempt(attempt: QuestionAttempt): void {
    if (typeof window === 'undefined') return;

    try {
      // Get current stats
      const stats = this.getUserStats();
      
      // Update totals
      stats.totalQuestions += 1;
      if (attempt.isCorrect) {
        stats.correctAnswers += 1;
      }
      
      // Update accuracy
      stats.accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
      
      // Update average time
      const totalTime = (stats.averageTime * (stats.totalQuestions - 1)) + attempt.timeSpent;
      stats.averageTime = totalTime / stats.totalQuestions;
      
      // Update streak
      if (attempt.isCorrect) {
        stats.currentStreak += 1;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      } else {
        stats.currentStreak = 0;
      }
      
      // Update difficulty stats
      const difficulty = attempt.difficulty.toLowerCase() as 'easy' | 'intermediate' | 'hard';
      if (stats.difficultyStats[difficulty]) {
        stats.difficultyStats[difficulty].total += 1;
        if (attempt.isCorrect) {
          stats.difficultyStats[difficulty].correct += 1;
        }
        stats.difficultyStats[difficulty].accuracy = 
          (stats.difficultyStats[difficulty].correct / stats.difficultyStats[difficulty].total) * 100;
      }
      
      // Update type stats
      const type = attempt.questionType;
      if (!stats.typeStats[type]) {
        stats.typeStats[type] = { correct: 0, total: 0, accuracy: 0 };
      }
      stats.typeStats[type].total += 1;
      if (attempt.isCorrect) {
        stats.typeStats[type].correct += 1;
      }
      stats.typeStats[type].accuracy = 
        (stats.typeStats[type].correct / stats.typeStats[type].total) * 100;
      
      // Update recent performance
      this.updateRecentPerformance(attempt);
      
      // Save updated stats
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
      
      console.log('Question attempt recorded:', attempt);
      console.log('Updated stats:', stats);
    } catch (error) {
      console.error('Error recording question attempt:', error);
    }
  }

  private updateRecentPerformance(attempt: QuestionAttempt): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const historyData = localStorage.getItem(this.HISTORY_KEY);
      let history: Record<string, { correct: number; total: number }> = {};
      
      if (historyData) {
        history = JSON.parse(historyData);
      }
      
      if (!history[today]) {
        history[today] = { correct: 0, total: 0 };
      }
      
      history[today].total += 1;
      if (attempt.isCorrect) {
        history[today].correct += 1;
      }
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      Object.keys(history).forEach(date => {
        if (new Date(date) < thirtyDaysAgo) {
          delete history[date];
        }
      });
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      
      // Update recent performance in stats
      const stats = this.getUserStats();
      stats.recentPerformance = Object.entries(history)
        .map(([date, data]) => ({
          date,
          correct: data.correct,
          total: data.total,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating recent performance:', error);
    }
  }

  private getDefaultStats(): UserStats {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      difficultyStats: {
        easy: { correct: 0, total: 0, accuracy: 0 },
        intermediate: { correct: 0, total: 0, accuracy: 0 },
        hard: { correct: 0, total: 0, accuracy: 0 }
      },
      typeStats: {},
      recentPerformance: []
    };
  }

  // Reset all user data
  resetUserData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
    console.log('User data reset');
  }

  // Get performance insights
  getPerformanceInsights(): {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  } {
    const stats = this.getUserStats();
    const insights = {
      strengths: [] as string[],
      improvements: [] as string[],
      recommendations: [] as string[]
    };

    if (stats.totalQuestions === 0) {
      insights.recommendations.push("Start practicing to build your performance history!");
      return insights;
    }

    // Analyze accuracy
    if (stats.accuracy >= 80) {
      insights.strengths.push(`Excellent overall accuracy: ${stats.accuracy.toFixed(1)}%`);
    } else if (stats.accuracy >= 60) {
      insights.improvements.push(`Good accuracy but room for improvement: ${stats.accuracy.toFixed(1)}%`);
      insights.recommendations.push("Focus on understanding explanations for incorrect answers");
    } else {
      insights.improvements.push(`Accuracy needs work: ${stats.accuracy.toFixed(1)}%`);
      insights.recommendations.push("Consider reviewing fundamentals and practicing easier questions first");
    }

    // Analyze difficulty performance
    Object.entries(stats.difficultyStats).forEach(([difficulty, data]) => {
      if (data.total > 0) {
        if (data.accuracy >= 80) {
          insights.strengths.push(`Strong ${difficulty} question performance: ${data.accuracy.toFixed(1)}%`);
        } else if (data.accuracy < 50) {
          insights.improvements.push(`${difficulty} questions need attention: ${data.accuracy.toFixed(1)}%`);
          insights.recommendations.push(`Practice more ${difficulty} questions`);
        }
      }
    });

    // Analyze type performance
    Object.entries(stats.typeStats).forEach(([type, data]) => {
      if (data.total >= 3) { // Only analyze if sufficient data
        if (data.accuracy >= 80) {
          insights.strengths.push(`Excellent ${type} performance: ${data.accuracy.toFixed(1)}%`);
        } else if (data.accuracy < 50) {
          insights.improvements.push(`${type} questions need focus: ${data.accuracy.toFixed(1)}%`);
          insights.recommendations.push(`Study ${type} concepts and practice more`);
        }
      }
    });

    // Analyze streak
    if (stats.longestStreak >= 5) {
      insights.strengths.push(`Great consistency with ${stats.longestStreak} question streak!`);
    }

    // Time analysis
    if (stats.averageTime > 120) { // More than 2 minutes average
      insights.improvements.push("Consider working on speed - average time is high");
      insights.recommendations.push("Practice time management strategies");
    } else if (stats.averageTime < 30) { // Less than 30 seconds
      insights.recommendations.push("Make sure you're reading questions carefully");
    }

    return insights;
  }

  // Get a quick summary of performance for display
  getQuickSummary(): { totalQuestions: number; accuracy: string; bestType: string; weakestType: string } {
    const stats = this.getUserStats();
    
    if (stats.totalQuestions === 0) {
      return {
        totalQuestions: 0,
        accuracy: '0%',
        bestType: 'None',
        weakestType: 'None'
      };
    }

    // Find best and weakest question types
    const typeEntries = Object.entries(stats.typeStats);
    let bestType = 'None';
    let weakestType = 'None';
    let highestAccuracy = 0;
    let lowestAccuracy = 100;

    typeEntries.forEach(([type, data]) => {
      if (data.total >= 2) { // Only consider types with at least 2 attempts
        if (data.accuracy > highestAccuracy) {
          highestAccuracy = data.accuracy;
          bestType = type;
        }
        if (data.accuracy < lowestAccuracy) {
          lowestAccuracy = data.accuracy;
          weakestType = type;
        }
      }
    });

    return {
      totalQuestions: stats.totalQuestions,
      accuracy: `${stats.accuracy.toFixed(1)}%`,
      bestType,
      weakestType
    };
  }

  // Helper method to populate sample data for testing
  populateSampleData(): void {
    if (typeof window === 'undefined') return;

    const sampleAttempts = [
      {
        questionId: 1,
        userAnswer: "A",
        isCorrect: true,
        timeSpent: 45,
        source: 'test' as const,
        questionType: 'Quantitative',
        difficulty: 'easy',
        exam: 'gmat'
      },
      {
        questionId: 2,
        userAnswer: "B",
        isCorrect: false,
        timeSpent: 67,
        source: 'alarm' as const,
        questionType: 'Verbal',
        difficulty: 'intermediate',
        exam: 'gmat'
      },
      {
        questionId: 3,
        userAnswer: "C",
        isCorrect: true,
        timeSpent: 32,
        source: 'test' as const,
        questionType: 'Quantitative',
        difficulty: 'hard',
        exam: 'gmat'
      },
      {
        questionId: 4,
        userAnswer: "D",
        isCorrect: true,
        timeSpent: 51,
        source: 'alarm' as const,
        questionType: 'Reading Comprehension',
        difficulty: 'easy',
        exam: 'lsat'
      },
      {
        questionId: 5,
        userAnswer: "A",
        isCorrect: false,
        timeSpent: 89,
        source: 'test' as const,
        questionType: 'Logical Reasoning',
        difficulty: 'intermediate',
        exam: 'lsat'
      },
      {
        questionId: 6,
        userAnswer: "B",
        isCorrect: true,
        timeSpent: 43,
        source: 'alarm' as const,
        questionType: 'Logic Games',
        difficulty: 'hard',
        exam: 'lsat'
      },
      {
        questionId: 7,
        userAnswer: "C",
        isCorrect: true,
        timeSpent: 38,
        source: 'test' as const,
        questionType: 'Data Insights',
        difficulty: 'easy',
        exam: 'gmat'
      },
      {
        questionId: 8,
        userAnswer: "D",
        isCorrect: false,
        timeSpent: 72,
        source: 'alarm' as const,
        questionType: 'Quantitative',
        difficulty: 'hard',
        exam: 'gmat'
      }
    ];

    sampleAttempts.forEach(attempt => {
      this.recordQuestionAttempt(attempt);
    });

    console.log('Sample performance data added successfully!');
  }
}

export const userStatsService = new SimpleUserService();

// For debugging/testing - expose to window object in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).userStatsService = userStatsService;
}
