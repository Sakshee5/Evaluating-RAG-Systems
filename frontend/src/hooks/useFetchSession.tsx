import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@/models/session';

export const useFetchSession = (initialSessionId?: string): { fetchSession: (sessionId: string) => Promise<Session> } => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedSessionRef = useRef<string | null>(null);

  const fetchSession = useCallback(async (sessionId: string): Promise<Session> => {
    if (!sessionId) throw new Error('Session ID is required');
    
    // Prevent duplicate fetches for the same session
    if (isLoading || lastFetchedSessionRef.current === sessionId) return { documents: [], questions: [], configurations: [] };
    
    lastFetchedSessionRef.current = sessionId;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/get/session?session_id=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }
      
      const sessionData = await response.json();
      setIsLoading(false);
      return {
        documents: sessionData.documents || [],
        questions: sessionData.questions || [],
        configurations: sessionData.configurations || []
      };
    } catch (error) {
      console.error('Error fetching session data:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      // Reset the last fetched session on error so we can try again
      lastFetchedSessionRef.current = null;
      throw error;
    }
  }, [isLoading]);

  useEffect(() => {
    if (initialSessionId) {
      fetchSession(initialSessionId);
    }
  }, [initialSessionId, fetchSession]);

  return { fetchSession };
};
