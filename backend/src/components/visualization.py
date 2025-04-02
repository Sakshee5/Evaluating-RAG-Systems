import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
# import umap
import io
import base64

def plot_embeddings_multi(embeddings_2d, top_chunk_indices, title, x_axis_label, y_axis_label):
    plt.figure(figsize=(8, 6))
    
    # Plot query embedding
    plt.scatter(embeddings_2d[-2, 0], embeddings_2d[-2, 1], color='red', marker='*', s=150, label="Query Embedding")

    # Plot response embedding
    plt.scatter(embeddings_2d[-1, 0], embeddings_2d[-1, 1], color='yellow', marker='*', s=150, label="Response Embedding")
    
    # Plot top relevant chunks in green
    top_points = embeddings_2d[top_chunk_indices]
    plt.scatter(top_points[:, 0], top_points[:, 1], color='green', alpha=0.7, label="Top Relevant Chunks")
    
    # Label each top chunk point with 1-indexed numbers to match frontend display
    for i, idx in enumerate(top_chunk_indices):
        plt.text(top_points[i, 0], top_points[i, 1], f"Chunk {idx + 1}", color='black', fontsize=9, ha='left', va='center')

    # Plot other chunk embeddings in blue
    all_indices = set(range(0, len(embeddings_2d)-2))
    non_top_indices = list(all_indices - set(top_chunk_indices))
    output_points = embeddings_2d[non_top_indices]
    plt.scatter(output_points[:, 0], output_points[:, 1], color='blue', alpha=0.7, label="Chunk Embeddings")
    
    # Add labels for axes and title
    plt.xlabel(x_axis_label)
    plt.ylabel(y_axis_label)
    plt.title(title)
    plt.legend()
    plt.grid()

    # Save the plot as a base64 image
    img_io = io.BytesIO()
    # plt.savefig(img_io, format='png', bbox_inches='tight', dpi=100)

    return img_io

def PCA_visualization(chunks_embs, query_emb, response_emb, top_indices):
    pca = PCA(n_components=2)
    embeddings_2d = pca.fit_transform(np.vstack([chunks_embs, query_emb, response_emb]))
    return plot_embeddings_multi(embeddings_2d, top_indices, "PCA Projection", "PCA Component 1", "PCA Component 2")

# def tSNE_visualization(chunks_embs, query_emb, response_emb, top_indices):
#     perplexity = min(30, max(5, len(chunks_embs) // 4))
#     tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, n_iter=1000)
#     embeddings_2d = tsne.fit_transform(np.vstack([chunks_embs, query_emb, response_emb]))
#     return plot_embeddings_multi(embeddings_2d, top_indices, "t-SNE Projection", "t-SNE Component 1", "t-SNE Component 2")

# def UMAP_visualization(chunks_embs, query_emb, response_emb, top_indices):
#     n_neighbors = min(15, max(5, len(chunks_embs) // 4))
#     reducer = umap.UMAP(n_components=2, n_neighbors=n_neighbors, min_dist=0.1, metric='cosine', random_state=42)
#     embeddings_2d = reducer.fit_transform(np.vstack([chunks_embs, query_emb, response_emb]))
#     return plot_embeddings_multi(embeddings_2d, top_indices, "UMAP Projection", "UMAP Component 1", "UMAP Component 2")
