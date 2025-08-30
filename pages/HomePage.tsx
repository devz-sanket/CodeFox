
import React, { useState, useCallback, useEffect } from 'react';
import Split from 'react-split';
import { CodeEditor } from '../components/CodeEditor';
import { SidePanel } from '../components/SidePanel';
import { InputPromptModal } from '../components/InputPromptModal';
import { Language, AssistantMessage, Theme } from '../types';
import { LANGUAGE_OPTIONS } from '../constants';
import { executeCode } from '../services/executionService';
import { debugCode, streamExplainFix, streamChatResponse, checkForInputNeeded } from '../services/geminiService';

const cleanCodeSnippet = (code: string): string => {
  const match = code.match(/(?:```|''')(?:[a-zA-Z]+)?\n?([\s\S]+?)\n?(?:```|''')/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return code.trim();
};

const LANGUAGE_OPTIONS_MAP = Object.fromEntries(
  LANGUAGE_OPTIONS.map(opt => [opt.id, opt.name])
) as Record<Language, string>;

interface HomePageProps {
    language: Language;
    code: string;
    setCode: (code: string) => void;
    theme: Theme;
}

export const HomePage: React.FC<HomePageProps> = ({ language, code, setCode, theme }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<{ message: string; onConfirm: (input: string) => void; onCancel: () => void; } | null>(null);

  useEffect(() => {
    setMessages([{
        id: 'welcome-message',
        role: 'model',
        content: `Hello! I'm your AI coding tutor from **CodeFox**. I'm ready to help you with **${LANGUAGE_OPTIONS_MAP[language]}**. Write some code and click **Run Code** to test it out.`,
        timestamp: Date.now(),
    }]);
  }, [language]);

  const proceedWithExecution = useCallback(async (userInput?: string) => {
    const runningMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'system',
      content: 'Running code...',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, runningMessage]);

    try {
      const result = await executeCode(language, code, userInput);
      let systemMessage: AssistantMessage;

      if (!result.success) {
        const aiResult = await debugCode(language, code, result.output);

        aiResult.suggestion = cleanCodeSnippet(aiResult.suggestion);
        if (aiResult.alternatives) {
          aiResult.alternatives.forEach(alt => {
            alt.code = cleanCodeSnippet(alt.code);
          });
        }

        systemMessage = {
          id: runningMessage.id,
          role: 'system',
          content: 'Execution failed.',
          timestamp: Date.now(),
          runResult: {
            success: false,
            originalCode: code,
            output: result.output,
            suggestion: aiResult,
          },
        };
      } else {
        systemMessage = {
          id: runningMessage.id,
          role: 'system',
          content: 'Execution successful.',
          timestamp: Date.now(),
          runResult: {
            success: true,
            originalCode: code,
            output: result.output,
          },
        };
      }
      setMessages(prev => prev.map(m => m.id === runningMessage.id ? systemMessage : m));
    } catch (error) {
      console.error(error);
      const errorMessage: AssistantMessage = {
        id: runningMessage.id,
        role: 'system',
        content: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => prev.map(m => m.id === runningMessage.id ? errorMessage : m));
    } finally {
      setIsLoading(false);
    }
  }, [language, code]);

  const handleRunCode = useCallback(async () => {
    setIsLoading(true);
    const analysisMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Analyzing code for input requirements...',
        timestamp: Date.now(),
    };
    setMessages(prev => [...prev, analysisMessage]);

    try {
      const checkResult = await checkForInputNeeded(language, code);
      setMessages(prev => prev.filter(m => m.id !== analysisMessage.id)); 

      if (checkResult.requiresInput) {
        setInputPrompt({
          message: checkResult.prompt || "This code requires user input to run.",
          onConfirm: (userInput: string) => {
            setInputPrompt(null);
            proceedWithExecution(userInput);
          },
          onCancel: () => {
            setInputPrompt(null);
            setIsLoading(false);
          },
        });
      } else {
        proceedWithExecution();
      }
    } catch (error) {
      console.error("Input check error:", error);
      const errorMessage: AssistantMessage = {
        id: analysisMessage.id,
        role: 'system',
        content: `An error occurred during code analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => prev.map(m => m.id === analysisMessage.id ? errorMessage : m));
      setIsLoading(false);
    }
  }, [language, code, proceedWithExecution]);
  
  const handleExplainFix = useCallback(async (originalCode: string, error: string, suggestion: string) => {
    setIsLoading(true);
    const modelMessageId = Date.now().toString();
    const modelMessage: AssistantMessage = { id: modelMessageId, role: 'model', content: '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelMessage]);

    try {
        await streamExplainFix(language, originalCode, error, suggestion, (chunk) => {
            setMessages(prev => prev.map(m => 
                m.id === modelMessageId ? { ...m, content: m.content + chunk } : m
            ));
        });
    } catch (e) {
        console.error("Explanation error:", e);
        setMessages(prev => prev.map(m => 
            m.id === modelMessageId ? { ...m, content: 'Sorry, I encountered an error while generating the explanation.' } : m
        ));
    } finally {
        setIsLoading(false);
    }
  }, [language]);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);

    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: AssistantMessage = { id: modelMessageId, role: 'model', content: '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelMessage]);
    
    try {
      await streamChatResponse(language, code, currentHistory, message, (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === modelMessageId ? { ...m, content: m.content + chunk } : m
        ));
      });
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => prev.map(m =>
          m.id === modelMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
      ));
    } finally {
      setIsLoading(false);
    }

  }, [language, code, messages]);

  return (
    <div className="h-full">
        <Split
          className="flex h-full"
          sizes={[60, 40]}
          minSize={300}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
        >
          <div className="h-full">
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              language={language}
              theme={theme}
            />
          </div>
          <div className="h-full">
            <SidePanel
                messages={messages}
                language={language}
                isLoading={isLoading}
                onRunCode={handleRunCode}
                onSendMessage={handleSendMessage}
                onExplainFix={handleExplainFix}
                onCodeUpdate={setCode}
            />
          </div>
        </Split>
      {inputPrompt && (
        <InputPromptModal
            message={inputPrompt.message}
            onConfirm={inputPrompt.onConfirm}
            onCancel={inputPrompt.onCancel}
        />
      )}
    </div>
  );
};
