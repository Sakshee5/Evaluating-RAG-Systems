export interface Chunk {
  chunk_number: number;
  text: string;
  relevance_score: number;
  similarity_score: number;
}

export interface LLMResponse {
  question: string;
  answer: string;
  chunks: Chunk[];
  visualization_plot: string | null;
} 