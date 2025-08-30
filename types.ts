export enum Language {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  CPP = 'cpp',
  JAVA = 'java',
}

export interface DebugResult {
  errorName: string;
  explanation: string;
  suggestion: string;
  alternatives: {
    description: string;
    code: string;
  }[];
}

// A unified message type for the new assistant panel.
export interface AssistantMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  // Content can be markdown.
  content: string;
  timestamp: number;
  // This field holds data for special system messages, like code execution results.
  runResult?: {
    success: boolean;
    originalCode: string;
    // This will be the console output on success, or the error message on failure.
    output: string; 
    // The AI's suggested fix, only present on failure.
    suggestion?: DebugResult;
  };
}

export type Theme = 'light' | 'dark';