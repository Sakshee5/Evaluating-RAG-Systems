import { useState, useEffect, useCallback, useRef } from 'react';

interface Configuration {
  id?: string;
  name?: string;
  session_id?: string;
  created_at?: string;
  chunking_strategy: string;
  chunk_size: number;
  embedding_model: string;
  similarity_metric: string;
  num_chunks: number;
}

interface UseFetchConfigurationsReturn {
  configurations: Configuration[];
  isLoading: boolean;
  error: Error | null;
  fetchConfigurations: (sessionId: string) => Promise<void>;
}

export const useFetchConfigurations = (initialSessionId?: string): UseFetchConfigurationsReturn => {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedSessionRef = useRef<string | null>(null);

  const fetchConfigurations = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    
    // Prevent duplicate fetches for the same session
    if (isLoading || lastFetchedSessionRef.current === sessionId) return;
    
    lastFetchedSessionRef.current = sessionId;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/configurations/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      
      const configs = await response.json();
      setConfigurations(configs);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      // Reset the last fetched session on error so we can try again
      lastFetchedSessionRef.current = null;
    }
  }, [isLoading]); // Add isLoading as a dependency for the check

  useEffect(() => {
    if (initialSessionId) {
      fetchConfigurations(initialSessionId);
    }
  }, [initialSessionId, fetchConfigurations]);

  return { configurations, isLoading, error, fetchConfigurations };
};
