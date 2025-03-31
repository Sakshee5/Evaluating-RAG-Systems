import { useState } from 'react';

interface UseDeleteQuestionReturn {
  deleteQuestion: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteQuestion = (): UseDeleteQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteQuestion = async (id: string): Promise<void> => {
    if (!id) throw new Error('Question ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/question/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
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
