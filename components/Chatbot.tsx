import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed ChatMessage to AssistantMessage to align with the unified type definition.
import type { AssistantMessage, Language } from '../types';
import { SendIcon, SparklesIcon } from './Icons';
import { streamChatResponse } from '../services/geminiService';

interface ChatbotProps {
  language: Language;
}

export const Chatbot: React.FC<ChatbotProps> = ({ language }) => {
  // FIX: Changed ChatMessage to AssistantMessage.
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    setMessages([]);
  }, [language]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // FIX: Add missing 'timestamp' property to conform to AssistantMessage type.
    const userMessage: AssistantMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    // The history for the API call must include the new user message.
    const historyForAPI = [...messages, userMessage];
    const currentInput = input; // Store input before clearing.

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    // FIX: Add missing 'timestamp' property to conform to AssistantMessage type.
    const modelMessage: AssistantMessage = { id: modelMessageId, role: 'model', content: '', timestamp: Date.now() };
    setMessages(prev => [...prev, modelMessage]);

    try {
      // FIX: Provided all 5 required arguments to streamChatResponse.
      await streamChatResponse(language, '', historyForAPI, currentInput, (chunk) => {
        setMessages(prev => {
          // FIX: Updated streaming message by ID for robustness and changed `text` to `content`.
          return prev.map(m => m.id === modelMessageId ? { ...m, content: m.content + chunk } : m);
        });
      });
    } catch (error) {
        setMessages(prev => {
            // FIX: Updated error message by ID and changed `text` to `content`.
            return prev.map(m => m.id === modelMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m);
        });
        console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-sm">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {/* FIX: Using message ID as key. */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-sm lg:max-w-md ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {/* FIX: Changed msg.text to msg.content. */}
              <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.content.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>') }}></div>
            </div>
          </div>
        ))}
         {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
            <p>Ask me anything about {language}!</p>
            <p className="mt-2 text-xs">e.g., "What are pointers in C++?" or "Explain async/await in JavaScript."</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask a question...`}
          className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-primary-500 text-white disabled:bg-primary-300 dark:disabled:bg-primary-800 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          {isLoading ? <SparklesIcon className="h-5 w-5 animate-pulse" /> : <SendIcon className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
};
