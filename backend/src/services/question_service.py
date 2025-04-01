from models.question import Question
from models.session import Session
import uuid

class QuestionService:
    @staticmethod
    def add_question(question_string: str, session_id: str) -> Question:
        """Add a question to a session"""
        question = Question(
            id=str(uuid.uuid4()),
            question_string=question_string,
            session_id=session_id,
        )
        
        with open(f"data/session_{session_id}.json", "r") as f:
            session = Session.model_validate_json(f.read())
            session.questions.append(question)

        with open(f"data/session_{session_id}.json", "w") as f:
            f.write(session.model_dump_json(indent=4))

        return question

    @staticmethod
    def delete_question(question_id: str, session_id: str) -> None:
        """Delete a question from a session"""
        with open(f"data/session_{session_id}.json", "r") as f:
            session = Session.model_validate_json(f.read())
            session.questions = [q for q in session.questions if q.id != question_id]

        with open(f"data/session_{session_id}.json", "w") as f:
            f.write(session.model_dump_json(indent=4))
