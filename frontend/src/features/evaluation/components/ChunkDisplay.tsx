import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChunkDisplayProps {
  chunk: {
    chunk_number: number;
    text: string;
    relevance_score: number;
    similarity_score: number;
  };
}

export const ChunkDisplay = ({ chunk }: ChunkDisplayProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium cursor-help">Chunk #{chunk.chunk_number}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[500px]">
                  <p className="text-sm">{chunk.text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Relevance:</span>
                <Progress value={chunk.relevance_score * 100} className="w-24" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Similarity:</span>
                <Progress value={chunk.similarity_score * 100} className="w-24" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 