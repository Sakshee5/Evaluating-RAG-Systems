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
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground">{result.answer}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="chunks">
                <AccordionTrigger>View Chunks</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4" style={{ maxHeight: '264px', overflowY: 'auto' }}>
                    {result.chunks.map((chunk) => (
                      <ChunkDisplay key={chunk.chunk_number} chunk={chunk} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div>
              {result.visualization_plot && (
                <div>
                  <h3 className="font-medium mb-2">Embedding Space Visualization</h3>
                  <img 
                    src={`data:image/png;base64,${result.visualization_plot}`}
                    alt="RAG Visualization" 
                    className="w-full rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 