import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRagResults } from "../../../hooks/useRagResults";
import { RagResultCard } from "./RagResultCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EvaluationTabProps {
  sessionId: string;
}

export const EvaluationTab = ({ sessionId }: EvaluationTabProps) => {
  const [queryLLM, setQueryLLM] = useState<string>("");
  const [queryApiKey, setQueryApiKey] = useState<string>("");
  const [judgeLLM, setJudgeLLM] = useState<string>("");
  const [judgeApiKey, setJudgeApiKey] = useState<string>("");

  const { results, isLoading, error, fetchRagResults } = useRagResults();

  const handleRunRag = async () => {
    if (!queryLLM || !queryApiKey) {
      return;
    }
    await fetchRagResults(queryLLM, queryApiKey, sessionId);
  };

  const handleEvaluate = async () => {
    if (!judgeLLM || !judgeApiKey) {
      return;
    }
    // TODO: Implement judge evaluation
    console.log("Evaluating with:", judgeLLM);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Query LLM</Label>
            <Select value={queryLLM} onValueChange={setQueryLLM}>
              <SelectTrigger>
                <SelectValue placeholder="Select Query LLM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">Gemini Flash</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="password" 
              placeholder="API Key" 
              value={queryApiKey}
              onChange={(e) => setQueryApiKey(e.target.value)}
            /> 
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Judge LLM</Label>
            <Select value={judgeLLM} onValueChange={setJudgeLLM}>
              <SelectTrigger>
                <SelectValue placeholder="Select Judge LLM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">Gemini Flash</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="password" 
              placeholder="API Key" 
              value={judgeApiKey}
              onChange={(e) => setJudgeApiKey(e.target.value)}
            /> 
          </div>
        </div>

        <div className="h-6"></div>

        <div className="flex gap-4">
          <Button onClick={handleRunRag} disabled={isLoading}>
            {isLoading ? "Running RAG..." : "Run RAG"}
          </Button>
          {results.length > 0 && (
            <Button onClick={handleEvaluate} variant="secondary">
              Evaluate Results
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">RAG Results</h2>
            <div className="space-y-6">
              {results.map((result, index) => (
                <RagResultCard key={index} result={result} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 