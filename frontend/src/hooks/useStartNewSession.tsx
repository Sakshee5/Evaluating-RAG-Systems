import { useState } from 'react';

interface UseStartNewSessionReturn {
  startNewSession: () => Promise<string>;
  isLoading: boolean;
  error: Error | null;
}

export const useStartNewSession = (): UseStartNewSessionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startNewSession = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/create/session', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const session = await response.json();
      localStorage.setItem('currentSessionId', session.id);
      setIsLoading(false);
      return session.id;
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { startNewSession, isLoading, error };
};
