import './App.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useRef } from "react"
import { Configuration } from "@/models/configuration"
import { Document } from "@/models/document"
import { Question } from "@/models/question"
import { LLMResponse } from "@/models/llm_response"
import { useStartNewSession } from "@/hooks/useStartNewSession"
import { useSubmitConfiguration } from "@/hooks/useSubmitConfiguration"
import { useDeleteConfiguration } from "@/hooks/useDeleteConfiguration"
import { useFetchSession } from "@/hooks/useFetchSession"
import { AppLayout } from "@/components/layout/AppLayout"
import { ConfigurationTab } from "@/features/configuration/components/ConfigurationTab"
import { DocumentManager } from "@/features/documents/components/DocumentManager"
import { EvaluationTab } from "@/features/evaluation/components/EvaluationTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  const [activeTab, setActiveTab] = useState("configuration")
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [currentConfiguration, setCurrentConfiguration] = useState<Configuration>({
    chunking_strategy: "sentence",
    sentence_size: 1,
    paragraph_size: 1,
    page_size: 1,
    token_size: 1,
    embedding_model: "sentence-transformer",
    similarity_metric: "cosine",
    num_chunks: 5
  })
  const [documents, setDocuments] = useState<Document[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [ragResults, setRagResults] = useState<LLMResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const sessionInitializedRef = useRef(false);

  // Using our custom hooks
  const { startNewSession } = useStartNewSession();
  const { submitConfiguration } = useSubmitConfiguration();
  const { deleteConfiguration } = useDeleteConfiguration();
  const { fetchSession } = useFetchSession();

  // Only run once when component mounts to get session from localStorage
  useEffect(() => {
    if (sessionInitializedRef.current) return;
    
    const sessionId = localStorage.getItem('currentSessionId')
    if (sessionId) {
      setCurrentSession(sessionId);
      // Fetch session data
      fetchSession(sessionId).then(session => {
        if (session) {
          setDocuments(session.documents || []);
          setQuestions(session.questions || []);
          setConfigurations(session.configurations || []);
          setRagResults(session.answers || []);
          setIsLoading(false);
        } else {
          // If session not found, clear localStorage and reset state
          localStorage.removeItem('currentSessionId');
          setCurrentSession(null);
          setSessionError(true);
          setIsLoading(false);
        }
      }).catch(error => {
        console.error('Error fetching session:', error);
        // On error, clear localStorage and reset state
        localStorage.removeItem('currentSessionId');
        setCurrentSession(null);
        setSessionError(true);
        setIsLoading(false);
      });
      sessionInitializedRef.current = true;
    } else {
      setIsLoading(false);
    }
  }, [fetchSession]);

  const handleStartNewSession = async () => {
    try {
      const sessionId = await startNewSession();
      setCurrentSession(sessionId);
      setActiveTab("configuration");
      setSessionError(false);
      // Reset configurations fetch state
      sessionInitializedRef.current = true;
      // Reset state
      setDocuments([]);
      setQuestions([]);
      setConfigurations([]);
      setRagResults([]);
      // Fetch session data
      const session = await fetchSession(sessionId);
      if (session) {
        setDocuments(session.documents || []);
        setQuestions(session.questions || []);
        setConfigurations(session.configurations || []);
        setRagResults(session.answers || []);
      }
    } catch (error) {
      console.error('Error starting new session:', error);
      setSessionError(true);
      setCurrentSession(null);
    }
  };

  const handleConfigurationSubmit = async () => {
    if (!currentSession) return;
    
    try {
      const savedConfig = await submitConfiguration(currentConfiguration, currentSession); 
      setConfigurations([...configurations, savedConfig]);

      // Reset the form for a new configuration
      setCurrentConfiguration({
        chunking_strategy: "sentence",
        sentence_size: 1,
        paragraph_size: 1,
        page_size: 1,
        token_size: 1,
        embedding_model: "sentence-transformer",
        similarity_metric: "cosine",
        num_chunks: 5
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    if (!id || !currentSession) return;
    
    try {
      await deleteConfiguration(id, currentSession);
      setConfigurations(configurations.filter(config => config.id !== id));
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  const handleEvaluate = async () => {
    if (configurations.length === 0 || documents.length === 0 || questions.length === 0) {
      alert("Please add at least one document, one configuration, and one question before proceeding to evaluation.");
      return;
    }
    
    if (currentSession) {
      // Fetch all data before switching to evaluation tab
      const session = await fetchSession(currentSession);
      if (session) {
        setDocuments(session.documents || []);
        setQuestions(session.questions || []);
        setConfigurations(session.configurations || []);
        setRagResults(session.answers || []);
      }
    }
    
    setActiveTab("evaluation");
  };

  if (isLoading) {
    return (
      <AppLayout currentSession={null} onStartNewSession={handleStartNewSession}>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentSession || sessionError) {
    return (
      <AppLayout currentSession={null} onStartNewSession={handleStartNewSession}>
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle>Welcome to RAG Evaluator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Start a new session to begin evaluating your RAG system.</p>
            <Button onClick={handleStartNewSession}>Start New Session</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentSession={currentSession} onStartNewSession={handleStartNewSession}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Configuration Set Up</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration" className="space-y-8">
          {/* Document and Questions Manager */}
          <DocumentManager 
            sessionId={currentSession} 
            onDocumentsUpdated={setDocuments}
            onQuestionsUpdated={setQuestions}
          />
          
          {/* Configuration Section */}
          <ConfigurationTab
            currentConfiguration={currentConfiguration}
            configurations={configurations}
            onConfigurationChange={setCurrentConfiguration}
            onSubmit={handleConfigurationSubmit}
            onDelete={handleDeleteConfiguration}
            onEvaluate={handleEvaluate}
            canProceedToEvaluation={documents.length > 0 && questions.length > 0 && configurations.length > 0}
          />
        </TabsContent>
        <TabsContent value="evaluation">
          <EvaluationTab sessionId={currentSession} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

export default App