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
          {currentSession ? (
            <>
              <div>
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Making RAG Retrieval Transparent & Explainable
                </h1>
                <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6">
                  How do you know if your RAG pipeline is truly optimized? Is getting the right answer enough?
                </p>
                <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6">
                  RAG Analyzer helps you compare different configurations to see what your model retrieves vs. what it should retrieve. Moreover, it not only helps you identify misalignments between similarity scores of retrieved chunks and actual relevance, but also helps identify the best configuration for your RAG pipeline.
                </p>
              </div>
              {children}
            </>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}; 