import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Configuration {
  chunking_strategy: string;
  chunk_size: number;
  embedding_model: string;
  similarity_metric: string;
  num_chunks: number;
}

interface ConfigurationProps {
  configuration: Configuration;
  onConfigurationChange: (config: Configuration) => void;
  onSubmit: () => void;
}

export function ConfigurationForm({ configuration, onConfigurationChange, onSubmit }: ConfigurationProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chunking_strategy">Chunking Strategy</Label>
          <Select 
            value={configuration.chunking_strategy}
            onValueChange={(value: string) => onConfigurationChange({...configuration, chunking_strategy: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chunking strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Size</SelectItem>
              <SelectItem value="recursive">Recursive</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chunk_size">Chunk Size</Label>
          <Input
            id="chunk_size"
            type="number"
            value={configuration.chunk_size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigurationChange({...configuration, chunk_size: parseInt(e.target.value)})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="embedding_model">Embedding Model</Label>
          <Select 
            value={configuration.embedding_model}
            onValueChange={(value: string) => onConfigurationChange({...configuration, embedding_model: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select embedding model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
              <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
              <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="similarity_metric">Similarity Metric</Label>
          <Select 
            value={configuration.similarity_metric}
            onValueChange={(value: string) => onConfigurationChange({...configuration, similarity_metric: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select similarity metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cosine">Cosine Similarity</SelectItem>
              <SelectItem value="dot_product">Dot Product</SelectItem>
              <SelectItem value="euclidean">Euclidean Distance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="num_chunks">Number of Chunks</Label>
          <Input
            id="num_chunks"
            type="number"
            value={configuration.num_chunks}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigurationChange({...configuration, num_chunks: parseInt(e.target.value)})}
          />
        </div>

        <Button onClick={onSubmit} className="w-full">
          Save Configuration
        </Button>
      </div>
    </Card>
  )
}