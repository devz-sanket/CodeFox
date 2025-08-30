
import React from 'react';

interface ExplainerProps {
  explanation: string | null;
  isLoading: boolean;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    <div className="mt-6 h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
  </div>
);

export const Explainer: React.FC<ExplainerProps> = ({ explanation, isLoading }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <p>Click "Explain Code" to get an AI-powered breakdown of the code in the editor.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
      <div dangerouslySetInnerHTML={{ __html: explanation.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>') }} />
    </div>
  );
};
