import { useState } from 'react';

interface UseDeleteQuestionReturn {
  deleteQuestion: (questionId: string, sessionId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteQuestion = (): UseDeleteQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteQuestion = async (questionId: string, sessionId: string): Promise<void> => {
    if (!questionId) throw new Error('Question ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/delete/question?question_id=${questionId}&session_id=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete question');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { deleteQuestion, isLoading, error };
};
