import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { Folder, User } from '../types';
import { Folder as FolderIcon, LayoutGrid, Star, LogOut, Moon, Sun, Info, Plus, Check, X, Trash2, Loader2, RefreshCw } from 'lucide-react';

interface SidebarProps {
  folders: Folder[];
  selectedFolder: string;
  onSelectFolder: (id: string) => void;
  user: User | null;
  onOpenHelp: () => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (id: string) => void;
}

interface NavItemProps {
  id: string;
  icon: any;
  label: string;
  selectedFolder: string;
  onSelectFolder: (id: string) => void;
  onDelete?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, selectedFolder, onSelectFolder, onDelete }) => (
  <div className={`group flex items-center justify-between w-full rounded-lg transition-colors ${
      selectedFolder === id 
        ? 'bg-wood-500/10 dark:bg-wood-500/20' 
        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
  }`}>
      <button
        onClick={() => onSelectFolder(id)}
        className="flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium text-left outline-none focus:ring-2 focus:ring-inset focus:ring-wood-500/20 rounded-lg"
      >
        <Icon size={18} className={selectedFolder === id ? 'text-wood-600 dark:text-wood-500' : 'text-stone-400 dark:text-stone-500'} />
        <span className={`truncate ${selectedFolder === id ? 'text-wood-600 dark:text-wood-500' : 'text-stone-600 dark:text-stone-400'}`}>{label}</span>
      </button>
      {onDelete && (
         <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                e.preventDefault();
                onDelete(); 
            }}
            className="mx-2 p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all z-10"
            title="Delete Folder"
         >
             <Trash2 size={16} />
         </button>
      )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ folders, selectedFolder, onSelectFolder, user, onOpenHelp, onCreateFolder, onDeleteFolder }) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsSubmitting(false);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-colors">
      {/* Brand */}
      <div className="px-3 mb-8 flex items-center gap-2">
        <div className="w-6 h-6 bg-wood-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="font-serif font-bold text-xl text-stone-800 dark:text-stone-100">Cabin</span>
      </div>

      {/* Main Nav */}
      <div className="space-y-1 mb-8">
        <NavItem 
          id="all" 
          icon={LayoutGrid} 
          label="All Items" 
          selectedFolder={selectedFolder} 
          onSelectFolder={onSelectFolder} 
        />
        <NavItem 
          id="favorites" 
          icon={Star} 
          label="Favorites" 
          selectedFolder={selectedFolder} 
          onSelectFolder={onSelectFolder} 
        />
        <NavItem 
          id="trash" 
          icon={Trash2} 
          label="Recently Deleted" 
          selectedFolder={selectedFolder} 
          onSelectFolder={onSelectFolder} 
        />
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 mb-2 flex items-center justify-between text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
          <span>Folders</span>
          <button 
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-wood-600"
            title="New Folder"
          >
            <Plus size={14} />
          </button>
        </div>
        
        <div className="space-y-1">
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="px-2 mb-2">
              <div className="flex items-center gap-1">
                 <input 
                    autoFocus
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Name..."
                    disabled={isSubmitting}
                    className="w-full text-sm px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 outline-none focus:border-wood-500"
                 />
                 <button type="submit" disabled={isSubmitting} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                 </button>
                 <button type="button" disabled={isSubmitting} onClick={() => setIsCreating(false)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={14}/></button>
              </div>
            </form>
          )}

          {folders.map(folder => (
            <NavItem 
              key={folder.id} 
              id={folder.id} 
              icon={FolderIcon} 
              label={folder.name} 
              selectedFolder={selectedFolder} 
              onSelectFolder={onSelectFolder}
              onDelete={() => onDeleteFolder(folder.id)}
            />
          ))}
        </div>
      </div>

      {/* Utilities */}
      <div className="px-2 pb-4 space-y-1">
          <button 
             onClick={onOpenHelp}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
             <Info size={18} className="text-stone-400 dark:text-stone-500" />
             About Cabin
          </button>
          <button 
             onClick={toggleTheme}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
             {isDark ? <Sun size={18} className="text-stone-400" /> : <Moon size={18} className="text-stone-400" />}
             {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
      </div>

      {/* User Footer */}
      <div className="mt-auto border-t border-stone-200 dark:border-stone-800 pt-4 px-2">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{user?.name}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-stone-500 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;