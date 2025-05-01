export interface Chunk {
  chunk_number: number;
  text: string;
  relevance_score: number;
  similarity_score: number;
}

export interface RUSMetrics {
  rus: number;
  normalized_dcr: number;
  scaled_correlation: number;
  wasted_similarity_penalty: number;
}

export interface LLMResponse {
  question: string;
  answer: string;
  chunks: Chunk[];
  visualization_plot: string | null;
  rus_metrics: RUSMetrics;
} 