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
        
        try:
            with open(f"data/session_{session_id}.json", "r", encoding="utf-8") as f:
                session = Session.model_validate_json(f.read())
                session.questions.append(question)

            with open(f"data/session_{session_id}.json", "w", encoding="utf-8") as f:
                f.write(session.model_dump_json(indent=4))

            return question
        except FileNotFoundError:
            raise ValueError(f"Session {session_id} not found")
        except Exception as e:
            raise ValueError(f"Failed to add question: {str(e)}")

    @staticmethod
    def delete_question(question_id: str, session_id: str) -> None:
        """Delete a question from a session"""
        try:
            with open(f"data/session_{session_id}.json", "r", encoding="utf-8") as f:
                session = Session.model_validate_json(f.read())
                original_length = len(session.questions)
                session.questions = [q for q in session.questions if q.id != question_id]
                
                if len(session.questions) == original_length:
                    raise ValueError(f"Question {question_id} not found in session {session_id}")

            with open(f"data/session_{session_id}.json", "w", encoding="utf-8") as f:
                f.write(session.model_dump_json(indent=4))
        except FileNotFoundError:
            raise ValueError(f"Session {session_id} not found")
        except Exception as e:
            raise ValueError(f"Failed to delete question: {str(e)}")
