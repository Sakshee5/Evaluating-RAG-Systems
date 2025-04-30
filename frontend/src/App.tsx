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

function App() {
  const [activeTab, setActiveTab] = useState("configuration")
  const [currentSession, setCurrentSession] = useState<string>("")
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
  const [error, setError] = useState<string | null>(null);
  const sessionInitializedRef = useRef(false);

  // Using our custom hooks
  const { startNewSession } = useStartNewSession();
  const { submitConfiguration } = useSubmitConfiguration();
  const { deleteConfiguration } = useDeleteConfiguration();
  const { fetchSession } = useFetchSession();

  // Initialize session on component mount
  useEffect(() => {
    if (sessionInitializedRef.current) return;
    
    const initializeSession = async () => {
      try {
        // Check if we already have a session ID in localStorage
        const existingSessionId = localStorage.getItem('currentSessionId');
        let sessionId: string;

        if (existingSessionId) {
          // Try to fetch the existing session
          try {
            const session = await fetchSession(existingSessionId);
            if (session) {
              sessionId = existingSessionId;
              setDocuments(session.documents || []);
              setQuestions(session.questions || []);
              setConfigurations(session.configurations || []);
              setRagResults(session.answers || []);
            } else {
              // If session doesn't exist, create a new one
              sessionId = await startNewSession();
            }
          } catch (error) {
            // If there's an error fetching the session, create a new one
            sessionId = await startNewSession();
          }
        } else {
          // No existing session, create a new one
          sessionId = await startNewSession();
        }

        setCurrentSession(sessionId);
        setActiveTab("configuration");
        setError(null);
        
        // Only reset state if we created a new session
        if (!existingSessionId) {
          setDocuments([]);
          setQuestions([]);
          setConfigurations([]);
          setRagResults([]);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setError('Failed to initialize session. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
        sessionInitializedRef.current = true;
      }
    };

    initializeSession();
  }, [startNewSession, fetchSession]);

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
      <AppLayout currentSession="">
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout currentSession="">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentSession={currentSession}>
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