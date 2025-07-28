// Error reporting service for managing user-reported question errors

export interface ReportedError {
  id: string;
  questionId: number;
  questionText: string;
  exam: string;
  type: string;
  subcategory: string;
  difficulty: string;
  errorDescription: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
  reporterInfo?: {
    userAgent: string;
    timestamp: string;
  };
}

class ErrorReportingService {
  private readonly STORAGE_KEY = 'reported_errors';

  /**
   * Report an error for a specific question
   */
  async reportError(
    questionId: number,
    questionText: string,
    exam: string,
    type: string,
    subcategory: string,
    difficulty: string,
    errorDescription: string
  ): Promise<string> {
    try {
      const errorId = this.generateErrorId();
      const reportedError: ReportedError = {
        id: errorId,
        questionId,
        questionText: questionText.substring(0, 200) + (questionText.length > 200 ? '...' : ''), // Truncate for storage
        exam,
        type,
        subcategory,
        difficulty,
        errorDescription,
        reportedAt: new Date().toISOString(),
        status: 'pending',
        reporterInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // Get existing errors
      const existingErrors = this.getReportedErrors();
      
      // Add new error
      existingErrors.push(reportedError);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingErrors));
      
      console.log('Error reported successfully:', errorId);
      return errorId;
    } catch (error) {
      console.error('Failed to report error:', error);
      throw new Error('Failed to report error. Please try again.');
    }
  }

  /**
   * Get all reported errors
   */
  getReportedErrors(): ReportedError[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load reported errors:', error);
      return [];
    }
  }

  /**
   * Update error status
   */
  updateErrorStatus(errorId: string, status: ReportedError['status']): boolean {
    try {
      const errors = this.getReportedErrors();
      const errorIndex = errors.findIndex(error => error.id === errorId);
      
      if (errorIndex === -1) {
        return false;
      }
      
      errors[errorIndex].status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errors));
      
      return true;
    } catch (error) {
      console.error('Failed to update error status:', error);
      return false;
    }
  }

  /**
   * Delete a reported error
   */
  deleteError(errorId: string): boolean {
    try {
      const errors = this.getReportedErrors();
      const filteredErrors = errors.filter(error => error.id !== errorId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredErrors));
      
      return true;
    } catch (error) {
      console.error('Failed to delete error:', error);
      return false;
    }
  }

  /**
   * Get errors by status
   */
  getErrorsByStatus(status: ReportedError['status']): ReportedError[] {
    return this.getReportedErrors().filter(error => error.status === status);
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.getReportedErrors().length;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all reported errors (admin function)
   */
  clearAllErrors(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();
