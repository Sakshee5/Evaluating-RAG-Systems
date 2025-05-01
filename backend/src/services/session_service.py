import os
import uuid
from models.session import Session

class SessionService:
    @staticmethod
    def create_session() -> Session:
        """Create a new session"""
        session = Session()
        session.id = str(uuid.uuid4())
        session.documents = []
        session.questions = []
        session.configurations = []
            
        with open(f"data/session_{session.id}.json", "w", encoding="utf-8") as f:
            f.write(session.model_dump_json(indent=4))
        
        return session

    @staticmethod
    def get_session(session_id: str) -> Session:
        """Get a session by ID"""

        try:
            file_path = f"data/session_{session_id}.json"
            # Check if file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Session file not found: {file_path}")
                
            with open(file_path, "r", encoding="utf-8") as f:
                return Session.model_validate_json(f.read())
        except FileNotFoundError:
            raise ValueError(f"Session file not found: {file_path}")
        except Exception as e:
            # Log the error or handle it appropriately
            raise ValueError(f"Failed to retrieve session {session_id}: {str(e)}")