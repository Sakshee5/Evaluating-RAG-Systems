import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Configuration } from "@/models/configuration"

interface ConfigurationFormProps {
  configuration: Configuration;
  onConfigurationChange: (config: Configuration) => void;
  onSubmit: () => void;
}

export const ConfigurationForm = ({ configuration, onConfigurationChange, onSubmit }: ConfigurationFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chunking-strategy">Chunking Strategy</Label>
        <Select
          value={configuration.chunking_strategy}
          onValueChange={(value) => onConfigurationChange({ ...configuration, chunking_strategy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select chunking strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Size</SelectItem>
            <SelectItem value="sentence">Sentence Based</SelectItem>
            <SelectItem value="paragraph">Paragraph Based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chunk-size">Chunk Size</Label>
        <Input
          id="chunk-size"
          type="number"
          value={configuration.chunk_size}
          onChange={(e) => onConfigurationChange({ ...configuration, chunk_size: parseInt(e.target.value) })}
          min={100}
          max={2000}
          step={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="num-chunks">Number of Chunks</Label>
        <Input
          id="num-chunks"
          type="number"
          value={configuration.num_chunks}
          onChange={(e) => onConfigurationChange({ ...configuration, num_chunks: parseInt(e.target.value) })}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="embedding-model">Embedding Model</Label>
        <Select
          value={configuration.embedding_model}
          onValueChange={(value) => onConfigurationChange({ ...configuration, embedding_model: value })}
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
        <Label htmlFor="similarity-metric">Similarity Metric</Label>
        <Select
          value={configuration.similarity_metric}
          onValueChange={(value) => onConfigurationChange({ ...configuration, similarity_metric: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select similarity metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cosine">Cosine Similarity</SelectItem>
            <SelectItem value="dot">Dot Product</SelectItem>
            <SelectItem value="euclidean">Euclidean Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} className="w-full">
        Save Configuration
      </Button>
    </div>
  );
}; 