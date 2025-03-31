import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload, Plus } from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_extension: string;
  session_id: string;
  created_at: string;
  processed: boolean;
}

interface Question {
  id: string;
  text: string;
  session_id: string;
  created_at: string;
}

interface DocumentsManagerProps {
  sessionId: string;
  onDocumentsUpdated?: () => void;
}

export function DocumentsManager({ sessionId, onDocumentsUpdated }: DocumentsManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Document handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    try {
      const response = await fetch('http://localhost:8000/api/document/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (error) {
      console.error('Error uploading document:', error);
    }

    // Reset the input
    event.target.value = "";
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/document/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc.id !== id));
      if (onDocumentsUpdated) onDocumentsUpdated();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Question handlers
  const addQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          text: newQuestion,
          session_id: sessionId,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const question = await response.json();
      setQuestions([...questions, question]);
      setNewQuestion("");
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/question/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Load documents and questions when component mounts
  useState(() => {
    const fetchData = async () => {
      try {
        // Fetch documents
        const docsResponse = await fetch(`http://localhost:8000/api/documents/${sessionId}`);
        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          setDocuments(docs);
        }

        // Fetch questions
        const questionsResponse = await fetch(`http://localhost:8000/api/questions/${sessionId}`);
        if (questionsResponse.ok) {
          const questionData = await questionsResponse.json();
          setQuestions(questionData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (sessionId) {
      fetchData();
    }
  });

  return (
    <div className="space-y-8">
      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} />
                Upload Document
              </label>
            </Button>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="font-medium truncate max-w-xl">{doc.file_name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-gray-500 italic">No documents uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Textarea
              placeholder="Enter a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addQuestion} className="flex-shrink-0">
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {questions.map(question => (
              <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="flex-1">{question.text}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-gray-500 italic">No questions added</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}