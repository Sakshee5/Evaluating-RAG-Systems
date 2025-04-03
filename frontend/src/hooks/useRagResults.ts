import { useState } from 'react';
import { LLMResponse } from '../features/evaluation/types';
import { Configuration } from '../models/configuration';

export const useRagResults = () => {
  const [results, setResults] = useState<LLMResponse[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRagResults = async (queryLLM: string, queryApiKey: string, sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/run/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_llm: queryLLM,
          api_key: queryApiKey,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to fetch RAG results: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.answers || []);
      setConfigurations(data.configurations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    configurations,
    isLoading,
    error,
    fetchRagResults,
  };
}; 