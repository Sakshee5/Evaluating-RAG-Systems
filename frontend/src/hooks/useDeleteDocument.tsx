import { useState } from 'react';

interface UseDeleteDocumentReturn {
  deleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteDocument = (): UseDeleteDocumentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDocument = async (id: string): Promise<void> => {
    if (!id) throw new Error('Document ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/document/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { deleteDocument, isLoading, error };
};
