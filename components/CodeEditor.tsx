
import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { Language, Theme } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  theme: Theme;
}

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  minimap: { enabled: false },
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 16, bottom: 16 },
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, language, theme }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(value) => onCodeChange(value || '')}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={editorOptions}
      />
    </div>
  );
};
