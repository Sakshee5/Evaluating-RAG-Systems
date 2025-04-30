interface AppLayoutProps {
  currentSession: string;
  children: React.ReactNode;
}

export const AppLayout = ({ currentSession, children }: AppLayoutProps) => {
  return (
    <div>
      <div className="header p-6 text-xl border-b flex justify-between items-center">
        <span>RAG Analyzer</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Session ID: {currentSession}</span>
        </div>
      </div>
      <div className="min-h-screen p-8 pb-8 sm:p-8">      
        <main className="max-w-4xl mx-auto flex flex-col gap-8">
          <div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Making RAG Retrieval Explainable
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6">
              Just because your model gives the right answer doesn’t mean it got there the right way.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6 mb-6">
              RAG Analyzer helps you compare different configurations to see what your model retrieves vs. what it should retrieve. It introduces a <strong>Retrieval Utilization Score</strong>, a metric that measures whether your top chunks are actually useful, not just similar. Combined with latent space visualizations, it gives you a clear, explainable view so that you can select the best configuration for your RAG pipeline.
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}; 