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
  subcategory?: string; // When "Random", don't filter by subcategory
}

class DataService {
  private isOnline = true;
  private localStorageKey = 'alarmprep_questions';

  // Map UI question type IDs to database values
  private mapQuestionType(uiType: string): string {
    const typeMap: { [key: string]: string } = {
      'quantitative': 'quantitative',
      'verbal': 'verbal', 
      'data': 'data',
      'logical': 'logical',
      'reading': 'reading'
    };
    const mapped = typeMap[uiType.toLowerCase()] || uiType;
    console.log('Type mapping:', uiType, '→', mapped);
    return mapped;
  }

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
    console.log('getQuestions called with filter:', filter);
    try {
      // In static export mode, skip API calls
      if (process.env.NEXT_OUTPUT === 'export') {
        return this.getLocalQuestions(filter);
      }

      if (this.isOnline) {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const questions = await response.json();
          console.log('Loaded', questions.length, 'questions from database');
          
          // Cache questions locally
          this.cacheQuestions(questions);
          const filtered = this.filterQuestions(questions, filter);
          return filtered;
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
    console.log('getRandomQuestion - Filter used:', filter);
    console.log('getRandomQuestion - Total questions retrieved:', questions.length);
    console.log('getRandomQuestion - All questions:', questions.map(q => ({ 
      id: q.id, exam: q.exam, type: q.type, difficulty: q.difficulty, 
      text: q.text.substring(0, 30) + '...' 
    })));
    
    if (questions.length === 0) {
      console.log('No questions found after filtering');
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];
    console.log('getRandomQuestion - Random index:', randomIndex, 'of', questions.length);
    console.log('getRandomQuestion - Selected question:', { 
      id: selectedQuestion.id, exam: selectedQuestion.exam, type: selectedQuestion.type, difficulty: selectedQuestion.difficulty 
    });
    return selectedQuestion;
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

    console.log('Filtering', questions.length, 'questions with filter:', filter);

    const filtered = questions.filter(question => {
      if (filter.exam && question.exam.toLowerCase() !== filter.exam.toLowerCase()) return false;
      
      if (filter.type) {
        const mappedType = this.mapQuestionType(filter.type);
        if (question.type !== mappedType) return false;
      }
      
      if (filter.difficulty && question.difficulty.toLowerCase() !== filter.difficulty.toLowerCase()) return false;
      
      // Handle subcategory filtering - "Random" means include ALL subcategories (no filter)
      if (filter.subcategory && filter.subcategory !== 'Random') {
        if (question.subcategory !== filter.subcategory) return false;
      }
      // If subcategory is "Random" or not specified, include all subcategories
      
      return true;
    });

    console.log('Filter result:', filtered.length, 'questions match criteria');
    console.log('Matching questions:', filtered.map(q => ({ 
      id: q.id, exam: q.exam, type: q.type, difficulty: q.difficulty, subcategory: q.subcategory
    })));

    return filtered;
  }

  // Fallback questions when no cache is available
  private getFallbackQuestions(): Question[] {
    return [
      {
        id: 1,
        exam: 'GMAT',
        type: 'quantitative',
        subcategory: 'Linear and Quadratic Equations',
        text: 'If $3x + 5 = 20$, what is the value of $x$?',
        correctAnswer: '$x = 5$',
        choices: ['$x = 3$', '$x = 4$', '$x = 5$', '$x = 6$'],
        difficulty: 'easy',
        explanation: 'Solve for $x$: $3x + 5 = 20$, so $3x = 15$, therefore $x = 5$'
      },
      {
        id: 2,
        exam: 'GMAT',
        type: 'verbal',
        subcategory: 'Main Idea',
        text: 'The main purpose of this passage is to:',
        correctAnswer: 'Explain a scientific discovery',
        choices: ['Explain a scientific discovery', 'Argue for policy change', 'Describe a historical event', 'Compare different theories'],
        difficulty: 'medium',
        explanation: 'The passage focuses on explaining recent scientific findings.'
      },
      {
        id: 3,
        exam: 'LSAT',
        type: 'logical',
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
