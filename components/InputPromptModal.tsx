
import React, { useState, useEffect } from 'react';
import { TerminalIcon } from './Icons';

interface InputPromptModalProps {
  message: string;
  onConfirm: (input: string) => void;
  onCancel: () => void;
}

export const InputPromptModal: React.FC<InputPromptModalProps> = ({ message, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleSubmit = () => {
    onConfirm(inputValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-slide-in-bottom">
      <div 
        className="bg-gray-800 text-white rounded-lg shadow-2xl w-full max-w-lg border border-primary-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="input-prompt-title"
      >
        <div className="flex items-center gap-3 p-4 bg-gray-900 border-b border-gray-700">
          <TerminalIcon className="w-6 h-6 text-primary-400" />
          <h3 id="input-prompt-title" className="text-lg font-semibold text-gray-200">User Input Required</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-300 mb-4">{message}</p>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full h-28 bg-black border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm text-green-300 resize-none"
            placeholder="Enter input here...&#10;Press Enter for a new line."
            autoFocus
          />
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 transition-colors font-semibold"
            >
              Submit Input
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};