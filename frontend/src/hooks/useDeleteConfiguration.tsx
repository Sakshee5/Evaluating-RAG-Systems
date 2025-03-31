import { useState } from 'react';

interface UseDeleteConfigurationReturn {
  deleteConfiguration: (id: string, onSuccess?: () => void) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteConfiguration = (): UseDeleteConfigurationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConfiguration = async (id: string, onSuccess?: () => void): Promise<void> => {
    if (!id) throw new Error('Configuration ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/configuration/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete configuration');
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
