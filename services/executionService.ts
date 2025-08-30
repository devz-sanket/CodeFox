
import { Language } from '../types';
import { simulateExecution } from './geminiService';

interface ExecutionResult {
  success: boolean;
  output: string;
}

export const executeCode = async (language: Language, code: string, userInput?: string): Promise<ExecutionResult> => {
  // Pass the user's input to the Gemini service to simulate execution
  return await simulateExecution(language, code, userInput);
};