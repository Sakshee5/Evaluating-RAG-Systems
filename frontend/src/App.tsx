import './App.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useRef } from "react"
import { Configuration } from "@/models/configuration"
import { Document } from "@/models/document"
import { Question } from "@/models/question"
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
        setDocuments(session.documents);
        setQuestions(session.questions);
        setConfigurations(session.configurations);
      });
      sessionInitializedRef.current = true;
    }
  }, [fetchSession]);

  const handleStartNewSession = async () => {
    try {
      const sessionId = await startNewSession();
      setCurrentSession(sessionId);
      setActiveTab("configuration");
      // Reset configurations fetch state
      sessionInitializedRef.current = true;
      // Reset state
      setDocuments([]);
      setQuestions([]);
      setConfigurations([]);
      // Fetch session data
      const session = await fetchSession(sessionId);
      setDocuments(session.documents);
      setQuestions(session.questions);
      setConfigurations(session.configurations);
    } catch (error) {
      console.error('Error starting new session:', error);
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
    if (configurations.length === 0) {
      alert("Please create at least one configuration before evaluating.");
      return;
    }
    
    if (currentSession) {
      // Fetch all data before switching to evaluation tab
      const session = await fetchSession(currentSession);
      setDocuments(session.documents);
      setQuestions(session.questions);
      setConfigurations(session.configurations);
    }
    
    setActiveTab("evaluation");
  };

  return (
    <AppLayout currentSession={currentSession} onStartNewSession={handleStartNewSession}>
      {currentSession && (
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
            />
          </TabsContent>
          <TabsContent value="evaluation">
            <EvaluationTab />
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}

export default App