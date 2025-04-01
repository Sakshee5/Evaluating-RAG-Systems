import { useState } from 'react';

interface UseDeleteDocumentReturn {
  deleteDocument: (documentId: string, sessionId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteDocument = (): UseDeleteDocumentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteDocument = async (documentId: string, sessionId: string): Promise<void> => {
    if (!documentId) throw new Error('Document ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/delete/document?documentId=${documentId}&session_id=${sessionId}`, {
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
