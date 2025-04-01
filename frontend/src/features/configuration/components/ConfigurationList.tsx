import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { Configuration } from "@/models/configuration"

interface ConfigurationListProps {
  configurations: Configuration[];
  onDelete: (id: string) => void;
}

export const ConfigurationList = ({ configurations, onDelete }: ConfigurationListProps) => {
  return (
    <div className="space-y-4">
      {configurations.map((config, index) => (
        <Card key={config.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">Configuration {index + 1}</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => config.id && onDelete(config.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div>
              <span className="font-medium">Chunking Strategy:</span> {config.chunking_strategy}
            </div>
            {config.chunking_strategy === "sentence" && (
              <div>
                <span className="font-medium">Sentences per Chunk:</span> {config.sentence_size}
              </div>
            )}
            {config.chunking_strategy === "paragraph" && (
              <div>
                <span className="font-medium">Paragraphs per Chunk:</span> {config.paragraph_size}
              </div>
            )}
            {config.chunking_strategy === "page" && (
              <div>
                <span className="font-medium">Pages per Chunk:</span> {config.page_size}
              </div>
            )}
            {config.chunking_strategy === "tokens" && (
              <div>
                <span className="font-medium">Tokens per Chunk:</span> {config.token_size}
              </div>
            )}
            <div>
              <span className="font-medium">Embedding Model:</span> {config.embedding_model}
            </div>
            <div>
              <span className="font-medium">Similarity Metric:</span> {config.similarity_metric}
            </div>
            <div>
              <span className="font-medium">Number of Chunks:</span> {config.num_chunks}
            </div>
          </div>
        </Card>
      ))}
      {configurations.length === 0 && (
        <p className="text-gray-500 italic">No configurations saved</p>
      )}
    </div>
  );
}; 