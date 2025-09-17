import { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useTheme } from '@/components/theme-provider';

interface MonacoEditorProps {
  filename: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MonacoEditor({ filename, value, onChange }: MonacoEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const getLanguage = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Define a custom dark theme. This only needs to be done once on mount.
    monaco.editor.defineTheme('flash-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'f8fafc' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a855f7' },
        { token: 'string', foreground: '22c55e' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '06b6d4' },
        { token: 'function', foreground: '3b82f6' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#334155',
        'editorCursor.foreground': '#f8fafc',
        'editorWhitespace.foreground': '#475569',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#cbd5e1',
      },
    });
  };

  const handleChange = (currentValue: string | undefined) => {
    if (currentValue !== undefined) {
      onChange(currentValue);
    }
  };

  if (!filename) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to begin editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none h-10 bg-muted/50 border-b flex items-center px-4">
        <span className="text-sm font-medium truncate">{filename}</span>
      </div>
      <div className="flex-1">
        <Editor
          path={filename} // Use path as a key to force re-mounting for different files
          language={getLanguage(filename)}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'flash-dark' : 'vs'}
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            fontLigatures: true,
            lineHeight: 1.6,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            renderWhitespace: 'selection',
            padding: {
              top: 10,
            },
          }}
        />
      </div>
    </div>
  );
}