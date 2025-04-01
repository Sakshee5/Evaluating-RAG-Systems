import numpy as np
from typing import List, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from scipy.spatial.distance import euclidean, jaccard

class SimilarityCalculator:
    @staticmethod
    def calculate_cosine_similarity(query_embedding: np.ndarray, chunk_embeddings: List[np.ndarray]) -> List[float]:
        """
        Calculate cosine similarity between query embedding and chunk embeddings.
        """
        query_embedding = np.array(query_embedding).reshape(1, -1)
        chunk_embeddings = np.array(chunk_embeddings)
        return cosine_similarity(query_embedding, chunk_embeddings)[0].tolist()

    @staticmethod
    def calculate_euclidean_similarity(query_embedding: np.ndarray, chunk_embeddings: List[np.ndarray]) -> List[float]:
        """
        Calculate similarity based on Euclidean distance.
        """
        query_embedding = np.array(query_embedding)
        return [1 / (1 + euclidean(query_embedding, np.array(chunk_emb))) for chunk_emb in chunk_embeddings]

    @staticmethod
    def calculate_jaccard_similarity(query_embedding: np.ndarray, chunk_embeddings: List[np.ndarray]) -> List[float]:
        """
        Calculate Jaccard similarity by thresholding embeddings at their median values.
        """
        query_binary = query_embedding > np.median(query_embedding)
        similarities = []
        for chunk_emb in chunk_embeddings:
            chunk_binary = np.array(chunk_emb) > np.median(chunk_emb)
            similarities.append(1 - jaccard(query_binary, chunk_binary))
        return similarities

    @staticmethod
    def get_similarity_scores(query_embedding: np.ndarray, 
                              chunk_embeddings: List[np.ndarray], 
                              similarity_metric: str = "cosine") -> List[float]:
        """
        Calculate similarity scores based on the specified metric.
        """
        if similarity_metric == "cosine":
            return SimilarityCalculator.calculate_cosine_similarity(query_embedding, chunk_embeddings)
        elif similarity_metric == "euclidean":
            return SimilarityCalculator.calculate_euclidean_similarity(query_embedding, chunk_embeddings)
        elif similarity_metric == "jaccard":
            return SimilarityCalculator.calculate_jaccard_similarity(query_embedding, chunk_embeddings)
        else:
            return SimilarityCalculator.calculate_cosine_similarity(query_embedding, chunk_embeddings)

    @staticmethod
    def get_top_k_chunks(chunks: List[str], similarity_scores: List[float], k: int = 5) -> List[Tuple[int, str, float]]:
        """
        Retrieve top k chunks based on similarity scores.
        Returns a list of tuples containing (original_chunk_index, chunk_text, similarity_score)
        """
        # Create list of (index, chunk, score) tuples
        chunk_data = list(enumerate(zip(chunks, similarity_scores)))
        # Sort by score in descending order and take top k
        return sorted(chunk_data, key=lambda x: x[1][1], reverse=True)[:k]
