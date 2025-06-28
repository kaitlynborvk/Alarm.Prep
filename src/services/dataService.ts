// Data service that works both online and offline
export interface Question {
  id: number;
  exam: string;
  type: string;
  subcategory: string;
  text: string;
  correctAnswer: string;
  choices: string[];
  difficulty: string;
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionFilter {
  exam?: string;
  type?: string;
  difficulty?: string;
}

class DataService {
  private isOnline = true;
  private localStorageKey = 'alarmprep_questions';

  constructor() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.checkOnlineStatus();
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
    }
  }

  private checkOnlineStatus() {
    this.isOnline = navigator.onLine;
  }

  private setOnlineStatus(status: boolean) {
    this.isOnline = status;
  }

  // Get questions - try API first, fallback to local storage
  async getQuestions(filter?: QuestionFilter): Promise<Question[]> {
    try {
      // In static export mode, skip API calls
      if (process.env.NEXT_OUTPUT === 'export') {
        return this.getLocalQuestions(filter);
      }

      if (this.isOnline) {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const questions = await response.json();
          // Cache questions locally
          this.cacheQuestions(questions);
          return this.filterQuestions(questions, filter);
        }
      }
    } catch (error) {
      console.log('API fetch failed, using local cache');
    }

    // Fallback to local storage
    return this.getLocalQuestions(filter);
  }

  // Get random question based on criteria
  async getRandomQuestion(filter?: QuestionFilter): Promise<Question | null> {
    const questions = await this.getQuestions(filter);
    if (questions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  // Cache questions in local storage
  private cacheQuestions(questions: Question[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.localStorageKey, JSON.stringify(questions));
      localStorage.setItem(this.localStorageKey + '_timestamp', Date.now().toString());
    }
  }

  // Get questions from local storage
  private getLocalQuestions(filter?: QuestionFilter): Question[] {
    if (typeof window === 'undefined') return this.getFallbackQuestions();
    
    try {
      const cached = localStorage.getItem(this.localStorageKey);
      if (cached) {
        const questions = JSON.parse(cached);
        return this.filterQuestions(questions, filter);
      }
    } catch (error) {
      console.error('Error reading from local storage:', error);
    }

    return this.getFallbackQuestions();
  }

  // Filter questions based on criteria
  private filterQuestions(questions: Question[], filter?: QuestionFilter): Question[] {
    if (!filter) return questions;

    return questions.filter(question => {
      if (filter.exam && question.exam !== filter.exam) return false;
      if (filter.type && question.type !== filter.type) return false;
      if (filter.difficulty && question.difficulty !== filter.difficulty) return false;
      return true;
    });
  }

  // Fallback questions when no cache is available
  private getFallbackQuestions(): Question[] {
    return [
      {
        id: 1,
        exam: 'GMAT',
        type: 'Quantitative',
        subcategory: 'Problem Solving',
        text: 'If $3x + 5 = 20$, what is the value of $x$?',
        correctAnswer: '$x = 5$',
        choices: ['$x = 3$', '$x = 4$', '$x = 5$', '$x = 6$'],
        difficulty: 'easy',
        explanation: 'Solve for $x$: $3x + 5 = 20$, so $3x = 15$, therefore $x = 5$'
      },
      {
        id: 2,
        exam: 'GMAT',
        type: 'Quantitative',
        subcategory: 'Problem Solving',
        text: 'What is the value of $x^2 + 2x - 8$ when $x = 3$?',
        correctAnswer: '$7$',
        choices: ['$5$', '$7$', '$9$', '$11$'],
        difficulty: 'easy',
        explanation: 'Substitute $x = 3$: $(3)^2 + 2(3) - 8 = 9 + 6 - 8 = 7$'
      },
      {
        id: 3,
        exam: 'LSAT',
        type: 'Logical Reasoning',
        subcategory: 'Strengthen',
        text: 'Which of the following would most strengthen the argument?',
        correctAnswer: 'Option A',
        choices: ['Option A', 'Option B', 'Option C', 'Option D'],
        difficulty: 'medium',
        explanation: 'This choice provides the strongest support for the conclusion.'
      }
    ];
  }

  // Check if we have cached data
  hasCachedData(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.localStorageKey) !== null;
  }

  // Get cache age in hours
  getCacheAge(): number {
    if (typeof window === 'undefined') return 0;
    
    const timestamp = localStorage.getItem(this.localStorageKey + '_timestamp');
    if (!timestamp) return 0;
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    return (now - cacheTime) / (1000 * 60 * 60); // Hours
  }

  // Force refresh from API
  async refreshCache(): Promise<boolean> {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const questions = await response.json();
        this.cacheQuestions(questions);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
    return false;
  }
}

// Create singleton instance
export const dataService = new DataService();
