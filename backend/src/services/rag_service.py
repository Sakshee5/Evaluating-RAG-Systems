from typing import List, Dict, Any
from models.processed_document import ProcessedDocument
from models.llm_response import LLMResponse
from components.chunking import chunk_by_sentence, chunk_by_paragraph, chunk_by_page, chunk_by_tokens
from components.embedding import EmbeddingGenerator
from components.similarity_metrics import SimilarityCalculator
from components.utils import generate_gemini_response, generate_openai_response, format_context_for_llm
from services.document_service import DocumentService
from services.session_service import SessionService
from models.llm_response import Chunk
from components.visualization import PCA_visualization
import uuid
from fastapi import HTTPException
import matplotlib.pyplot as plt

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
    ) -> List[LLMResponse]:
        """Run the complete RAG pipeline"""
        # Get session data
        try:
            session = SessionService.get_session(session_id)
            configurations = session.configurations
            documents = session.documents
            questions = session.questions
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

        all_responses = []

        for configuration in configurations:
            try:
                for document in documents:
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

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

            # Save processed document
            with open(f"data/processed_documents.json", "a") as f:
                f.write(processed_document.model_dump_json(indent=4))

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
                img_base64 = PCA_visualization(processed_document.embeddings, query_embedding, response_embedding, [chunk["chunk_number"] - 1 for chunk in relevance_analysis])

                # # Save visualization plot to data/plots with unique filename
                # plot_filename = f"data/plots/plot_{uuid.uuid4()}.png"
                # plt.savefig(plot_filename, format='png', bbox_inches='tight', dpi=100)

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Visualization plot saving server error: {str(e)}")

            try:
                    llm_response = LLMResponse(
                        question=question.question_string,
                        answer=answer["answer"],
                        chunks=chunks_data,
                        visualization_plot=img_base64
                    )

                    all_responses.append(llm_response)

                    # Save response
                    with open(f"data/llm_responses_{session_id}.json", "a") as f:
                        f.write(llm_response.model_dump_json(indent=4))

            except Exception as e:
                raise HTTPException(status_code=500, detail=f"LLM response saving server error: {str(e)}")

        return all_responses

    @staticmethod
    async def run_judge_pipeline(
        judge_llm: str,
        api_key: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Run the judge pipeline to evaluate RAG responses"""
        # TODO: Implement judge pipeline
        return {"message": "Judge pipeline run!"} 