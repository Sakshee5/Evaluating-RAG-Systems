import { useState } from 'react';

interface JudgeResult {
  recommendation: string;
  analysis: string[];
}

interface UseJudgeReturn {
  judgeResult: JudgeResult | null;
  isLoading: boolean;
  error: string | null;
  evaluateResults: (judgeLLM: string, judgeApiKey: string, sessionId: string) => Promise<void>;
}

export const useJudge = (): UseJudgeReturn => {
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateResults = async (judgeLLM: string, judgeApiKey: string, sessionId: string) => {
    setIsLoading(true);
    setError(null);
    setJudgeResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/run/judge/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judge_llm: judgeLLM,
          api_key: judgeApiKey,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to evaluate results: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setJudgeResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    judgeResult,
    isLoading,
    error,
    evaluateResults,
  };
};
