import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-down w-full max-w-sm px-4">
      <div className="bg-red-500 dark:bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-start gap-4 border-2 border-red-600 dark:border-red-500">
        <div className="bg-white/20 p-2 rounded-full shrink-0">
            <AlertTriangle size={24} className="text-white" />
        </div>
        <div className="flex-1 pt-1">
            <h4 className="font-bold text-lg leading-tight mb-1">Study Alert!</h4>
            <p className="text-sm text-red-50 font-medium leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0">
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;