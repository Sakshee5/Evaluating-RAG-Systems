import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const EvaluationTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Results</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Placeholder for evaluation content */}
        <p className="text-gray-500">
          This is where the evaluation results would be displayed. You can implement 
          visualization components like charts and tables to compare different configurations.
        </p>
      </CardContent>
    </Card>
  );
}; 