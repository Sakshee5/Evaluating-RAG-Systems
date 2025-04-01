import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChunkDisplay } from "./ChunkDisplay";
import { LLMResponse } from "../types";

interface RagResultCardProps {
  result: LLMResponse;
}

export const RagResultCard = ({ result }: RagResultCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Question: {result.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Answer:</h3>
              <p className="text-muted-foreground">{result.answer}</p>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="chunks">
                <AccordionTrigger>View Chunks</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {result.chunks.map((chunk) => (
                      <ChunkDisplay key={chunk.chunk_number} chunk={chunk} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            {result.visualization_plot_path && (
              <div>
                <h3 className="font-medium mb-2">Visualization:</h3>
                <img 
                  src={result.visualization_plot_path} 
                  alt="RAG Visualization" 
                  className="w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 