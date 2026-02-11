import React from 'react';
import { CabinItem, ItemType } from '../types';
import { FileText, Image as ImageIcon, File, Star, Bell, Video, PlayCircle, Trash2, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: CabinItem;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onRestore?: (e: React.MouseEvent) => void;
  isTrash?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, onToggleFavorite, onDelete, onRestore, isTrash = false }) => {
  const getIcon = () => {
    switch (item.type) {
      case ItemType.NOTE: return <FileText size={24} className="text-wood-500" />;
      case ItemType.IMAGE: return <ImageIcon size={24} className="text-blue-500" />;
      case ItemType.PDF: return <File size={24} className="text-red-500" />;
      case ItemType.VIDEO: return <Video size={24} className="text-purple-500" />;
      default: return <FileText size={24} />;
    }
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/0.jpg`;
    }
    return null;
  };

  const isImage = item.type === ItemType.IMAGE;
  const isVideo = item.type === ItemType.VIDEO;
  const hasReminder = item.reminderTime && item.reminderTime > Date.now();

  const youtubeThumb = isVideo ? getYoutubeThumbnail(item.content) : null;

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white dark:bg-stone-900 rounded-xl border ${isTrash ? 'border-red-200 dark:border-red-900' : 'border-stone-200 dark:border-stone-800'} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col h-48 sm:h-56`}
    >
      {/* Preview Area */}
      <div className={`flex-1 bg-stone-50 dark:bg-stone-950 relative overflow-hidden flex items-center justify-center ${isTrash ? 'grayscale opacity-70' : ''}`}>
        {isImage ? (
          <img 
            src={item.content} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : isVideo && youtubeThumb ? (
            <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-500">
                 <img src={youtubeThumb} alt={item.title} className="w-full h-full object-cover opacity-80" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                     <PlayCircle size={40} className="text-white opacity-90" />
                 </div>
            </div>
        ) : (
          <div className="p-4 text-xs text-stone-500 dark:text-stone-400 line-clamp-6 w-full text-left break-words">
             {item.type === ItemType.NOTE 
                ? item.content 
                : item.type === ItemType.VIDEO 
                    ? <div className="flex flex-col items-center gap-2"><Video size={32} /><span>Video Link</span></div> 
                    : 'PDF Document Preview'}
          </div>
        )}
        
        {/* Type Icon Badge */}
        {!isImage && !youtubeThumb && (
          <div className="absolute top-3 left-3 w-10 h-10 bg-white dark:bg-stone-800 rounded-lg shadow-sm flex items-center justify-center z-10 border border-stone-100 dark:border-stone-700">
            {getIcon()}
          </div>
        )}

        {/* Reminder Badge */}
        {hasReminder && !isTrash && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-wood-500 rounded-full shadow-sm flex items-center justify-center z-10 text-white" title="Reminder set">
            <Bell size={14} className="fill-current" />
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 z-10 relative">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-medium text-stone-800 dark:text-stone-100 truncate flex-1 text-sm">{item.title}</h3>
          
          <div className="flex gap-1 z-20">
            {isTrash && onRestore ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onRestore(e); }}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Restore Item"
                >
                    <RotateCcw size={16} />
                </button>
            ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
                    className={`p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded ${item.isFavorite ? 'text-yellow-400 fill-current' : 'text-stone-300 dark:text-stone-600 hover:text-yellow-400'}`}
                    title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                    <Star size={16} className={item.isFavorite ? 'fill-current' : ''} />
                </button>
            )}
            
            {onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                    className="p-1.5 text-stone-300 dark:text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title={isTrash ? "Delete Permanently" : "Move to Trash"}
                >
                    <Trash2 size={16} />
                </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-500 mt-2">
           <div className="flex gap-1">
             {item.tags.slice(0, 2).map(tag => (
               <span key={tag} className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                 {tag}
               </span>
             ))}
           </div>
           <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;