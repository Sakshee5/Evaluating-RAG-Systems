from typing import List, Dict, Any
from models.processed_document import ProcessedDocument
from models.llm_response import LLMResponse, RUSMetrics
from components.chunking import chunk_by_sentence, chunk_by_paragraph, chunk_by_page, chunk_by_tokens
from components.embedding import EmbeddingGenerator
from components.similarity_metrics import SimilarityCalculator
from components.genai import generate_gemini_response, generate_openai_response, format_context_for_llm
from components.utils import calculate_rus
from services.document_service import DocumentService
from services.session_service import SessionService
from models.llm_response import Chunk
from components.visualization import PCA_visualization, tSNE_visualization, UMAP_visualization
from fastapi import HTTPException
import json
import os

class RAGService:
    @staticmethod
    def create_embeddings(
        full_text: str,
        pages: List[str],
        chunking_strategy: str,
        token_size: int,
        sentence_size: int,
        paragraph_size: int,
        page_size: int,
        embedding_model: str
    ) -> tuple[List[str], List[List[float]]]:
        """Create chunks and embeddings for a document"""
        chunks = []

        if chunking_strategy == "sentence":
            chunks = chunk_by_sentence(full_text, size=sentence_size)
        elif chunking_strategy == "paragraph":
            chunks = chunk_by_paragraph(full_text, size=paragraph_size)
        elif chunking_strategy == "page":
            chunks = chunk_by_page(full_text, pages, size=page_size)
        elif chunking_strategy == "tokens":
            chunks = chunk_by_tokens(full_text, token_size=token_size)

        embeddings = EmbeddingGenerator.get_embeddings(chunks, embedding_model)

        return chunks, embeddings

    @staticmethod
    async def run_rag_pipeline(
        query_llm: str,
        api_key: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Run the complete RAG pipeline"""
        # Get session data
        try:
            session = SessionService.get_session(session_id)

            # if session contains answers, delete them
            if session.answers:
                session.answers = []

            configurations = session.configurations
            documents = session.documents
            questions = session.questions
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
        
        processed_doc_path = "data/processed_documents.json"

        # Load existing processed documents
        if os.path.exists(processed_doc_path):
            with open(processed_doc_path, "r", encoding="utf-8") as f:
                try:
                    processed_documents = json.load(f)
                    if not isinstance(processed_documents, list):
                        processed_documents = []  # Reset if not a list
                except json.JSONDecodeError:
                    processed_documents = []  # Reset on JSON error
        else:
            processed_documents = []

        for configuration in configurations:
            try:
                for document in documents:
                    # Check if the document is already processed with the same configuration
                    matched_document = next(
                        (
                            pd for pd in processed_documents
                            if pd["file_name"] == document.file_name
                            and pd["chunking_strategy"] == configuration.chunking_strategy
                            and pd["embedding_model"] == configuration.embedding_model
                            and pd["token_size"] == configuration.token_size
                            and pd["sentence_size"] == configuration.sentence_size
                            and pd["paragraph_size"] == configuration.paragraph_size
                            and pd["page_size"] == configuration.page_size
                        ),
                        None
                    )

                    if matched_document:
                        processed_document = ProcessedDocument(**matched_document)

                        print("Document already processed with the same configuration")

                    else:
                        # Process document
                        full_text, pages = DocumentService.process_document(document.file_path)
                        chunks, embeddings = RAGService.create_embeddings(
                            full_text,
                            pages,
                            configuration.chunking_strategy,
                            configuration.token_size,
                            configuration.sentence_size,
                            configuration.paragraph_size,
                            configuration.page_size,
                            configuration.embedding_model
                        )

                        processed_document = ProcessedDocument(
                            id=document.id,
                            file_name=document.file_name,
                            full_text=full_text,
                            pages=pages,
                            chunks=chunks,
                            embeddings=embeddings,
                            chunking_strategy=configuration.chunking_strategy,
                            token_size=configuration.token_size,
                            sentence_size=configuration.sentence_size,
                            paragraph_size=configuration.paragraph_size,
                            page_size=configuration.page_size,
                            embedding_model=configuration.embedding_model,
                        )

                        # Append the new processed document
                        processed_documents.append(processed_document.model_dump())

                        # Save back as a valid JSON array
                        with open(processed_doc_path, "w", encoding="utf-8") as f:
                            json.dump(processed_documents, f, indent=4)

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

            try:
                # Process each question
                for question in questions:
                    query = question.question_string
                    query_embedding = EmbeddingGenerator.get_embeddings([query], configuration.embedding_model)[0]

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Embedding generation server error: {str(e)}")
            
            try:
                # Calculate similarities and get top chunks
                    similarity_scores = SimilarityCalculator.get_similarity_scores(
                        query_embedding,
                        processed_document.embeddings,
                        configuration.similarity_metric
                    )

                    top_chunks = SimilarityCalculator.get_top_k_chunks(
                        processed_document.chunks,
                        similarity_scores,
                        k=configuration.num_chunks
                    )

            except Exception as e:  
                raise HTTPException(status_code=500, detail=f"Similarity calculation server error: {str(e)}")

            try:
                # Format context and generate response
                    top_chunk_texts = [(chunk, chunk_number) for chunk_number, (chunk, _) in top_chunks]
                    context = format_context_for_llm(top_chunk_texts)

                    if query_llm == "gemini-2.0-flash":
                        answer = generate_gemini_response(query, context, api_key)
                    elif query_llm == "gpt-4o-mini":
                        answer = generate_openai_response(query, context, api_key)

                    chunks_data = []
                    relevance_analysis = answer["relevance_analysis"]

                    # Calculate RUS
                    similarity_scores_list = [similarity_scores[chunk["chunk_number"] - 1] for chunk in relevance_analysis]
                    relevance_scores_list = [chunk["relevance_score"] / 100.0 for chunk in relevance_analysis]  # Normalize to 0-1
                    rus_result = calculate_rus(similarity_scores_list, relevance_scores_list)

                    for chunk in relevance_analysis:
                        chunks_data.append(
                            Chunk(
                                chunk_number=chunk["chunk_number"],
                                text=processed_document.chunks[chunk["chunk_number"] - 1],
                                relevance_score=chunk["relevance_score"],
                                similarity_score=similarity_scores[chunk["chunk_number"] - 1]
                            )
                        )

            except Exception as e:  
                raise HTTPException(status_code=500, detail=f"LLM response generation server error: {str(e)}")

            try:
                # Generate visualization plot
                response_embedding = EmbeddingGenerator.get_embeddings([answer["answer"]], configuration.embedding_model)[0]
                pca_path = PCA_visualization(processed_document.embeddings, query_embedding, response_embedding, [chunk["chunk_number"] - 1 for chunk in relevance_analysis], session_id, question.id)
                tsne_path = tSNE_visualization(processed_document.embeddings, query_embedding, response_embedding, [chunk["chunk_number"] - 1 for chunk in relevance_analysis], session_id, question.id)
                umap_path = UMAP_visualization(processed_document.embeddings, query_embedding, response_embedding, [chunk["chunk_number"] - 1 for chunk in relevance_analysis], session_id, question.id)

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Visualization plot saving server error: {str(e)}")

            try:
                    llm_response = LLMResponse(
                        question=question.question_string,
                        answer=answer["answer"],
                        chunks=chunks_data,
                        visualization_plot=[umap_path, tsne_path, pca_path],  # Order: UMAP, tSNE, PCA
                        rus_metrics=RUSMetrics(
                            rus=rus_result["RUS"],
                            normalized_dcr=rus_result["Normalized_DCR"],
                            scaled_correlation=rus_result["Scaled_Correlation"],
                            wasted_similarity_penalty=rus_result["Wasted_Similarity_Penalty"]
                        )
                    )

                    # save to session
                    session.answers.append(llm_response)
                    with open(f"data/session_{session_id}.json", "w", encoding="utf-8") as f:
                        f.write(session.model_dump_json(indent=4))
                    

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"LLM response saving server error: {str(e)}")

        return session.model_dump()