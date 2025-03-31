import './App.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { ConfigurationForm } from "@/tabs/configuration"
import { DocumentsManager } from "@/tabs/document"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, PlusCircle } from "lucide-react"
import { useStartNewSession } from "@/hooks/useStartNewSession"
import { useFetchConfigurations } from "@/hooks/useFetchConfigurations"
import { useSubmitConfiguration } from "@/hooks/useSubmitConfiguration"
import { useDeleteConfiguration } from "@/hooks/useDeleteConfiguration"
import { Configuration } from "@/models/configuration"
import { Document } from "@/models/document"
import { Question } from "@/models/question"
import { useFetchData } from "@/hooks/useFetchData"

function App() {
  const [activeTab, setActiveTab] = useState("configuration")
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [currentConfiguration, setCurrentConfiguration] = useState<Configuration>({
    chunking_strategy: "fixed",
    chunk_size: 500,
    embedding_model: "text-embedding-ada-002",
    similarity_metric: "cosine",
    num_chunks: 5
  })
  const [documents, setDocuments] = useState<Document[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const sessionInitializedRef = useRef(false);

  // Using our custom hooks
  const { startNewSession } = useStartNewSession();
  const { configurations, fetchConfigurations } = useFetchConfigurations();
  const { submitConfiguration } = useSubmitConfiguration();
  const { deleteConfiguration } = useDeleteConfiguration();
  const { fetchData } = useFetchData();

  // Only run once when component mounts to get session from localStorage
  useEffect(() => {
    if (sessionInitializedRef.current) return;
    
    const sessionId = localStorage.getItem('currentSessionId')
    if (sessionId) {
      setCurrentSession(sessionId);
      // Let the hook handle the initial fetch
      sessionInitializedRef.current = true;
    }
  }, []);

  const handleStartNewSession = async () => {
    try {
      const sessionId = await startNewSession();
      setCurrentSession(sessionId);
      setActiveTab("configuration");
      // Reset configurations fetch state
      sessionInitializedRef.current = true;
      // Reset documents and questions
      setDocuments([]);
      setQuestions([]);
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };

  const handleConfigurationSubmit = async () => {
    if (!currentSession) return;
    
    try {
      const savedConfig = await submitConfiguration({
        ...currentConfiguration,
        name: "Configuration " + (configurations.length + 1)
      }, currentSession, () => {
        // Refresh configurations after submission
        fetchConfigurations(currentSession);
        
        // Reset the form for a new configuration
        setCurrentConfiguration({
          chunking_strategy: "fixed",
          chunk_size: 500,
          embedding_model: "text-embedding-ada-002",
          similarity_metric: "cosine",
          num_chunks: 5
        });
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    try {
      await deleteConfiguration(id, () => {
        // Refresh configurations after deletion
        if (currentSession) {
          fetchConfigurations(currentSession);
        }
      });
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
      const data = await fetchData(currentSession);
      setDocuments(data.documents);
      setQuestions(data.questions);
    }
    
    setActiveTab("evaluation");
  };

  return (
    <>
    <div>
      <div className="header p-6 text-xl border-b flex justify-between items-center">
        <span>RAG Analyzer</span>
        {!currentSession ? (
          <Button onClick={handleStartNewSession}>Start New Session</Button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Session ID: {currentSession}</span>
            <Button variant="outline" size="sm" onClick={handleStartNewSession}>
              <PlusCircle size={16} className="mr-2" />
              New Session
            </Button>
          </div>
        )}
      </div>
    <div className="min-h-screen p-8 pb-8 sm:p-8">      
      <main className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Making RAG Retrieval Transparent & Explainable
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6">
        How to decide whether your RAG pipeline is truly optimized? RAG analyzer helps you visually analyze chunking strategies and embedding models to understand how well your system retrieves relevant information. Compare different methods and gain insights into which configuration works best for your data!
      </p>
      {currentSession && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration">Configuration Set Up</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          </TabsList>
          <TabsContent value="configuration" className="space-y-8">
            {/* Document and Questions Manager */}
            <DocumentsManager 
              sessionId={currentSession} 
              onDocumentsUpdated={setDocuments}
              onQuestionsUpdated={setQuestions}
            />
            
            {/* Configuration Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Add New Configuration</h2>
                <ConfigurationForm 
                  configuration={currentConfiguration}
                  onConfigurationChange={setCurrentConfiguration}
                  onSubmit={handleConfigurationSubmit}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Saved Configurations</h2>
                <div className="space-y-4">
                  {configurations.map((config) => (
                    <Card key={config.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{config.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => config.id && handleDeleteConfiguration(config.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <span className="font-medium">Chunking Strategy:</span> {config.chunking_strategy}
                        </div>
                        <div>
                          <span className="font-medium">Chunk Size:</span> {config.chunk_size}
                        </div>
                        <div>
                          <span className="font-medium">Embedding Model:</span> {config.embedding_model}
                        </div>
                        <div>
                          <span className="font-medium">Similarity Metric:</span> {config.similarity_metric}
                        </div>
                        <div>
                          <span className="font-medium">Number of Chunks:</span> {config.num_chunks}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {configurations.length === 0 && (
                    <p className="text-gray-500 italic">No configurations saved</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleEvaluate}
                disabled={configurations.length === 0}
              >
                Proceed to Evaluation
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="evaluation">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Placeholder for evaluation content */}
                <p className="text-gray-500">
                  This is where the evaluation results would be displayed. You can implement 
                  visualization components like charts and tables to compare different configurations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      </div>
      </main>
    </div>
    </div>
    </>
  )
}

export default App