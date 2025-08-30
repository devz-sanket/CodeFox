
import React from 'react';
import { DebugResult } from '../types';

interface DebuggerProps {
  result: DebugResult | null;
  isLoading: boolean;
}

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
    <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
  </div>
);

export const Debugger: React.FC<DebuggerProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <p>Run your code to see the AI debugger in action!</p>
        <p className="text-sm mt-2">If you have an error, the explanation will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      <div>
        <h3 className="text-lg font-semibold text-red-500 dark:text-red-400">{result.errorName}</h3>
        <p className="mt-2 text-sm leading-relaxed">{result.explanation}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Suggested Fix</h3>
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">
            <code className="font-mono">{result.suggestion}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
