import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Evaluation = () => {
    const [queryLLM, setQueryLLM] = useState<string>("gpt-3.5-turbo");
    const [judgeLLM, setJudgeLLM] = useState<string>("gpt-4");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleEvaluate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/evaluate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query_llm: queryLLM,
                    judge_llm: judgeLLM
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error during evaluation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <h3 className="text-lg font-medium mb-6">Evaluation Settings</h3>
                <div className="space-y-6">

                    <div>
                        <Label>Query LLM</Label>
                        <Select value={queryLLM} onValueChange={setQueryLLM}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Query LLM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Judge LLM</Label>
                        <Select value={judgeLLM} onValueChange={setJudgeLLM}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Judge LLM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleEvaluate} disabled={isLoading}>
                        {isLoading ? "Evaluating..." : "Evaluate"}
                    </Button>
                </div>
            </Card>

            {result && (
                <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Evaluation Results</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default Evaluation; 