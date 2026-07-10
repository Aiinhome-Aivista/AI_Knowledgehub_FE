import { useState, useRef, useEffect } from 'react';
import { ENDPOINTS } from '../../config/endpoint';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RAGChatProps {
  initialInput?: string;
  onClearInitialInput?: () => void;
  name?: string;
}

const RAGChat: React.FC<RAGChatProps> = ({ initialInput, onClearInitialInput, name }) => {
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'assistant', content: `Hello ${name || 'User'}! I am the AI Knowledge Hub assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialInput) {
      const userMessage = `Tell me about ${initialInput}`;
      setInput(userMessage);
      
      // Auto-submit the keyword query
      submitMessage(userMessage);
      
      // Clear it from parent state so we can query again
      if (onClearInitialInput) {
        onClearInitialInput();
      }
    }
  }, [initialInput]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const submitMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(ENDPOINTS.CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am currently offline or experiencing issues. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitMessage(input.trim());
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      
      {/* Dynamic chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm border transition-all ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-transparent rounded-br-none shadow-indigo-500/5' 
                    : 'theme-card-bg theme-text-primary theme-border rounded-bl-none'
                }`}
              >
                <div className="text-[14px] whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="theme-card-bg theme-text-primary theme-border rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container */}
      <div className="p-4 md:p-6 theme-bg-primary border-t theme-border">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the extracted proper nouns and topics..."
            className="w-full bg-[#151b2d] rounded-2xl py-4 pl-5 pr-14 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-secondary theme-text-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-3 mr-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RAGChat;
