export interface Configuration {
    id?: string;
    name?: string;
    session_id?: string;
    chunking_strategy: string;
    token_size?: number;
    sentence_size?: number;
    paragraph_size?: number;
    page_size?: number;
    embedding_model: string;
    similarity_metric: string;
    num_chunks: number;
}