import React, { useState } from 'react';
import { X, Bell, Calendar, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReminderModalProps {
  initialTime?: number;
  initialMessage?: string;
  onSave: (timestamp: number | undefined, message?: string) => void;
  onClose: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ initialTime, initialMessage, onSave, onClose }) => {
  // Initialize with current time + 1 hour if no initial time, or the existing time
  const getDefaultTime = () => {
    if (initialTime) {
      return new Date(initialTime).toISOString().slice(0, 16);
    }
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    // Format to YYYY-MM-DDThh:mm for input type="datetime-local"
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const [dateTime, setDateTime] = useState(getDefaultTime());
  const [message, setMessage] = useState(initialMessage || '');

  const handleSave = () => {
    const timestamp = new Date(dateTime).getTime();
    if (timestamp < Date.now()) {
      alert("Please select a future time.");
      return;
    }
    onSave(timestamp, message);
    onClose();
  };

  const handleClear = () => {
    onSave(undefined, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-sm border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
          <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Bell size={20} className="text-wood-500" />
            Set Study Reminder
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-2">
               <Clock size={16} /> Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full p-3 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-wood-500/20 outline-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-2">
                <MessageSquare size={16} /> Message <span className="text-stone-400 font-normal">(Optional)</span>
             </label>
             <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Review formulas before the quiz!"
                className="w-full p-3 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-wood-500/20 outline-none resize-none h-20"
             />
          </div>

          <div className="flex gap-3 pt-2">
             {initialTime && (
                <button
                  onClick={handleClear}
                  className="flex-1 py-2.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  Clear
                </button>
             )}
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-stone-900 dark:bg-wood-600 text-white rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-wood-500 transition-colors"
            >
              Set Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;