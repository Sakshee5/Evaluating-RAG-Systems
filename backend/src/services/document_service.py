import os
import PyPDF2
from typing import Tuple, List
from models.document import Document
from models.session import Session
import uuid

class DocumentService:
    @staticmethod
    def process_document(file_path: str) -> Tuple[str, List[str]]:
        """Process a PDF document and return its full text and pages"""
        pdf_reader = PyPDF2.PdfReader(file_path)
        
        full_text = ""
        pages = []

        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            pages.append(page_text)
            full_text += page_text + "\n\n"

        return full_text, pages

    @staticmethod
    async def save_document(file_content: bytes, filename: str, session_id: str) -> Document:
        """Save a document and create a Document object"""
        # Ensure the documents directory exists
        if not os.path.exists("data/documents"):
            os.makedirs("data/documents")

        # Save the file if it doesn't exist
        file_path = f"data/documents/{filename}"
        with open(file_path, "wb") as f:
            f.write(file_content)

        # Create a new Document object
        document = Document(
            id=str(uuid.uuid4()),
            file_name=filename,
            file_path=file_path,
            file_type="application/pdf",  # Assuming PDF for now
            file_size=len(file_content),
            file_extension=filename.split(".")[-1],
            session_id=session_id,
        )

        # Update session with new document
        with open(f"data/session_{session_id}.json", "r") as f:
            session = Session.model_validate_json(f.read())
            session.documents.append(document)

        with open(f"data/session_{session_id}.json", "w") as f:
            f.write(session.model_dump_json(indent=4))

        return document

    @staticmethod
    def delete_document(document_id: str, session_id: str) -> None:
        """Delete a document from the session"""
        with open(f"data/session_{session_id}.json", "r") as f:
            session = Session.model_validate_json(f.read())
            session.documents = [doc for doc in session.documents if doc.id != document_id]

        with open(f"data/session_{session_id}.json", "w") as f:
            f.write(session.model_dump_json(indent=4)) 