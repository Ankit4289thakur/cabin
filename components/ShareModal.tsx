import React from 'react';
import { X, Copy, Check, MessageCircle, Mail } from 'lucide-react';
import { CabinItem } from '../types';

interface ShareModalProps {
  item: CabinItem;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = `${window.location.origin}/#/share/${item.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
       <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-sm border border-stone-200 dark:border-stone-800">
          <div className="p-4 flex justify-between items-center border-b border-stone-100 dark:border-stone-800">
             <h3 className="font-medium text-stone-900 dark:text-stone-100">Share "{item.title}"</h3>
             <button onClick={onClose} className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
             <div className="relative">
                <input 
                    readOnly 
                    value={shareUrl} 
                    className="w-full pl-3 pr-10 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-600 dark:text-stone-400 focus:outline-none"
                />
                <button 
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-wood-600 transition-colors"
                >
                    {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                </button>
             </div>
             <div className="grid grid-cols-2 gap-3">
                 <a 
                    href={`mailto:?subject=Check out this note: ${item.title}&body=Here is a link to the note: ${shareUrl}`}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
                 >
                    <Mail size={20} />
                    <span className="text-xs">Email</span>
                 </a>
                 <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this note: ${item.title} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
                 >
                    <MessageCircle size={20} />
                    <span className="text-xs">WhatsApp</span>
                 </a>
             </div>
          </div>
       </div>
    </div>
  );
};
export default ShareModal;