import React, { useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000, action }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-down w-full max-w-sm px-4">
      <div className="bg-stone-900 dark:bg-stone-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-stone-700 dark:border-stone-600">
        <div className="shrink-0 text-wood-500">
            <Info size={20} />
        </div>
        <div className="flex-1 text-sm font-medium">
            {message}
        </div>
        {action && (
            <button 
                onClick={action.onClick}
                className="text-sm font-bold text-wood-400 hover:text-wood-300 transition-colors px-2 py-1 bg-white/10 rounded"
            >
                {action.label}
            </button>
        )}
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0 text-stone-400 hover:text-white">
            <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;