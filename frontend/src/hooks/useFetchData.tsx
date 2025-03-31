import { useState, useEffect, useCallback, useRef } from 'react';
import { Alldata } from '@/models/alldata';

export const useFetchData = (initialSessionId?: string): { fetchData: (sessionId: string) => Promise<Alldata> } => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedSessionRef = useRef<string | null>(null);

  const fetchData = useCallback(async (sessionId: string): Promise<Alldata> => {
    if (!sessionId) throw new Error('Session ID is required');
    
    // Prevent duplicate fetches for the same session
    if (isLoading || lastFetchedSessionRef.current === sessionId) return { documents: [], questions: [] };
    
    lastFetchedSessionRef.current = sessionId;
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch documents
      const docsResponse = await fetch(`http://localhost:8000/api/documents/${sessionId}`);
      if (!docsResponse.ok) {
        throw new Error('Failed to fetch documents');
      }
      const docs = await docsResponse.json();
      console.log('Fetched documents:', docs);

      // Fetch questions
      const questionsResponse = await fetch(`http://localhost:8000/api/questions/${sessionId}`);
      if (!questionsResponse.ok) {
        throw new Error('Failed to fetch questions');
      }
      const questionData = await questionsResponse.json();
      console.log('Fetched questions:', questionData);
      
      setIsLoading(false);
      return { documents: docs, questions: questionData };
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      // Reset the last fetched session on error so we can try again
      lastFetchedSessionRef.current = null;
      throw error;
    }
  }, [isLoading]);

  useEffect(() => {
    if (initialSessionId) {
      fetchData(initialSessionId);
    }
  }, [initialSessionId, fetchData]);

  return { fetchData };
};
