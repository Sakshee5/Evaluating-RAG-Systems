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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface RagResultCardProps {
  result: LLMResponse;
  configurations: Configuration[];
  configIndex?: number;
}

export const RagResultCard = ({ result, configurations, configIndex = 0 }: RagResultCardProps) => {
  const config = configurations[configIndex];
  const [activePlot, setActivePlot] = useState(0); // 0: UMAP, 1: tSNE, 2: PCA
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  
  const getImageUrl = (path: string) => {
    // Extract session_id and filename from the path
    const parts = path.split(/[\\/]/);
    const session_id = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    return `http://localhost:8000/api/static/${session_id}/${filename}`;
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const renderVisualization = (index: number) => {
    if (imageErrors[index]) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Failed to load visualization</p>
        </div>
      );
    }

    if (!result.visualization_plot || !result.visualization_plot[index]) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Visualization not available</p>
        </div>
      );
    }

    return (
      <img 
        src={getImageUrl(result.visualization_plot[index])}
        alt={`${index === 0 ? 'UMAP' : index === 1 ? 'tSNE' : 'PCA'} Visualization`}
        className="w-full rounded-lg border"
        onError={() => handleImageError(index)}
      />
    );
  };
  
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
                <AccordionTrigger className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>View Chunks</span>
                    <span className="text-sm text-muted-foreground">
                      RUS: {(result.rus_metrics.rus * 100).toFixed(1)}%
                    </span>
                  </div>
                </AccordionTrigger>
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
              {result.visualization_plot && result.visualization_plot.length > 0 && (
                <div>
                  <Tabs value={activePlot.toString()} onValueChange={(value) => setActivePlot(parseInt(value))}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="0">UMAP</TabsTrigger>
                      <TabsTrigger value="1">tSNE</TabsTrigger>
                      <TabsTrigger value="2">PCA</TabsTrigger>
                    </TabsList>
                    <TabsContent value="0">
                      {renderVisualization(0)}
                    </TabsContent>
                    <TabsContent value="1">
                      {renderVisualization(1)}
                    </TabsContent>
                    <TabsContent value="2">
                      {renderVisualization(2)}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 