import React from 'react';
import { X, BookOpen, Upload, PenTool, Share2, Mail, MessageCircle } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 dark:border-stone-800">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
          <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <BookOpen size={20} className="text-wood-500" />
            How to use Cabin
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100">1. Upload Content</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Click "Add New" to upload PDFs, Images, or paste study notes.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <PenTool size={20} />
            </div>
            <div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100">2. AI Assistance</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Open a note and use "Rewrite" or "Summarize" to improve your materials with Gemini AI.
              </p>
            </div>
          </div>
           <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100">3. Share</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                Generate links for your notes to share them with friends or across devices.
              </p>
            </div>
          </div>
        </div>
        
        {/* Support Section */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a 
              href="mailto:candymine1000@gmail.com"
              className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-wood-600 dark:hover:text-wood-500 transition-colors"
            >
              <Mail size={16} />
              candymine1000@gmail.com
            </a>
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-wood-600 hover:bg-wood-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
                Got it
            </button>
        </div>
      </div>
    </div>
  );
}
export default HelpModal;