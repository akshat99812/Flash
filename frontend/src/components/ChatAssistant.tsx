import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

// A simple loader component
const Loader = () => (
  <div className="flex items-center justify-center p-2">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
  </div>
);

interface ChatPanelProps {
  messages: { role: 'user' | 'assistant'; content: string }[];
  isLoading: boolean;
  onSubmit: (prompt: string) => Promise<void>;
}

export default function ChatPanel({ messages, isLoading, onSubmit }: ChatPanelProps) {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (prompt.trim() && !isLoading) {
      await onSubmit(prompt);
      setPrompt('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      
      <div className="p-2 border-t">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for changes..."
            className="w-full p-2 pr-12 rounded-md bg-muted resize-none border focus:outline-none focus:ring-1 focus:ring-primary"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
