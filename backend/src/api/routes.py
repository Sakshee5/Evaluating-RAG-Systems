from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from services.session_service import SessionService
from services.document_service import DocumentService
from services.rag_service import RAGService
from services.question_service import QuestionService
from services.configuration_service import ConfigurationService
from services.judge_service import JudgeService

router = APIRouter()

class QuestionCreate(BaseModel):
    question_string: str
    session_id: str

class ConfigurationCreate(BaseModel):
    session_id: str 
    chunking_strategy: str
    token_size: Optional[int] = None
    sentence_size: Optional[int] = None
    paragraph_size: Optional[int] = None
    page_size: Optional[int] = None
    embedding_model: str
    similarity_metric: str
    num_chunks: int

class RunRAG(BaseModel):
    query_llm: str
    api_key: str
    session_id: str

class RunJudge(BaseModel):
    judge_llm: str
    api_key: str
    session_id: str

@router.get("/")
async def root():
    return {"message": "Hello world!"}

@router.post("/create/session")
async def create_session():
    try:
        return SessionService.create_session()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/upload/document")
async def upload_document(file: UploadFile = File(...), session_id: str = Form(...)):
    try:
        file_content = await file.read()
        return await DocumentService.save_document(file_content, file.filename, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/create/question")
async def create_question(question_data: QuestionCreate):
    try:
        return QuestionService.add_question(question_data.question_string, question_data.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/create/configuration")
async def create_configuration(configuration_data: ConfigurationCreate):
    try:
        return ConfigurationService.add_configuration(
            configuration_data.session_id,
            configuration_data.chunking_strategy,
            configuration_data.token_size,
            configuration_data.sentence_size,
            configuration_data.paragraph_size,
            configuration_data.page_size,
            configuration_data.embedding_model,
            configuration_data.similarity_metric,
            configuration_data.num_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.delete("/delete/document")
async def delete_document(document_id: str, session_id: str):
    try:
        DocumentService.delete_document(document_id, session_id)
        return {"message": "Document deleted!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.delete("/delete/question")
async def delete_question(question_id: str, session_id: str):
    try:
        QuestionService.delete_question(question_id, session_id)
        return {"message": "Question deleted!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.delete("/delete/configuration")
async def delete_configuration(configuration_id: str, session_id: str):
    try:
        ConfigurationService.delete_configuration(configuration_id, session_id)
        return {"message": "Configuration deleted!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/get/session")
async def get_session(session_id: str):
    try:
        return SessionService.get_session(session_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/run/rag")
async def run_rag(run_rag_data: RunRAG):
    try:
        return await RAGService.run_rag_pipeline(run_rag_data.query_llm, run_rag_data.api_key, run_rag_data.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.post("/run/judge")
async def run_judge(run_judge_data: RunJudge):
    try:
        return await JudgeService.run_judge_pipeline(run_judge_data.judge_llm, run_judge_data.api_key, run_judge_data.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}") 