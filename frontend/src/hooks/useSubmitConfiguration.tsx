import { useState } from 'react';
import { Configuration } from '../models/configuration';

interface UseSubmitConfigurationReturn {
  submitConfiguration: (configuration: Configuration, sessionId: string, onSuccess?: () => void) => Promise<Configuration>;
  isLoading: boolean;
  error: Error | null;
}

export const useSubmitConfiguration = (): UseSubmitConfigurationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitConfiguration = async (configuration: Configuration, sessionId: string, onSuccess?: () => void): Promise<Configuration> => {
    if (!sessionId) throw new Error('Session ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/create/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          chunking_strategy: configuration.chunking_strategy,
          sentence_size: configuration.sentence_size,
          paragraph_size: configuration.paragraph_size,
          page_size: configuration.page_size,
          token_size: configuration.token_size,
          embedding_model: configuration.embedding_model,
          similarity_metric: configuration.similarity_metric,
          num_chunks: configuration.num_chunks,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create configuration');
      }
      
      const savedConfig = await response.json();
      setIsLoading(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return savedConfig;
    } catch (error) {
      console.error('Error creating configuration:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { submitConfiguration, isLoading, error };
};
