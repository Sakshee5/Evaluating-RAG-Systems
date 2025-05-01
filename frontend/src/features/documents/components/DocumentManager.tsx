import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Upload } from "lucide-react"
import { Document } from "@/models/document"
import { Question } from "@/models/question"
import { useDocumentUpload } from "@/hooks/useDocumentUpload"
import { useDeleteDocument } from "@/hooks/useDeleteDocument"
import { useAddQuestion } from "@/hooks/useAddQuestion"
import { useDeleteQuestion } from "@/hooks/useDeleteQuestion"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentManagerProps {
  sessionId: string;
  initialDocuments?: Document[];
  initialQuestions?: Question[];
  onDocumentsUpdated: (documents: Document[]) => void;
  onQuestionsUpdated: (questions: Question[]) => void;
}

export const DocumentManager = ({ 
  sessionId, 
  initialDocuments = [], 
  initialQuestions = [], 
  onDocumentsUpdated, 
  onQuestionsUpdated 
}: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const { uploadDocument } = useDocumentUpload();
  const { deleteDocument } = useDeleteDocument();
  const { addQuestion } = useAddQuestion();
  const { deleteQuestion } = useDeleteQuestion();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const newDoc = await uploadDocument(file, sessionId);
      setDocuments([...documents, newDoc]);
      onDocumentsUpdated([...documents, newDoc]);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId, sessionId);
      const updatedDocs = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocs);
      onDocumentsUpdated(updatedDocs);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const question = await addQuestion(newQuestion, sessionId);
      setQuestions([...questions, question]);
      onQuestionsUpdated([...questions, question]);
      setNewQuestion("");
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion(questionId, sessionId);
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      onQuestionsUpdated(updatedQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
      setError('Failed to delete question. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF Document
                  </div>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{doc.file_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Enter a question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
              />
              <Button onClick={handleAddQuestion}>Add Question</Button>
            </div>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{q.question_string ?? ""}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(q.id ?? "")}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 