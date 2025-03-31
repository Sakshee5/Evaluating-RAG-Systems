import { useState } from 'react';
import { Question } from '@/models/question';

interface UseAddQuestionReturn {
  addQuestion: (text: string, sessionId: string) => Promise<Question>;
  isLoading: boolean;
  error: Error | null;
}

export const useAddQuestion = (): UseAddQuestionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addQuestion = async (text: string, sessionId: string): Promise<Question> => {
    if (!sessionId) throw new Error('Session ID is required');
    if (!text.trim()) throw new Error('Question text is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          text,
          session_id: sessionId,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const question = await response.json();
      setIsLoading(false);
      return question;
    } catch (error) {
      console.error('Error adding question:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { addQuestion, isLoading, error };
};
