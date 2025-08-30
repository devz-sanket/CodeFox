
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, SparklesIcon, SendIcon, CopyIcon, LightbulbIcon } from './Icons';
import type { AssistantMessage, Language } from '../types';

interface AssistantPanelProps {
  messages: AssistantMessage[];
  language: Language;
  isLoading: boolean;
  onRunCode: () => void;
  onSendMessage: (message: string) => void;
  onExplainFix: (originalCode: string, error: string, suggestion: string) => void;
  onCodeUpdate: (newCode: string) => void;
}

const CodeBlock: React.FC<{ code: string; language: string; onCodeUpdate: (code: string) => void }> = ({ code, language, onCodeUpdate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="my-2 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-t-md text-xs text-gray-600 dark:text-gray-400">
        <span>{language}</span>
        <div className="flex items-center gap-3">
            <button onClick={() => onCodeUpdate(code)} className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <SendIcon className="w-3 h-3" /> Use Code
            </button>
            <button onClick={handleCopy} className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <CopyIcon className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
      </div>
      <pre className="p-3 text-sm whitespace-pre-wrap overflow-x-auto text-gray-800 dark:text-gray-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
};

// Helper component to render formatted text from the AI.
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    // This parser is designed to handle simple markdown: paragraphs, lists, bold, italic, and inline code.
    const parseSimpleMarkdown = (markdown: string): string => {
        const processInline = (line: string): string => line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 rounded-sm px-1 py-0.5 font-mono text-sm">$1</code>');

        const blocks = markdown.trim().split(/\n\s*\n/); // Split by paragraph breaks

        return blocks.map(block => {
            // Check if the block is a list
            const isList = block.match(/^(\*|-|\d+\.)\s/m);
            if (isList) {
                const lines = block.split('\n');
                const listType = lines[0].trim().startsWith('*') || lines[0].trim().startsWith('-') ? 'ul' : 'ol';
                const listItems = lines.map(line => `<li>${processInline(line.replace(/^(\*|-|\d+\.)\s/, ''))}</li>`).join('');
                const listClass = listType === 'ul' ? 'list-disc' : 'list-decimal';
                return `<${listType} class="${listClass} list-inside space-y-1 my-2">${listItems}</${listType}>`;
            }
            // Otherwise, it's a paragraph
            return `<p class="my-1 leading-relaxed">${processInline(block)}</p>`;
        }).join('');
    };

    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(text) }} />;
};


const MessageContent: React.FC<{ message: AssistantMessage; onExplainFix: AssistantPanelProps['onExplainFix']; onCodeUpdate: (code: string) => void, language: Language }> = ({ message, onExplainFix, onCodeUpdate, language }) => {
  const { content, runResult } = message;

  if (runResult) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-black rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {runResult.success ? 'Execution Output' : 'Execution Error'}
            </span>
          </div>
          <pre className={`p-4 text-xs whitespace-pre-wrap font-mono ${runResult.success ? 'text-gray-800 dark:text-gray-100' : 'text-red-500 dark:text-red-400'}`}>
            {runResult.output}
          </pre>
        </div>

        {!runResult.success && runResult.suggestion && (
          <div className="mt-4">
            <h4 className="font-semibold text-primary-600 dark:text-primary-400">{runResult.suggestion.errorName}</h4>
            <div className="text-sm mt-1">
              <FormattedText text={runResult.suggestion.explanation} />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <LightbulbIcon className="w-5 h-5 text-yellow-400" />
              <h5 className="font-semibold text-gray-800 dark:text-gray-200">Suggested Fix</h5>
            </div>
            <CodeBlock code={runResult.suggestion.suggestion} language={language} onCodeUpdate={onCodeUpdate}/>
            <button 
              onClick={() => onExplainFix(runResult.originalCode, runResult.output, runResult.suggestion!.suggestion)}
              className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Explain this fix
            </button>
            
            {runResult.suggestion.alternatives && runResult.suggestion.alternatives.length > 0 && (
                <div className="mt-6">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200">Alternative Approaches</h5>
                    <div className="mt-2 space-y-4">
                        {runResult.suggestion.alternatives.map((alt, index) => (
                            <div key={index}>
                                <div className="text-sm mb-1">
                                  <FormattedText text={alt.description} />
                                </div>
                                <CodeBlock code={alt.code} language={language} onCodeUpdate={onCodeUpdate}/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Parse content for markdown code blocks and render text and code separately.
  const parts = content.split(/(```(?:\w+)?\n[\s\S]*?\n```)/g);

  return (
    <div className="space-y-2 break-words">
      {parts.map((part, index) => {
        const codeBlockMatch = part.match(/```(\w+)?\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          const lang = codeBlockMatch[1] || language;
          const code = codeBlockMatch[2].trim();
          return <CodeBlock key={index} code={code} language={lang} onCodeUpdate={onCodeUpdate}/>;
        }
        if (part.trim()) {
          return <FormattedText key={index} text={part} />;
        }
        return null;
      })}
    </div>
  );
};

export const SidePanel: React.FC<AssistantPanelProps> = ({ messages, language, isLoading, onRunCode, onSendMessage, onExplainFix, onCodeUpdate }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onRunCode}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-green-300 dark:disabled:bg-green-800 transition-all"
        >
          <PlayIcon className="h-5 w-5" />
          Run Code
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const isIncoming = msg.role === 'model' || msg.role === 'system';

          return (
            <div key={msg.id} className={`w-full flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} ${isIncoming && isLastMessage ? 'animate-slide-in-bottom' : ''}`}>
              <div className={`p-3 rounded-lg max-w-sm lg:max-w-md ${
                  msg.role === 'user' ? 'bg-primary-500 text-white' : 
                  msg.role === 'system' ? 'w-full bg-gray-100 dark:bg-gray-800 border dark:border-gray-700' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                <MessageContent message={msg} onExplainFix={onExplainFix} onCodeUpdate={onCodeUpdate} language={language}/>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a follow-up question...`}
            className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-primary-500 text-white disabled:bg-primary-300 dark:disabled:bg-primary-800 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            {isLoading && messages[messages.length-1]?.role !== 'system' ? <SparklesIcon className="h-5 w-5 animate-pulse" /> : <SendIcon className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
