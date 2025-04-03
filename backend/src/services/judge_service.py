import json
from typing import Dict, Any
from services.session_service import SessionService
from models.llm_response import LLMResponse
from components.genai import generate_judge_gemini_response, generate_judge_openai_response

class JudgeService:
    @staticmethod
    async def run_judge_pipeline(
        judge_llm: Any,
        api_key: str,
        session_id: str
    ) -> Dict[str, Any]:
        """Run the judge pipeline to evaluate RAG responses"""

        # Get session data
        session = SessionService.get_session(session_id)
        configurations = session.configurations
        answers = session.answers

        # Prepare input for Judge LLM
        judge_input = {
            "questions": []
        }

        for answer in answers:
            question_data = {
                "question": answer.question,
                "configurations": []
            }

            for config in configurations:
                config_data = {
                    "chunking_strategy": config.chunking_strategy,
                    "embedding_model": config.embedding_model,
                    "similarity_metric": config.similarity_metric,
                    "num_chunks": config.num_chunks,
                    "chunks": [
                        {
                            "chunk_number": chunk.chunk_number,
                            "similarity_score": chunk.similarity_score,
                            "relevance_score": chunk.relevance_score
                        }
                        for chunk in answer.chunks
                    ],
                    "answer": answer.answer
                }
                question_data["configurations"].append(config_data)
            
            judge_input["questions"].append(question_data)

        # Convert to JSON string for LLM processing
        judge_input_json = json.dumps(judge_input, indent=4)
        
        try:
            if judge_llm == "gemini-2.0-flash":
                judge_response = generate_judge_gemini_response(api_key=api_key, input_data=judge_input_json)
            elif judge_llm == "gpt-4o-mini":
                judge_response = generate_judge_openai_response(api_key=api_key, input_data=judge_input_json)
            else:
                raise ValueError("Invalid LLM model")
            
            return judge_response
        except Exception as e:
            return {"error": f"Error: {str(e)}"}
