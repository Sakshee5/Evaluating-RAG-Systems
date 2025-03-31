import { useState } from 'react';
import { Document } from '@/models/document';

interface UseDocumentUploadReturn {
  uploadDocument: (file: File, sessionId: string) => Promise<Document>;
  isLoading: boolean;
  error: Error | null;
}

export const useDocumentUpload = (): UseDocumentUploadReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadDocument = async (file: File, sessionId: string): Promise<Document> => {
    if (!sessionId) throw new Error('Session ID is required');
    if (!file) throw new Error('File is required');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);

      const response = await fetch('http://localhost:8000/api/document/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const newDoc = await response.json();
      setIsLoading(false);
      return newDoc;
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsLoading(false);
      throw error;
    }
  };

  return { uploadDocument, isLoading, error };
};
