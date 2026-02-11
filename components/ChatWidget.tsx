import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, User, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { chatWithSearch, ChatSource } from '../services/geminiService';

interface ChatWidgetProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: ChatSource[];
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your Cabin Study Assistant. I can search the web to answer your questions or help explain concepts. What do you need help with?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API (excluding the welcome message if purely UI, but keeping it for context is fine)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const response = await chatWithSearch(history, userMsg.text);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        sources: response.sources
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again later."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-8 z-40 w-[95vw] sm:w-[400px] animate-fade-in-up">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
        {/* Header */}
        <div className="p-4 bg-wood-600 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                    <Bot size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Cabin AI</h3>
                    <div className="flex items-center gap-1">
                        <Globe size={10} className="text-wood-200" />
                        <p className="text-xs text-wood-100">Web Search Active</p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-950">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-stone-200 dark:bg-stone-800' : 'bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-stone-600 dark:text-stone-400"/> : <Bot size={16} />}
                    </div>
                    
                    <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-tr-sm' 
                                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-sm shadow-sm'
                        }`}>
                            {msg.text}
                        </div>

                        {/* Grounding Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 w-full">
                                {msg.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-[10px] text-stone-500 dark:text-stone-400 hover:text-wood-600 dark:hover:text-wood-500 hover:border-wood-300 transition-colors max-w-full truncate"
                                    >
                                        <Globe size={10} />
                                        <span className="truncate max-w-[150px]">{source.title}</span>
                                        <ExternalLink size={8} className="opacity-50" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400 flex items-center justify-center shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-wood-500" />
                        <span className="text-xs text-stone-500">Searching web...</span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full pl-4 pr-12 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-xl text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-wood-500/20 outline-none placeholder:text-stone-400"
                    autoFocus
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2 bg-wood-600 hover:bg-wood-700 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white rounded-lg transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
            <div className="text-[10px] text-center text-stone-400 mt-2">
                AI can make mistakes. Check sources.
            </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;