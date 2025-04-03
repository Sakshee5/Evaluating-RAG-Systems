import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface JudgeResultCardProps {
  recommendation: string;
  analysis?: string[];
}

export const JudgeResultCard = ({ recommendation, analysis = [] }: JudgeResultCardProps) => {
  return (
    <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Evaluation Results</h2>
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Recommended Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium text-green-700 mb-4">{recommendation}</p>
        
        {analysis.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Analysis & Insights
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-left">
              {analysis.map((item, index) => (
                <li key={index} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}; 