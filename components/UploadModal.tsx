import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Folder, ItemType } from '../types';
import { X, Upload, FileText, Image, Loader2, Video, Mic } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (item: any) => void;
  folders: Folder[];
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, folders }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'note' | 'video' | 'voice'>('upload');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    try {
      let finalContent = content;
      let type = ItemType.NOTE;
      let mimeType = undefined;

      if (activeTab === 'upload' && file) {
        finalContent = await mockBackend.uploadFile(file);
        if (file.type.startsWith('image/')) {
          type = ItemType.IMAGE;
          mimeType = file.type;
        } else if (file.type === 'application/pdf') {
          type = ItemType.PDF;
          mimeType = file.type;
        } else {
          // Default fallback
          type = ItemType.PDF; 
        }
      } else if (activeTab === 'video') {
          type = ItemType.VIDEO;
          // finalContent is already set from text input
      }

      const newItem = await mockBackend.createItem({
        title,
        content: finalContent,
        type,
        folderId: selectedFolder || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        isFavorite: false,
        mimeType
      }, user.id);

      onUpload(newItem);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
          <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100">Add to Cabin</h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 overflow-x-auto no-scrollbar">
          <button 
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'upload' ? 'text-wood-600 dark:text-wood-500 border-b-2 border-wood-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </button>
          <button 
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'note' ? 'text-wood-600 dark:text-wood-500 border-b-2 border-wood-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            onClick={() => setActiveTab('note')}
          >
            Paste Text
          </button>
           <button 
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'video' ? 'text-wood-600 dark:text-wood-500 border-b-2 border-wood-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            onClick={() => setActiveTab('video')}
          >
            Video Link
          </button>
          <button 
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'voice' ? 'text-wood-600 dark:text-wood-500 border-b-2 border-wood-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            onClick={() => setActiveTab('voice')}
          >
            Voice Note
          </button>
        </div>

        {/* Form */}
        {activeTab === 'voice' ? (
            <div className="p-10 flex flex-col items-center justify-center flex-1 text-center min-h-[300px]">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 text-stone-400 dark:text-stone-500">
                    <Mic size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Coming Soon</h3>
                <p className="text-stone-500 dark:text-stone-400 max-w-xs">
                    Voice recording and automatic transcription will be available in the next update.
                </p>
            </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Title</label>
            <input 
              type="text" 
              required
              placeholder={activeTab === 'video' ? "e.g. Thermodynamics Lecture 1" : "e.g. Math Homework"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg focus:ring-2 focus:ring-wood-500/20 focus:border-wood-500 dark:text-stone-100 outline-none"
            />
          </div>

          {activeTab === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">File</label>
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-6 flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 hover:border-wood-400 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  required
                  accept="image/*,application/pdf"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="flex items-center gap-2 text-wood-600 dark:text-wood-500 font-medium">
                    {file.type.startsWith('image/') ? <Image size={20} /> : <FileText size={20} />}
                    {file.name}
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm">Click or Drag to upload PDF or Image</span>
                  </>
                )}
              </div>
            </div>
          ) : activeTab === 'video' ? (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Video URL</label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg focus:ring-2 focus:ring-wood-500/20 focus:border-wood-500 dark:text-stone-100 outline-none"
                />
              </div>
              <p className="text-xs text-stone-500 mt-1">Supports YouTube, Vimeo, or direct video links.</p>
            </div>
          ) : (
             <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Content</label>
              <textarea 
                required
                rows={6}
                placeholder="Paste your notes here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg focus:ring-2 focus:ring-wood-500/20 focus:border-wood-500 dark:text-stone-100 outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Folder</label>
                <select 
                  value={selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg focus:ring-2 focus:ring-wood-500/20 dark:text-stone-100 outline-none"
                >
                  <option value="">No Folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="math, urgent"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 rounded-lg focus:ring-2 focus:ring-wood-500/20 dark:text-stone-100 outline-none"
                />
             </div>
          </div>
        </form>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            {activeTab === 'voice' ? 'Close' : 'Cancel'}
          </button>
          {activeTab !== 'voice' && (
            <button 
                onClick={handleSubmit}
                disabled={isUploading}
                className="px-6 py-2 bg-stone-900 dark:bg-wood-600 text-white font-medium rounded-lg hover:bg-stone-800 dark:hover:bg-wood-500 transition-colors flex items-center gap-2"
            >
                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Item'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;