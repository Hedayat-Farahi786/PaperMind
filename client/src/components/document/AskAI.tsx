import { useState } from 'react';
import { MessageSquare, Send, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AskAIProps {
  documentId: number;
}

interface Message {
  content: string;
  isUser: boolean;
}

const AskAI = ({ documentId }: AskAIProps) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    const userQuestion = question.trim();
    setQuestion('');
    
    // Add user question to messages
    setMessages(prev => [...prev, { content: userQuestion, isUser: true }]);
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/documents/${documentId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get answer');
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      setMessages(prev => [...prev, { content: data.answer, isUser: false }]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      
      // Add error message
      setMessages(prev => [...prev, { 
        content: "I'm sorry, I couldn't process your question. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionQuestions = [
    "What happens if I miss the payment?",
    "How do I update my home inventory?",
    "When is the next deadline?",
    "What are the most important actions required?"
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
          <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Ask Follow-up Questions</h2>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="flex items-center p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg mb-4">
            <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Try asking: 
              {suggestionQuestions.map((q, i) => (
                <button 
                  key={i}
                  className="ml-1 text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                  onClick={() => setQuestion(q)}
                >
                  "{q}"{i < suggestionQuestions.length - 1 ? ' or' : ''}
                </button>
              ))}
            </p>
          </div>
        )}
        
        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="mb-4 space-y-4 max-h-60 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.isUser 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <Input
            type="text"
            placeholder="Ask a question about this document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full pl-4 pr-12 py-2"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            disabled={isLoading || !question.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AskAI;
