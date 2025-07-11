import { prisma } from '@/lib/prisma';

export interface UserPerformanceStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  currentStreak: number;
  longestStreak: number;
  lastAnsweredAt: Date | null;
  
  // Performance by difficulty
  difficultyStats: {
    easy: { correct: number; total: number; accuracy: number };
    intermediate: { correct: number; total: number; accuracy: number };
    hard: { correct: number; total: number; accuracy: number };
  };
  
  // Performance by question type
  typeStats: Record<string, { correct: number; total: number; accuracy: number }>;
  
  // Recent performance (last 7 days)
  recentPerformance: {
    questionsAnswered: number;
    accuracy: number;
    averageTime: number;
  };
}

export interface QuestionAttempt {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  source: 'alarm' | 'test' | 'practice';
}

class UserService {
  private deviceId: string | null = null;
  private userId: string | null = null;

  // Get or create device-based user ID
  async getUserId(): Promise<string> {
    if (this.userId) return this.userId;

    // Generate or get device ID
    if (typeof window !== 'undefined') {
      this.deviceId = localStorage.getItem('alarmprep_device_id');
      if (!this.deviceId) {
        this.deviceId = this.generateDeviceId();
        localStorage.setItem('alarmprep_device_id', this.deviceId);
      }
    } else {
      // Fallback for server-side
      this.deviceId = 'server-' + Date.now();
    }

    try {
      // Find existing user or create new one
      let user = await prisma.user.findUnique({
        where: { deviceId: this.deviceId }
      });

      if (!user) {
        // Get current exam type from localStorage
        const examType = typeof window !== 'undefined' ? 
          localStorage.getItem('examType') || 'GMAT' : 'GMAT';

        user = await prisma.user.create({
          data: {
            deviceId: this.deviceId,
            examType: examType
          }
        });

        // Create initial stats
        await prisma.userStats.create({
          data: {
            userId: user.id,
            typeStats: {}
          }
        });
      }

      this.userId = user.id;
      return user.id;
    } catch (error) {
      console.error('Error getting/creating user:', error);
      // Fallback to device ID if database fails
      this.userId = this.deviceId;
      return this.deviceId;
    }
  }

  // Record a question attempt
  async recordQuestionAttempt(attempt: QuestionAttempt): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      // Get question details
      const question = await prisma.question.findUnique({
        where: { id: attempt.questionId }
      });

      if (!question) {
        console.error('Question not found:', attempt.questionId);
        return;
      }

      // Record the answer
      await prisma.userAnswer.create({
        data: {
          userId,
          questionId: attempt.questionId,
          userAnswer: attempt.userAnswer,
          isCorrect: attempt.isCorrect,
          timeSpent: attempt.timeSpent,
          source: attempt.source
        }
      });

      // Update user stats
      await this.updateUserStats(userId, question, attempt.isCorrect, attempt.timeSpent);
      
