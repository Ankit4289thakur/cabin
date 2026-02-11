import React, { useState, useEffect } from 'react';
import { CabinItem, ItemType } from '../types';
import { X, Share2, Bell, Sparkles, PenTool, RefreshCw, BrainCircuit, Maximize2, Minimize2, Edit2, Check, Plus, Trash2 } from 'lucide-react';
import { generateContentFromPrompt, explainImage, MODELS } from '../services/geminiService';
import ShareModal from './ShareModal';
import ReminderModal from './ReminderModal';

interface ItemViewerProps {
  item: CabinItem;
  onClose: () => void;
  onUpdateItem?: (item: CabinItem) => void;
  onDelete?: (id: string) => void;
}

const ItemViewer: React.FC<ItemViewerProps> = ({ item, onClose, onUpdateItem, onDelete }) => {
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'SUMMARY' | 'EXPLAIN' | 'REWRITE' | 'ANALYZE' | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Custom AI Prompt State
  const [showAiPromptConfig, setShowAiPromptConfig] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tag Editing State
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(item.tags);

  useEffect(() => {
    setLocalTags(item.tags);
  }, [item.tags]);

  const handleUpdateTag = (index: number, value: string) => {
    const newTags = [...localTags];
    newTags[index] = value;
    setLocalTags(newTags);
  };

  const handleRemoveTag = (index: number) => {
    setLocalTags(localTags.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    setLocalTags([...localTags, '']);
  };

  const handleSaveTags = () => {
    if (onUpdateItem) {
        const newTags = localTags
            .map(t => t.trim())
            .filter(t => t.length > 0);
        // Deduplicate
        const uniqueTags = Array.from(new Set(newTags));
        onUpdateItem({
            ...item,
            tags: uniqueTags
        });
        setLocalTags(uniqueTags);
    }
    setIsEditingTags(false);
  };

  const handleCancelTags = () => {
      setLocalTags(item.tags);
      setIsEditingTags(false);
  };

  const getDefaultPrompt = (mode: string) => {
    switch (mode) {
        case 'SUMMARY': return `Please summarize the following study notes into concise bullet points, highlighting key concepts: \n\n${item.content}`;
        case 'REWRITE': return `Rewrite the following study notes. Make them clearer, more concise, and structure them with proper headings and bullet points for better memorization:\n\n${item.content}`;
        case 'ANALYZE': return `Analyze the following study material. Identify the Top 3 Key Concepts, estimate Difficulty Level, and provide a Study Tip.\n\n${item.content}`;
        case 'EXPLAIN': return "Explain this diagram or image in the context of study materials. What are the key takeaways?";
        default: return '';
    }
  };

  const initiateAiAction = (mode: 'SUMMARY' | 'EXPLAIN' | 'REWRITE' | 'ANALYZE') => {
      setAiMode(mode);
      setCustomPrompt(getDefaultPrompt(mode));
      setShowAiPromptConfig(true);
  };

  const handleRunAi = async () => {
      setShowAiPromptConfig(false);
      setIsAiLoading(true);
      setAiResult(null);
      
      try {
          let result = '';
          if (aiMode === 'EXPLAIN') {
             result = await explainImage(item.content, item.mimeType || 'image/jpeg', customPrompt);
          } else {
             // Use Pro model for complex reasoning tasks, Flash for simple summaries
             const model = (aiMode === 'REWRITE' || aiMode === 'ANALYZE') ? MODELS.PRO : MODELS.FLASH;
             result = await generateContentFromPrompt(customPrompt, model);
          }
          setAiResult(result);
      } catch (e) {
          setAiResult("Failed to get insights.");
      } finally {
          setIsAiLoading(false);
      }
  };

  const handleApplyRewrite = () => {
      if (aiResult && onUpdateItem) {
          onUpdateItem({
              ...item,
              content: aiResult
          });
          setAiResult(null);
          setAiMode(null);
      }
  };

  const handleSetReminder = (timestamp: number | undefined, message?: string) => {
    if (onUpdateItem) {
        onUpdateItem({
            ...item,
            reminderTime: timestamp,
            reminderMessage: message
        });
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  return (
    <>
    <div className={`fixed inset-0 z-50 bg-stone-900/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white dark:bg-stone-900 w-full ${isFullscreen ? 'h-full rounded-none' : 'max-w-4xl h-[90vh] rounded-2xl'} shadow-2xl flex flex-col overflow-hidden relative border border-stone-200 dark:border-stone-800 transition-all duration-300 animate-scale-in`}>
        
        {/* Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 truncate">{item.title}</h2>
            
            {/* Tag Section */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
                {isEditingTags ? (
                    <div className="flex flex-wrap items-center gap-2">
                        {localTags.map((tag, index) => (
                            <div key={index} className="flex items-center bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full px-2 py-0.5 shadow-sm">
                                <span className="text-stone-400 text-xs mr-1">#</span>
                                <input 
                                    type="text" 
                                    value={tag}
                                    onChange={(e) => handleUpdateTag(index, e.target.value)}
                                    className="text-xs min-w-[30px] w-16 bg-transparent outline-none text-stone-800 dark:text-stone-200"
                                    autoFocus={index === localTags.length - 1}
                                    placeholder="tag"
                                />
                                <button 
                                    onClick={() => handleRemoveTag(index)} 
                                    className="ml-1 text-stone-400 hover:text-red-500 rounded-full p-0.5"
                                >
                                    <X size={10}/>
                                </button>
                            </div>
                        ))}
                        
                        <button 
                            onClick={handleAddTag} 
                            className="flex items-center gap-1 text-xs text-wood-600 dark:text-wood-500 hover:bg-stone-100 dark:hover:bg-stone-800 px-2 py-1 rounded-full border border-dashed border-wood-300 dark:border-wood-700"
                        >
                            <Plus size={12}/> Add
                        </button>

                        <div className="flex items-center gap-1 ml-2 border-l border-stone-200 dark:border-stone-700 pl-2">
                            <button onClick={handleSaveTags} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Save Tags">
                                <Check size={16}/>
                            </button>
                            <button onClick={handleCancelTags} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Cancel">
                                <X size={16}/>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 items-center">
                        {item.tags.length > 0 ? (
                            item.tags.map(t => (
                                <span 
                                    key={t} 
                                    onClick={() => setIsEditingTags(true)}
                                    className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full text-xs hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer border border-transparent hover:border-wood-200 dark:hover:border-wood-800 transition-colors"
                                >
                                    #{t}
                                </span>
                            ))
                        ) : (
                             <button 
                                onClick={() => setIsEditingTags(true)}
                                className="text-xs text-stone-400 hover:text-wood-600 italic hover:underline decoration-dashed underline-offset-4"
                            >
                                + Add tags
                            </button>
                        )}
                        <button 
                            onClick={() => setIsEditingTags(true)} 
                            className="p-1 text-stone-400 hover:text-wood-600 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
                            title="Edit Tags"
                        >
                            <Edit2 size={12} />
                        </button>
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* AI Buttons */}
            {item.type === ItemType.NOTE && (
                <>
                <button 
                  onClick={() => initiateAiAction('ANALYZE')}
                  disabled={isAiLoading}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  title="Deep Analysis (Pro)"
                >
                  <BrainCircuit size={16} />
                  Analyze
                </button>
                 <button 
                  onClick={() => initiateAiAction('REWRITE')}
                  disabled={isAiLoading}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  title="Rewrite & Improve (Pro)"
                >
                  <PenTool size={16} />
                  Rewrite
                </button>
                <button 
                  onClick={() => initiateAiAction('SUMMARY')}
                  disabled={isAiLoading}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  title="Quick Summary (Flash)"
                >
                  <Sparkles size={16} />
                  {isAiLoading ? 'Thinking...' : 'Summarize'}
                </button>
                </>
            )}

             {item.type === ItemType.IMAGE && (
                 <button 
                  onClick={() => initiateAiAction('EXPLAIN')}
                  disabled={isAiLoading}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={16} />
                  {isAiLoading ? 'Thinking...' : 'Explain'}
                </button>
            )}

            <button 
              onClick={() => setIsReminderModalOpen(true)}
              className={`p-2 rounded-lg transition-colors relative ${item.reminderTime && item.reminderTime > Date.now() ? 'text-wood-500 bg-wood-50 dark:bg-wood-900/20' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              title="Set Reminder"
            >
              <Bell size={20} className={item.reminderTime && item.reminderTime > Date.now() ? 'fill-current' : ''} />
            </button>

            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors relative"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            
            <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            
            {onDelete && (
                <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-stone-500 dark:text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors"
                    title="Delete Item"
                >
                    <Trash2 size={20} />
                </button>
            )}

            <button onClick={onClose} className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 p-6 flex flex-col items-center">
            
            {/* AI Prompt Configuration Modal (Inline) */}
            {showAiPromptConfig && (
                <div className="w-full max-w-3xl mb-6 bg-white dark:bg-stone-900 border border-wood-200 dark:border-wood-800 rounded-xl p-4 shadow-lg z-10 animate-fade-in-up">
                    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-wood-500"/> Configure AI Request
                    </h3>
                    <textarea 
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full h-24 p-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-wood-500/20 outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button 
                            onClick={() => setShowAiPromptConfig(false)}
                            className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleRunAi}
                            className="px-4 py-1.5 text-sm bg-wood-600 text-white rounded-lg hover:bg-wood-500 font-medium"
                        >
                            Generate
                        </button>
                    </div>
                </div>
            )}

            {/* AI Result Box */}
            {aiResult && (
                <div className="w-full max-w-3xl mb-6 bg-white dark:bg-stone-900 border border-indigo-100 dark:border-indigo-900 rounded-xl p-6 shadow-sm relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                    <div className="flex items-center justify-between mb-3">
                         <h3 className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold">
                            {aiMode === 'ANALYZE' ? <BrainCircuit size={18} /> : <Sparkles size={18} />}
                            {aiMode === 'REWRITE' ? 'Improved Version' : aiMode === 'ANALYZE' ? 'Note Analysis' : 'AI Study Buddy'}
                        </h3>
                        {aiMode === 'REWRITE' && onUpdateItem && (
                            <button 
                                onClick={handleApplyRewrite}
                                className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                <RefreshCw size={12} /> Replace Original
                            </button>
                        )}
                    </div>
                   
                    <div className="prose prose-sm prose-stone dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line text-stone-700 dark:text-stone-300">{aiResult}</p>
                    </div>
                    <button 
                        onClick={() => setAiResult(null)}
                        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Main Item Content */}
            <div className={`w-full ${isFullscreen ? 'max-w-6xl h-full' : 'max-w-3xl min-h-[50vh]'} bg-white dark:bg-stone-900 shadow-sm border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300`}>
                {item.type === ItemType.IMAGE ? (
                    <img src={item.content} alt={item.title} className="w-full h-auto object-contain max-h-[80vh]" />
                ) : item.type === ItemType.PDF ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400">
                        <div className="p-4 rounded-full bg-stone-200 dark:bg-stone-800 mb-4">
                             <span className="text-3xl font-bold">PDF</span>
                        </div>
                        <p>PDF Preview is not available in this demo.</p>
                        <a href="#" className="mt-4 text-wood-600 dark:text-wood-500 hover:underline">Download Original</a>
                    </div>
                ) : item.type === ItemType.VIDEO ? (
                     <div className="w-full h-full min-h-[500px] bg-black flex items-center justify-center">
                        {getYoutubeEmbedUrl(item.content) ? (
                             <iframe 
                                className="w-full h-full min-h-[500px]" 
                                src={getYoutubeEmbedUrl(item.content)} 
                                title={item.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                             <div className="text-center p-10">
                                 <p className="text-stone-400 mb-4">Video preview not available for this URL.</p>
                                 <a 
                                    href={item.content} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="px-4 py-2 bg-wood-600 text-white rounded-lg hover:bg-wood-500 transition-colors"
                                >
                                    Open Video Link
                                 </a>
                             </div>
                        )}
                     </div>
                ) : (
                    <div className="p-8 prose prose-lg prose-stone dark:prose-invert max-w-none w-full">
                        <div className="whitespace-pre-wrap text-stone-800 dark:text-stone-200">{item.content}</div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
    
    {isShareModalOpen && (
        <ShareModal item={item} onClose={() => setIsShareModalOpen(false)} />
    )}

    {isReminderModalOpen && (
        <ReminderModal 
            initialTime={item.reminderTime} 
            initialMessage={item.reminderMessage}
            onSave={handleSetReminder} 
            onClose={() => setIsReminderModalOpen(false)} 
        />
    )}
    </>
  );
};

export default ItemViewer;