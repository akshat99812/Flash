import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';


import { 
  Send, 
  Sparkles, 
  MessageCircle, 
  Loader2,
  Code,
  Palette,
  Globe,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  onCreateProject?: (prompt: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: "Portfolio Website",
    description: "Create a modern portfolio with dark theme and animations",
    prompt: "Create a modern portfolio website with a dark theme, hero section, about me, projects gallery, and contact form. Include smooth animations and responsive design."
  },
  {
    icon: Palette,
    title: "Landing Page",
    description: "Build a product landing page with pricing",
    prompt: "Build a SaaS product landing page with hero section, features, pricing tiers, testimonials, and call-to-action buttons. Use modern gradients and clean design."
  },
  {
    icon: Globe,
    title: "Blog Website",
    description: "Design a clean blog with article listings",
    prompt: "Create a clean blog website with header navigation, featured articles, blog post grid, sidebar with categories, and footer. Include search functionality and responsive design."
  },
  {
    icon: Zap,
    title: "Dashboard",
    description: "Build an admin dashboard with charts",
    prompt: "Create an admin dashboard with sidebar navigation, data visualization charts, user management table, statistics cards, and dark/light theme toggle."
  }
];



export default function ChatBox({ onCreateProject }: ChatBoxProps) {

  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm Flash AI. Describe the website you want to build and I'll create it for you instantly. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleSend = () => {

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    navigate('/editor', { 
      state: { 
        prompt: userMessage.content 
      } 
    });

    setInput('');
};

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setInput(suggestion.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto pt-16 ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Flash AI Assistant
        </CardTitle>
        <CardDescription>
          Describe your website idea and I'll build it for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">


        {/* Suggestions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick suggestions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 justify-start text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Icon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-2 ">
          <Textarea
            placeholder="Describe the website you want to build... (e.g., 'Create a modern e-commerce site for selling shoes')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </CardContent>
    </Card>
  );
}