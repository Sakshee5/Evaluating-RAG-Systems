from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.session import Session
from models.configuration import Configuration
from models.document import Document
from models.question import Question
from fastapi import UploadFile, File, Form
import uuid
from datetime import datetime
from typing import List

app = FastAPI(root_path='/api')

# list of allowed origins
origins = [
    "http://localhost:5173",
    "http://vcm-45508.vm.duke.edu",
    "http://localhost:5174",
    "http://localhost:8080",
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello world!"}

@app.post("/session")
async def create_session(session: Session):
    # Generate a unique ID for the session
    session.id = str(uuid.uuid4())
    session.created_at = datetime.utcnow()
    session.documents = []
    session.questions = []
    session.configurations = []
    
    # Here you would typically save the session to a database
    # For now, we'll just return the created session
    return session

@app.get("/configurations/{sessionId}")
async def get_configurations(sessionId: str):
   
   # TODO: get configurations from database. Setting default values for now.
   configs = Configuration(
      id = "1",
      name = "Default Configuration",
      session_id = sessionId,
      created_at = datetime.utcnow(),
      chunking_strategy = "fixed",
      chunk_size = 1024,
      embedding_model = "text-embedding-ada-002",
      similarity_metric = "cosine",
      num_chunks = 5

   )

   return [configs]

@app.post("/configuration")
async def create_configuration(configuration: Configuration):
    
    # TODO: save configuration to database
    return configuration

@app.delete("/configuration/{configurationId}")
async def delete_configuration(configurationId: str):
    # TODO: delete configuration from database
    return {"message": "Configuration deleted!"}


@app.post("/document/upload")
async def upload_document(file: UploadFile = File(...), session_id: str = Form(...)):
    # TODO: save document to database
    return {"message": "Document uploaded!"}


@app.delete("/document/{documentId}")
async def delete_document(documentId: str):
    # TODO: delete document from database
    return {"message": "Document deleted!"}


@app.post("/question")
async def create_question(question: Question):
    # TODO: save question to database
    return question

@app.delete("/question/{questionId}")
async def delete_question(questionId: str):
    # TODO: delete question from database
    return {"message": "Question deleted!"}


@app.get("/documents/{sessionId}")
async def get_documents(sessionId: str):
    # TODO: get documents from database
    return []

@app.get("/questions/{sessionId}")
async def get_questions(sessionId: str):
    # TODO: get questions from database
    return []