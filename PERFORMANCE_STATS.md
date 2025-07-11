# AlarmPrep - Individualized Performance Stats

## Overview

AlarmPrep now features comprehensive individualized performance statistics that track your progress across different question types, difficulty levels, and exam categories. The stats system helps you identify strengths, weaknesses, and areas for improvement in your GMAT and LSAT preparation.

## Features

### 📊 Performance Tracking
- **Overall Statistics**: Total questions answered, accuracy percentage, current streak, and average time per question
- **Difficulty Breakdown**: Performance across easy, intermediate, and hard questions
- **Question Type Analysis**: Detailed stats for each question type (Quantitative, Verbal, Data Insights, Logical Reasoning, Reading Comprehension, Logic Games)
- **Recent Activity**: Daily performance tracking with visual indicators

### 🧠 Smart Insights
- **Strengths Identification**: Automatically detects your best-performing areas
- **Improvement Areas**: Highlights topics that need more practice
- **Personalized Recommendations**: Suggests specific study strategies based on your performance patterns

### 📈 Visual Progress Tracking
- Color-coded performance indicators
- Accuracy trends over time
- Streak tracking for motivation
- Performance comparisons across different categories

## How It Works

### 1. Automatic Data Collection
Every time you answer a question (whether through Test Alarm or real alarms), the system automatically records:
- Your answer and whether it was correct
- Time taken to answer
- Question difficulty and type
- Source (test mode vs. alarm mode)

### 2. Real-time Analysis
The system continuously analyzes your performance to provide:
- Updated accuracy percentages
- Streak calculations
- Performance trends
- Intelligent insights

### 3. Local Storage
All performance data is stored locally on your device using localStorage, ensuring:
- Privacy (your data never leaves your device)
- Fast access and updates
- No need for user accounts or internet connectivity for stats

## Using the Stats Page

### Accessing Your Stats
1. Navigate to the Stats tab in the bottom navigation
2. View your comprehensive performance dashboard
3. Explore different sections for detailed insights

### Understanding Your Data

#### Overall Performance Section
- **Questions**: Total number of questions you've answered
- **Accuracy**: Your overall success rate
- **Current Streak**: Number of consecutive correct answers
- **Avg Time**: Average time per question in seconds

#### Difficulty Performance
- **Easy**: Green indicator - foundational concepts
- **Intermediate**: Yellow indicator - moderate complexity
- **Hard**: Red indicator - advanced problem-solving

#### Question Type Performance
Shows your accuracy for each type of question:
- **GMAT**: Quantitative, Verbal, Data Insights
- **LSAT**: Logical Reasoning, Reading Comprehension, Logic Games

#### Performance Insights
- **Strengths** 💪: Areas where you excel (>80% accuracy)
- **Improvements** 📈: Areas needing attention (<60% accuracy)
- **Recommendations** 💡: Specific study suggestions

#### Recent Activity
- Daily performance overview
- Color-coded accuracy indicators
- Last 7 days of activity

### Managing Your Data

#### Reset Data
- Use the "Reset Data" button to clear all performance statistics
- This action cannot be undone
- Useful for starting fresh or cleaning up test data

## For Developers

### Technical Implementation

#### UserStatsService
The `userStatsService` handles all statistics tracking:

```typescript
// Record a question attempt
userStatsService.recordQuestionAttempt({
  questionId: number,
  userAnswer: string,
  isCorrect: boolean,
  timeSpent: number,
  source: 'alarm' | 'test' | 'practice',
  questionType: string,
  difficulty: string,
  exam: string
});

// Get current statistics
const stats = userStatsService.getUserStats();

// Get performance insights
const insights = userStatsService.getPerformanceInsights();
```

#### Integration Points
- **AlarmScreen.tsx**: Records attempts when questions are answered
- **Stats Page**: Displays comprehensive performance data
- **localStorage**: Persistent storage for user data

#### Testing
For development testing, use the browser console:

```javascript
// Add sample data
window.userStatsService.populateSampleData();

// View current stats
console.log(window.userStatsService.getUserStats());

// Get insights
console.log(window.userStatsService.getPerformanceInsights());

// Reset data
window.userStatsService.resetUserData();
```

## Future Enhancements

### Planned Features
- **Charts and Graphs**: Visual representation of progress over time
- **Goal Setting**: Set accuracy targets and track progress
- **Study Recommendations**: AI-powered study plan suggestions
- **Export Data**: Download performance data as CSV/JSON
- **Cloud Sync**: Optional cloud storage for cross-device access

### Migration to Backend
The current localStorage-based system can be migrated to use the Prisma/PostgreSQL backend for:
- Cross-device synchronization
- User accounts and authentication
- Advanced analytics and reporting
- Social features (leaderboards, sharing progress)

## Privacy and Data

### Local Storage Only
- All performance data is stored locally on your device
- No data is sent to external servers
- Complete privacy and control over your information

### Data Structure
The system stores:
- Question attempt records
- Calculated statistics
- Performance trends
- No personally identifiable information beyond your answers

## Troubleshooting

### Stats Not Updating
- Ensure you're answering questions through the app (Test Alarm or real alarms)
- Check browser console for any error messages
- Try refreshing the stats page

### Missing Data
- Performance data is tied to your specific browser and device
- Clearing browser data will remove your stats
- Use different browsers or devices will show different stats

### Reset Issues
If you need to completely reset:
1. Use the "Reset Data" button in the stats page
2. Or manually clear localStorage in browser developer tools
3. Refresh the page to see empty stats

## Support

For issues or questions about the performance stats feature:
1. Check the browser console for error messages
2. Verify that JavaScript and localStorage are enabled
3. Ensure you're using a modern browser
4. Test with the sample data function for debugging
