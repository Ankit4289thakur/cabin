import React from 'react';
import { X, MessageCircle, Bot, Send } from 'lucide-react';

interface ChatWidgetProps {
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  return (
    <div className="fixed bottom-20 right-4 sm:right-8 z-40 w-[90vw] max-w-sm animate-fade-in-up">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="p-4 bg-wood-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                    <Bot size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Cabin AI Assistant</h3>
                    <p className="text-xs text-wood-100">Always here to help</p>
                </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Chat Body (Coming Soon State) */}
        <div className="flex-1 p-6 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px'
             }}></div>

            <div className="w-20 h-20 bg-wood-100 dark:bg-wood-900/30 text-wood-600 dark:text-wood-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Bot size={40} />
            </div>
            
            <h4 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">
                Coming Soon!
            </h4>
            
            <p className="text-stone-600 dark:text-stone-400 text-sm max-w-[240px] leading-relaxed">
                We're building an intelligent study companion that can answer questions about your notes and quiz you on key topics.
            </p>

            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-wood-300 dark:bg-wood-700 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-wood-400 dark:bg-wood-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-wood-500 dark:bg-wood-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>

        {/* Input Area (Disabled) */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <div className="relative">
                <input 
                    type="text" 
                    disabled
                    placeholder="Chat is currently unavailable..."
                    className="w-full pl-4 pr-12 py-3 bg-stone-100 dark:bg-stone-800 border-none rounded-full text-sm text-stone-500 cursor-not-allowed"
                />
                <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-stone-200 dark:bg-stone-700 text-stone-400 rounded-full cursor-not-allowed">
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;