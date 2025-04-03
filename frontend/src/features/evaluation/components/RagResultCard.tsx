import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChunkDisplay } from "./ChunkDisplay";
import { LLMResponse } from "../types";
import { Configuration } from "@/models/configuration";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RagResultCardProps {
  result: LLMResponse;
  configurations: Configuration[];
  configIndex?: number;
}

export const RagResultCard = ({ result, configurations, configIndex = 0 }: RagResultCardProps) => {
  const config = configurations[configIndex];
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Question: {result.question}</CardTitle>
        {config && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-muted-foreground cursor-help">
                  <InfoIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">Config Info</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Configuration Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="font-medium">Chunking Strategy:</div>
                    <div>{config.chunking_strategy}</div>
                    
                    <div className="font-medium">Embedding Model:</div>
                    <div>{config.embedding_model}</div>
                    
                    <div className="font-medium">Similarity Metric:</div>
                    <div>{config.similarity_metric}</div>
                    
                    <div className="font-medium">Number of Chunks:</div>
                    <div>{config.num_chunks}</div>
                    
                    {config.chunking_strategy === "sentence" && (
                      <>
                        <div className="font-medium">Sentence Size:</div>
                        <div>{config.sentence_size}</div>
                      </>
                    )}
                    
                    {config.chunking_strategy === "paragraph" && (
                      <>
                        <div className="font-medium">Paragraph Size:</div>
                        <div>{config.paragraph_size}</div>
                      </>
                    )}
                    
                    {config.chunking_strategy === "page" && (
                      <>
                        <div className="font-medium">Page Size:</div>
                        <div>{config.page_size}</div>
                      </>
                    )}
                    
                    {config.chunking_strategy === "tokens" && (
                      <>
                        <div className="font-medium">Token Size:</div>
                        <div>{config.token_size}</div>
                      </>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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