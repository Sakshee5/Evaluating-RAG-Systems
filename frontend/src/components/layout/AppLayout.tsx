import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface AppLayoutProps {
  currentSession: string | null;
  onStartNewSession: () => void;
  children: React.ReactNode;
}

export const AppLayout = ({ currentSession, onStartNewSession, children }: AppLayoutProps) => {
  return (
    <div>
      <div className="header p-6 text-xl border-b flex justify-between items-center">
        <span>RAG Analyzer</span>
        {!currentSession ? (
          <Button onClick={onStartNewSession}>Start New Session</Button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Session ID: {currentSession}</span>
            <Button variant="outline" size="sm" onClick={onStartNewSession}>
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 