import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
            <span className="font-medium">Chunk #{chunk.chunk_number}</span>
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
          <p className="text-sm text-muted-foreground">{chunk.text}</p>
        </div>
      </CardContent>
    </Card>
  );
}; 