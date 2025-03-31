import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload, Plus } from "lucide-react";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useDeleteDocument } from "@/hooks/useDeleteDocument";
import { useAddQuestion } from "@/hooks/useAddQuestion";
import { useDeleteQuestion } from "@/hooks/useDeleteQuestion";
import { Document } from "@/models/document";
import { Question } from "@/models/question";

interface DocumentsManagerProps {
  sessionId: string;
  onDocumentsUpdated?: (documents: Document[]) => void;
  onQuestionsUpdated?: (questions: Question[]) => void;
}

export function DocumentsManager({ sessionId, onDocumentsUpdated, onQuestionsUpdated }: DocumentsManagerProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Using our custom hooks
  const { uploadDocument } = useDocumentUpload();
  const { deleteDocument } = useDeleteDocument();
  const { addQuestion } = useAddQuestion();
  const { deleteQuestion } = useDeleteQuestion();

  // Document handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newDoc = await uploadDocument(file, sessionId);
      setDocuments(prev => [...prev, newDoc]);
      if (onDocumentsUpdated) onDocumentsUpdated([...documents, newDoc]);
    } catch (error) {
      console.error('Error uploading document:', error);
    }

    // Reset the input
    event.target.value = "";
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      if (onDocumentsUpdated) onDocumentsUpdated(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // Question handlers
  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const newQ = await addQuestion(newQuestion, sessionId);
      setQuestions(prev => [...prev, newQ]);
      if (onQuestionsUpdated) onQuestionsUpdated([...questions, newQ]);
      // Clear the input
      setNewQuestion("");
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (onQuestionsUpdated) onQuestionsUpdated(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

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
            <Button onClick={handleAddQuestion} className="flex-shrink-0">
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
                  onClick={() => handleDeleteQuestion(question.id || "")}
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