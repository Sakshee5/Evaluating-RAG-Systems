import numpy as np
from scipy.stats import spearmanr

# Normalized Discounted Cumulative Relevance (DCR)
def dcg(scores):
    return sum(rel / np.log2(idx + 2) for idx, rel in enumerate(scores))

def calculate_rus(similarity_scores, relevance_scores, alpha=0.5, beta=0.4, gamma=0.1):
    
    ideal_relevance = sorted(relevance_scores, reverse=True)
    actual_dcr = dcg(relevance_scores)
    ideal_dcr = dcg(ideal_relevance)
    normalized_dcr = actual_dcr / ideal_dcr if ideal_dcr > 0 else 0

    # Spearman rank correlation between similarity and relevance
    corr, _ = spearmanr(similarity_scores, relevance_scores)
    scaled_corr = (corr + 1) / 2  # Scale to [0, 1]

    # Wasted Similarity Penalty
    total_similarity = sum(similarity_scores)
    wasted_similarity = sum(sim for sim, rel in zip(similarity_scores, relevance_scores) if rel == 0)
    waste_penalty = wasted_similarity / total_similarity if total_similarity > 0 else 0

    rus = alpha * normalized_dcr + beta * scaled_corr - gamma * waste_penalty

    return {
        "RUS": rus,
        "Normalized_DCR": normalized_dcr,
        "Scaled_Correlation": scaled_corr,
        "Wasted_Similarity_Penalty": waste_penalty
    }