// Script to add sample performance data for testing
// Run this in the browser console to test the stats functionality

import { userStatsService } from '@/services/userStatsService';

// Add some sample question attempts
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

// Add the sample attempts
console.log('Adding sample performance data...');
sampleAttempts.forEach(attempt => {
  userStatsService.recordQuestionAttempt(attempt);
});

console.log('Sample data added! Refresh the stats page to see the results.');
console.log('Current stats:', userStatsService.getUserStats());
console.log('Performance insights:', userStatsService.getPerformanceInsights());
