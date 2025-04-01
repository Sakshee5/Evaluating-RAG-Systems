from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.session import Session
from models.configuration import Configuration
from models.document import Document
from models.question import Question
from fastapi import UploadFile, File, Form
import uuid
import os
from pydantic import BaseModel


# if the data/documents folder doesn't exist, create it
if not os.path.exists("data"):
    os.makedirs("data")

if not os.path.exists("data/documents"):
    os.makedirs("data/documents")

app = FastAPI(root_path='/api')

# list of allowed origins
origins = [
    "http://localhost:5173",
    "http://vcm-45508.vm.duke.edu",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
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

@app.post("/create/session")
async def create_session():
    try:
        session = Session()
        session.id = str(uuid.uuid4())
        session.documents = []
        session.questions = []
        session.configurations = []
        
        # Ensure the data directory exists
        if not os.path.exists("data"):
            os.makedirs("data")
            
        with open(f"data/session_{session.id}.json", "a") as f:
            f.write(session.model_dump_json(indent=4))
        
        return session
    except Exception as e:
        # Log the error
        print(f"Error creating session: {str(e)}")
        # Return a more helpful error response
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/upload/document")
async def upload_document(file: UploadFile = File(...), session_id: str = Form(...)):

    # save the file to the data/documents folder if it doesn't exist
    if not os.path.exists(f"data/documents/{file.filename}"):
        with open(f"data/documents/{file.filename}", "wb") as f:
            f.write(await file.read())

    # Create a new Document object
    document = Document(
        id=str(uuid.uuid4()),
        file_name=file.filename,
        file_path=f"data/documents/{file.filename}",
        file_type=file.content_type, 
        file_size=file.size,
        file_extension=file.filename.split(".")[-1],
        session_id=session_id,
    ) 

    with open(f"data/session_{session_id}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        session.documents.append(document)

    with open(f"data/session_{session_id}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return document


# Create a model for the incoming JSON data
class QuestionCreate(BaseModel):
    question_string: str
    session_id: str

@app.post("/create/question")
async def create_question(question_data: QuestionCreate):
    # Create a new Question object
    question = Question(
        id=str(uuid.uuid4()),
        question_string=question_data.question_string,
        session_id=question_data.session_id,
    )
    
    # Save the question to the session
    with open(f"data/session_{question_data.session_id}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        session.questions.append(question)

    with open(f"data/session_{question_data.session_id}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return question


class ConfigurationCreate(BaseModel):
    session_id: str 
    chunking_strategy: str
    chunk_size: int
    embedding_model: str
    similarity_metric: str
    num_chunks: int

@app.post("/create/configuration")
async def create_configuration(configuration_data: ConfigurationCreate):
    
    configuration = Configuration()
    configuration.id = str(uuid.uuid4())
    configuration.chunking_strategy = configuration_data.chunking_strategy
    configuration.chunk_size = configuration_data.chunk_size
    configuration.embedding_model = configuration_data.embedding_model
    configuration.similarity_metric = configuration_data.similarity_metric
    configuration.num_chunks = configuration_data.num_chunks

    with open(f"data/session_{configuration_data.session_id}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        session.configurations.append(configuration)

    with open(f"data/session_{configuration_data.session_id}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return configuration

@app.delete("/delete/document")
async def delete_document(documentId: str, session_id: str):
    
    with open(f"data/session_{session_id}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        session.documents = [doc for doc in session.documents if doc.id != documentId]

    with open(f"data/session_{session_id}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return {"message": "Document deleted!"}


@app.delete("/delete/question")
async def delete_question(questionId: str, session_id: str):

    with open(f"data/session_{session_id}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        session.questions = [q for q in session.questions if q.id != questionId]

    with open(f"data/session_{session_id}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return {"message": "Question deleted!"}


@app.delete("/delete/configuration")
async def delete_configuration(configurationId: str, sessionId: str):
    
    with open(f"data/session_{sessionId}.json", "r") as f:
        session = Session.model_validate_json(f.read())
    
        # remove the configuration from the session
        session.configurations = [config for config in session.configurations if config.id != configurationId]

    with open(f"data/session_{sessionId}.json", "w") as f:
        f.write(session.model_dump_json(indent=4))

    return {"message": "Configuration deleted!"}


@app.get("/get/session")
async def get_session(sessionId: str):
    """For evaluating the session"""

    with open(f"data/session_{sessionId}.json", "r") as f:
        session = Session.model_validate_json(f.read())
        return session
    
@app.post("/evaluate")
async def evaluate(query_llm: str, judge_llm: str):
    """For evaluating the session"""

    return {"message": "Session evaluated!"}
