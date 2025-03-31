export interface Configuration {
    id?: string;
    name?: string;
    session_id?: string;
    created_at?: string;
    chunking_strategy: string;
    chunk_size: number;
    embedding_model: string;
    similarity_metric: string;
    num_chunks: number;
}