      console.log('Question attempt recorded successfully');
    } catch (error) {
      console.error('Error recording question attempt:', error);
    }
  }

  // Update user statistics
  private async updateUserStats(userId: string, question: any, isCorrect: boolean, timeSpent: number): Promise<void> {
    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      console.error('User stats not found for user:', userId);
      return;
    }

    // Parse current type stats
    const typeStats = typeof stats.typeStats === 'object' ? stats.typeStats as any : {};
    const questionType = question.type;
    
    if (!typeStats[questionType]) {
      typeStats[questionType] = { correct: 0, total: 0 };
    }

    // Update type stats
    typeStats[questionType].total += 1;
    if (isCorrect) {
      typeStats[questionType].correct += 1;
    }

    // Calculate new streak
    let newCurrentStreak = stats.currentStreak;
    let newLongestStreak = stats.longestStreak;
    
    if (isCorrect) {
      newCurrentStreak += 1;
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else {
      newCurrentStreak = 0;
    }

    // Calculate new average time
    const totalTime = (stats.averageTimePerQuestion * stats.totalQuestions) + timeSpent;
    const newTotalQuestions = stats.totalQuestions + 1;
    const newAverageTime = totalTime / newTotalQuestions;

    // Update difficulty stats
    const difficultyUpdates: any = {};
    const difficulty = question.difficulty.toLowerCase();
    
    if (difficulty === 'easy') {
      difficultyUpdates.easyTotal = stats.easyTotal + 1;
      difficultyUpdates.easyCorrect = stats.easyCorrect + (isCorrect ? 1 : 0);
    } else if (difficulty === 'intermediate') {
      difficultyUpdates.intermediateTotal = stats.intermediateTotal + 1;
      difficultyUpdates.intermediateCorrect = stats.intermediateCorrect + (isCorrect ? 1 : 0);
    } else if (difficulty === 'hard') {
      difficultyUpdates.hardTotal = stats.hardTotal + 1;
      difficultyUpdates.hardCorrect = stats.hardCorrect + (isCorrect ? 1 : 0);
    }

    // Update stats in database
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalQuestions: newTotalQuestions,
        correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
        averageTimePerQuestion: newAverageTime,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastAnsweredAt: new Date(),
        typeStats: typeStats,
        ...difficultyUpdates
      }
    });
  }

  // Get user performance statistics
  async getUserStats(): Promise<UserPerformanceStats | null> {
    try {
      const userId = await this.getUserId();
      
      const stats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (!stats) return null;

      const accuracy = stats.totalQuestions > 0 ? 
        (stats.correctAnswers / stats.totalQuestions) * 100 : 0;

      // Calculate difficulty stats
      const difficultyStats = {
        easy: {
          correct: stats.easyCorrect,
          total: stats.easyTotal,
          accuracy: stats.easyTotal > 0 ? (stats.easyCorrect / stats.easyTotal) * 100 : 0
        },
        intermediate: {
          correct: stats.intermediateCorrect,
          total: stats.intermediateTotal,
          accuracy: stats.intermediateTotal > 0 ? (stats.intermediateCorrect / stats.intermediateTotal) * 100 : 0
        },
        hard: {
          correct: stats.hardCorrect,
          total: stats.hardTotal,
          accuracy: stats.hardTotal > 0 ? (stats.hardCorrect / stats.hardTotal) * 100 : 0
        }
      };

      // Process type stats
      const typeStatsRaw = typeof stats.typeStats === 'object' ? stats.typeStats as any : {};
      const typeStats: Record<string, { correct: number; total: number; accuracy: number }> = {};
      
      Object.entries(typeStatsRaw).forEach(([type, data]: [string, any]) => {
        typeStats[type] = {
          correct: data.correct || 0,
          total: data.total || 0,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        };
      });

      // Get recent performance (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAnswers = await prisma.userAnswer.findMany({
        where: {
          userId,
          answeredAt: {
            gte: sevenDaysAgo
          }
        }
      });

      const recentPerformance = {
        questionsAnswered: recentAnswers.length,
        accuracy: recentAnswers.length > 0 ? 
          (recentAnswers.filter(a => a.isCorrect).length / recentAnswers.length) * 100 : 0,
        averageTime: recentAnswers.length > 0 ?
          recentAnswers.reduce((sum, a) => sum + a.timeSpent, 0) / recentAnswers.length : 0
      };

      return {
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        accuracy,
        averageTimePerQuestion: stats.averageTimePerQuestion,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastAnsweredAt: stats.lastAnsweredAt,
        difficultyStats,
        typeStats,
        recentPerformance
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Get performance history for charts
  async getPerformanceHistory(days: number = 30): Promise<Array<{
    date: string;
    questionsAnswered: number;
    accuracy: number;
    averageTime: number;
  }>> {
    try {
      const userId = await this.getUserId();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const answers = await prisma.userAnswer.findMany({
        where: {
          userId,
          answeredAt: {
            gte: startDate
          }
        },
        orderBy: {
          answeredAt: 'asc'
        }
      });

      // Group by date
      const dailyStats: Record<string, {
        total: number;
        correct: number;
        totalTime: number;
      }> = {};

      answers.forEach(answer => {
        const date = answer.answeredAt.toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { total: 0, correct: 0, totalTime: 0 };
        }
        dailyStats[date].total += 1;
        if (answer.isCorrect) {
          dailyStats[date].correct += 1;
        }
        dailyStats[date].totalTime += answer.timeSpent;
      });

      // Convert to array format
      return Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        questionsAnswered: stats.total,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        averageTime: stats.total > 0 ? stats.totalTime / stats.total : 0
      }));
    } catch (error) {
      console.error('Error getting performance history:', error);
      return [];
    }
  }

  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Reset all user data (for testing)
  async resetUserData(): Promise<void> {
    try {
      const userId = await this.getUserId();
      await prisma.userAnswer.deleteMany({ where: { userId } });
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alarmprep_device_id');
      }
      
      // Reset internal state
      this.userId = null;
      this.deviceId = null;
      
      console.log('User data reset successfully');
    } catch (error) {
      console.error('Error resetting user data:', error);
    }
  }
}

export const userService = new UserService();
