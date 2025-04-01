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
              <SelectItem value="sentence">By Sentence</SelectItem>
              <SelectItem value="paragraph">By Paragraph</SelectItem>
              <SelectItem value="page">By Page</SelectItem>
              <SelectItem value="tokens">By Tokens</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {configuration.chunking_strategy === "tokens" && (
        <div className="space-y-2">
          <Label htmlFor="token-size">Tokens per Chunk</Label>
          <Input
            id="token-size"
            type="number"
            value={configuration.token_size}
            onChange={(e) => onConfigurationChange({ ...configuration, token_size: parseInt(e.target.value) })}
            min={50}
            max={1000}
            step={50}
          />
        </div>
      )}

      {configuration.chunking_strategy === "sentence" && (
        <div className="space-y-2">
          <Label htmlFor="sentence-size">Sentences per Chunk</Label>
          <Input
            id="sentence-size"
            type="number"
            value={configuration.sentence_size}
            onChange={(e) => onConfigurationChange({ ...configuration, sentence_size: parseInt(e.target.value) })}
            min={1}
            max={100}
            step={1}
          />
        </div>
      )}

      {configuration.chunking_strategy === "paragraph" && (
        <div className="space-y-2">
          <Label htmlFor="paragraph-size">Paragraphs per Chunk</Label>
          <Input
            id="paragraph-size"
            type="number"
            value={configuration.paragraph_size}
            onChange={(e) => onConfigurationChange({ ...configuration, paragraph_size: parseInt(e.target.value) })}
            min={1}
            max={100}
            step={1}
          />
        </div>
      )}

      {configuration.chunking_strategy === "page" && (
        <div className="space-y-2">
          <Label htmlFor="page-size">Pages per Chunk</Label>
          <Input
            id="page-size"
            type="number"
            value={configuration.page_size}
            onChange={(e) => onConfigurationChange({ ...configuration, page_size: parseInt(e.target.value) })}
            min={1}
            max={100}
            step={1}
          />
        </div>
      )}

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
              <SelectItem value="sentence-transformer">Sentence-Transformer (all-MiniLM-L6-v2)</SelectItem>
              <SelectItem value="bert">BERT (bert-base-uncased)</SelectItem>
              <SelectItem value="roberta">RoBERTa (roberta-base)</SelectItem>
              <SelectItem value="distilbert">DistilBERT (distilbert-base-uncased)</SelectItem>
              <SelectItem value="gpt2">GPT-2 (gpt2)</SelectItem>
              <SelectItem value="fine-tuned-financial">Fine-tuned Financial (bge-base)</SelectItem>
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
              <SelectItem value="euclidean">Euclidean Similarity</SelectItem>
              <SelectItem value="jaccard">Jaccard Similarity</SelectItem>
          </SelectContent>
        </Select>
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

      <Button onClick={onSubmit} className="w-full">
        Save Configuration
      </Button>
    </div>
  );
}; 