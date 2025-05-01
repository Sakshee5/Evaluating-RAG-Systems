import { useState } from 'react';

interface UseDeleteConfigurationReturn {
  deleteConfiguration: (configurationId: string, sessionId: string, onSuccess?: () => void) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteConfiguration = (): UseDeleteConfigurationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConfiguration = async (configurationId: string, sessionId: string, onSuccess?: () => void): Promise<void> => {
    if (!configurationId) throw new Error('Configuration ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/delete/configuration?configuration_id=${configurationId}&session_id=${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete configuration');
      }
      
      setIsLoading(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { deleteConfiguration, isLoading, error };
};
