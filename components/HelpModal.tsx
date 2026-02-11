import React, { useState } from 'react';
import { X, Camera, Sparkles, Trash2, Heart, Database, Info, Mail, Search, Folder, PenTool, MessageCircle, Star, BookOpen, Layers, Zap, Plus } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'features' | 'guide' | 'about'>('features');

  const tabs = [
    { id: 'features', label: 'Features', icon: Layers },
    { id: 'guide', label: 'How to Use', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-wood-600 text-white">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <Info size={20} className="text-wood-100" />
            Help & Documentation
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full text-white/80 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-wood-500 text-wood-600 dark:text-wood-500 bg-white dark:bg-stone-900' 
                        : 'border-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB: FEATURES */}
          {activeTab === 'features' && (
              <div className="space-y-8 animate-fade-in-up">
                  <div className="text-center">
                    <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">Power Features</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">Everything you can do in Cabin.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <Camera className="text-blue-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">Smart Capture</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Capture whiteboards or documents directly via camera. Images are stored securely.</p>
                     </div>
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <Sparkles className="text-purple-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">AI Intelligence</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Powered by Gemini. Summarize notes, analyze diagrams, and rewrite complex text.</p>
                     </div>
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <Folder className="text-yellow-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">Folder Organization</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Group related items into folders. Deleting a folder moves items to 'All Items' safely.</p>
                     </div>
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <MessageCircle className="text-green-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">Search Assistant</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Chat with an AI that can search the web to answer your study questions instantly.</p>
                     </div>
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <Trash2 className="text-red-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">Safe Deletion</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Items go to "Recently Deleted" first. You can Undo deletions immediately or restore later.</p>
                     </div>
                     <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                        <Search className="text-stone-500 mb-2" size={24} />
                        <h4 className="font-bold text-stone-800 dark:text-stone-100">Deep Search</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Find any note instantly by title or tags. Filter by folder or favorites.</p>
                     </div>
                  </div>
              </div>
          )}

          {/* TAB: GUIDE */}
          {activeTab === 'guide' && (
               <div className="space-y-8 animate-fade-in-up">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">How to Use Cabin</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">A quick guide to mastering your study space.</p>
                  </div>

                  <div className="space-y-6">
                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400 flex items-center justify-center font-bold shrink-0">1</div>
                          <div>
                              <h4 className="font-bold text-stone-900 dark:text-stone-100">Adding Content</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                                  Click the <span className="font-semibold text-stone-800 dark:text-stone-200">+ Add New</span> button. You can type a note, upload a PDF/Image, paste a YouTube link, or use the Camera.
                              </p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400 flex items-center justify-center font-bold shrink-0">2</div>
                          <div>
                              <h4 className="font-bold text-stone-900 dark:text-stone-100">Organizing with Folders</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                                  Click the <span className="inline-block p-1 bg-stone-100 dark:bg-stone-800 rounded"><Plus size={10} className="inline"/></span> icon next to "Folders" in the sidebar to create a new folder. Dragging isn't supported yet, but you can assign folders when creating or editing an item.
                              </p>
                          </div>
                      </div>

                       <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400 flex items-center justify-center font-bold shrink-0">3</div>
                          <div>
                              <h4 className="font-bold text-stone-900 dark:text-stone-100">Using AI Tools</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                                  Open any Note or Image. Look for the <span className="font-semibold text-purple-600">Summarize</span>, <span className="font-semibold text-teal-600">Analyze</span>, or <span className="font-semibold text-indigo-600">Explain</span> buttons in the toolbar. The AI will generate insights instantly.
                              </p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-900/40 text-wood-600 dark:text-wood-400 flex items-center justify-center font-bold shrink-0">4</div>
                          <div>
                              <h4 className="font-bold text-stone-900 dark:text-stone-100">Deleting & Restoring</h4>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                                  Click the Trash icon on an item to move it to "Recently Deleted". 
                                  A notification will appear with an <strong>Undo</strong> button.
                                  You can also go to the Trash folder in the sidebar to restore items later or empty the trash.
                              </p>
                          </div>
                      </div>
                  </div>
               </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in-up">
                 <div className="text-center space-y-2 mt-4">
                    <div className="w-20 h-20 bg-wood-100 dark:bg-wood-900/30 text-wood-600 dark:text-wood-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <span className="font-serif font-bold text-4xl">C</span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">Cabin</h3>
                    <p className="text-stone-600 dark:text-stone-400">v1.2.0</p>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-100 dark:border-stone-800 text-center">
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-4">
                        Cabin was created to provide a calm, focused environment for students and lifelong learners. 
                        It combines local-first organization with powerful AI tools to help you understand better, not just collect more.
                    </p>
                    
                    <div className="flex flex-col items-center justify-center pt-4 border-t border-stone-200 dark:border-stone-700">
                         <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-widest font-bold mb-2">
                            <Heart size={12} className="text-red-500 fill-current" />
                            <span>Credits</span>
                         </div>
                         <p className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">
                            Created by Ankito
                         </p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-stone-800 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100">Support & Feedback</h4>
                            <p className="text-xs text-stone-500">Found a bug?</p>
                        </div>
                    </div>
                    <a href="mailto:candymine1000@gmail.com" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        candymine1000@gmail.com
                    </a>
                </div>
              </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-wood-600 dark:hover:bg-wood-500 text-white rounded-xl font-medium transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}
export default HelpModal;