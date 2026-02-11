import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { mockBackend } from '../services/mockBackend';
import { CabinItem, Folder, ItemType } from '../types';
import Sidebar from './Sidebar';
import ItemCard from './ItemCard';
import UploadModal from './UploadModal';
import ItemViewer from './ItemViewer';
import HelpModal from './HelpModal';
import Toast from './Toast';
import ChatWidget from './ChatWidget';
import { Plus, Search, Menu, Filter, Feather, MessageCircle, Trash2, Archive, Folder as FolderIcon, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CabinItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | 'all' | 'favorites' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<CabinItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toast State
  const [toastConfig, setToastConfig] = useState<{message: string, action?: {label: string, onClick: () => void}} | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(30);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Load Data and Auto-Cleanup Trash
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [fetchedItems, fetchedFolders] = await Promise.all([
            mockBackend.getItems(user.id),
            mockBackend.getFolders()
          ]);
          
          // Auto-Delete expired trash items (Mocking backend background job)
          const now = Date.now();
          const cutoff = now - (retentionDays * 24 * 60 * 60 * 1000);
          
          const validItems = [];
          for (const item of fetchedItems) {
              if (item.deletedAt && item.deletedAt < cutoff) {
                  await mockBackend.permanentDeleteItem(item.id);
              } else {
                  validItems.push(item);
              }
          }
          
          // Also cleanup folders (though logic is similar, skipping for brevity in mock)
          
          setItems(validItems);
          setFolders(fetchedFolders);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, retentionDays]);

  // Handle New Item
  const handleItemCreated = (newItem: CabinItem) => {
    setItems(prev => [newItem, ...prev]);
    setIsUploadModalOpen(false);
    setToastConfig({ message: "Item added successfully." });
  };

  const handleCreateFolder = async (name: string) => {
    // Duplicate check
    if (folders.some(f => f.name.toLowerCase() === name.trim().toLowerCase() && !f.deletedAt)) {
        setToastConfig({ message: `Folder "${name}" already exists.` });
        return;
    }

    try {
      const newFolder = await mockBackend.createFolder(name);
      setFolders(prev => [...prev, newFolder]);
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  };

  const handleRestoreFolder = async (folder: Folder) => {
      // Optimistic Restore
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, deletedAt: undefined } : f));
      setToastConfig({ message: "Folder restored." });

      await mockBackend.restoreFolder(folder.id);
  };

  const handleDeleteFolder = async (id: string) => {
      const folderToDelete = folders.find(f => f.id === id);
      if (!folderToDelete) return;
      
      // 1. Optimistic Update: Soft Delete UI
      setFolders(prev => prev.map(f => f.id === id ? { ...f, deletedAt: Date.now() } : f));

      // If we were viewing that folder, go to All
      if (selectedFolder === id) setSelectedFolder('all');
      
      setToastConfig({ 
          message: `Moved "${folderToDelete.name}" to Trash.`,
          action: {
              label: "Undo",
              onClick: () => handleRestoreFolder(folderToDelete)
          }
      });

      try {
          // 2. Call Backend
          await mockBackend.deleteFolder(id);
      } catch (e) {
          console.error("Failed to delete folder", e);
      }
  };
  
  const handlePermanentDeleteFolder = async (id: string) => {
      if (!window.confirm("Permanently delete this folder and move its items to 'All Items'?")) return;
      
      const folderName = folders.find(f => f.id === id)?.name;
      
      // Optimistic
      setFolders(prev => prev.filter(f => f.id !== id));
      // Unlink items in UI to match backend permanent delete logic
      setItems(prev => prev.map(i => i.folderId === id ? { ...i, folderId: undefined } : i));
      
      setToastConfig({ message: `"${folderName}" permanently deleted.` });

      await mockBackend.permanentDeleteFolder(id);
  };

  const handleRestoreItem = async (id: string) => {
      const prevItems = [...items];
      // Optimistic Update
      setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt: undefined } : i));
      setToastConfig({ message: "Item restored." });
      try {
          await mockBackend.restoreItem(id);
      } catch (e) {
          setItems(prevItems);
      }
  };

  const handleDeleteItem = async (id: string) => {
      const prevItems = [...items];
      
      if (selectedFolder === 'trash') {
           // Permanent Delete
           if (!window.confirm("Delete this item permanently? This cannot be undone.")) return;
           setItems(prev => prev.filter(i => i.id !== id));
           setToastConfig({ message: "Item permanently deleted." });
           try {
               await mockBackend.permanentDeleteItem(id);
           } catch (e) {
               setItems(prevItems);
               setToastConfig({ message: "Failed to delete item." });
           }
      } else {
           // Soft Delete (Move to Trash)
           // Improved UX: No confirm, just Undo option.
           setItems(prev => prev.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i));
           
           if (viewingItem?.id === id) setViewingItem(null);
           
           setToastConfig({ 
               message: "Item moved to Recently Deleted.",
               action: {
                   label: "Undo",
                   onClick: () => handleRestoreItem(id)
               }
           });

           try {
               await mockBackend.deleteItem(id);
           } catch (e) {
               console.error(e);
               setToastConfig({ message: "Failed to move to trash." });
               setItems(prevItems);
           }
      }
  };
  
  const handleEmptyTrash = async () => {
      if (!window.confirm("Empty Trash? All items and folders in Recently Deleted will be permanently removed.")) return;
      
      const trashItems = items.filter(i => !!i.deletedAt);
      const trashFolders = folders.filter(f => !!f.deletedAt);
      
      // Remove from UI
      setItems(prev => prev.filter(i => !i.deletedAt));
      setFolders(prev => prev.filter(f => !f.deletedAt));
      
      try {
          // Permanent delete items
          for (const item of trashItems) {
              await mockBackend.permanentDeleteItem(item.id);
          }
          // Permanent delete folders
          for (const folder of trashFolders) {
               await mockBackend.permanentDeleteFolder(folder.id);
          }
          setToastConfig({ message: "Trash emptied." });
      } catch (e) {
          console.error("Failed to empty trash", e);
          setToastConfig({ message: "Failed to empty trash completely." });
      }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !currentStatus } : item));
    try {
      await mockBackend.updateItem(id, { isFavorite: !currentStatus });
    } catch (error) {
       // Revert on error
       setItems(prev => prev.map(item => item.id === id ? { ...item, isFavorite: currentStatus } : item));
    }
  };

  const handleItemUpdated = async (updatedItem: CabinItem) => {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    if (viewingItem && viewingItem.id === updatedItem.id) {
        setViewingItem(updatedItem);
    }
    
    try {
        await mockBackend.updateItem(updatedItem.id, { 
            content: updatedItem.content, 
            reminderTime: updatedItem.reminderTime,
            reminderMessage: updatedItem.reminderMessage,
            tags: updatedItem.tags
        });
    } catch (error) {
        console.error("Failed to save update", error);
    }
  };

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      items.forEach(item => {
        if (!item.deletedAt && item.reminderTime && item.reminderTime <= now) {
           // Play sound
           const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
           audio.play().catch(e => console.log("Audio play blocked", e));

           const msg = item.reminderMessage ? `${item.reminderMessage}` : `Time to study: ${item.title}`;
           setToastConfig({ message: msg });

           // Clear the reminder
           handleItemUpdated({ ...item, reminderTime: undefined });
        }
      });
    };

    const timer = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, [items]);

  // Derived State
  const activeFolders = folders.filter(f => !f.deletedAt);
  const deletedFolders = folders.filter(f => f.deletedAt);

  // Filtering
  const filteredItems = items.filter(item => {
    const isTrashed = !!item.deletedAt;
    
    if (selectedFolder === 'trash') {
        return isTrashed;
    }

    if (isTrashed) return false;

    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = selectedFolder === 'all' 
      ? true 
      : selectedFolder === 'favorites' 
        ? item.isFavorite 
        : item.folderId === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden transition-colors">
      {/* Toast Notification */}
      {toastConfig && (
        <Toast 
          message={toastConfig.message} 
          onClose={() => setToastConfig(null)} 
          action={toastConfig.action}
          duration={5000}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          folders={activeFolders} 
          selectedFolder={selectedFolder} 
          onSelectFolder={(id) => {
            setSelectedFolder(id);
            setSidebarOpen(false);
          }}
          user={user}
          onOpenHelp={() => {
              setIsHelpModalOpen(true);
              setSidebarOpen(false);
          }}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Background Watermark Logo - Themed */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <Feather 
                size={600} 
                className="text-wood-500/10 dark:text-wood-500/5 transform -rotate-12 translate-y-24" 
                strokeWidth={0.5}
            />
        </div>

        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 sm:px-6 z-10 transition-colors relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
                 <h1 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 hidden sm:block">
                  {selectedFolder === 'all' ? 'All Items' : 
                   selectedFolder === 'favorites' ? 'Favorites' : 
                   selectedFolder === 'trash' ? 'Recently Deleted' :
                   folders.find(f => f.id === selectedFolder)?.name || 'Folder'}
                </h1>
                {selectedFolder === 'trash' && (
                    <div className="text-xs text-stone-500 flex items-center gap-2">
                        <span>Keep for:</span>
                        <select 
                            value={retentionDays} 
                            onChange={(e) => setRetentionDays(Number(e.target.value))}
                            className="bg-transparent border-b border-stone-300 dark:border-stone-700 outline-none text-stone-800 dark:text-stone-300 font-bold"
                        >
                            <option value={30}>30 Days</option>
                            <option value={90}>90 Days</option>
                        </select>
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
            <div className="relative w-full max-w-xs hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                placeholder="Search notes or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border-none rounded-full text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-wood-500/20 focus:bg-white dark:focus:bg-stone-900 transition-all outline-none"
              />
            </div>
            {selectedFolder !== 'trash' ? (
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-stone-900 hover:bg-stone-800 dark:bg-wood-600 dark:hover:bg-wood-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add New</span>
                </button>
            ) : (filteredItems.length > 0 || deletedFolders.length > 0) && (
                <button 
                  onClick={handleEmptyTrash}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Empty Trash</span>
                </button>
            )}
          </div>
        </header>

        {/* Mobile Search Bar (Below Header) */}
        <div className="sm:hidden px-4 py-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 z-10 relative">
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border-none rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-wood-500/20 outline-none"
              />
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wood-500"></div>
             </div>
          ) : filteredItems.length === 0 && (selectedFolder !== 'trash' || deletedFolders.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-600 animate-fade-in-up">
              {selectedFolder === 'trash' ? <Trash2 size={48} className="mb-4 opacity-50" /> : <Filter size={48} className="mb-4 opacity-50" />}
              <p>{selectedFolder === 'trash' ? 'Trash is empty.' : 'No items found in this view.'}</p>
              {searchQuery && (
                  <p className="text-sm mt-2 text-stone-500">Tip: Create a new item with these tags.</p>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
                {/* Deleted Folders Section (Only in Trash View) */}
                {selectedFolder === 'trash' && deletedFolders.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Deleted Folders</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {deletedFolders.map(folder => (
                                <div key={folder.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between shadow-sm group">
                                    <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                                        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                                            <FolderIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium truncate max-w-[120px]">{folder.name}</p>
                                            <p className="text-xs text-stone-400">Deleted {formatDistanceToNow(folder.deletedAt!, { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleRestoreFolder(folder)}
                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" 
                                            title="Restore Folder"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handlePermanentDeleteFolder(folder.id)}
                                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" 
                                            title="Delete Permanently"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredItems.length > 0 && <hr className="border-stone-200 dark:border-stone-800" />}
                    </div>
                )}

                {/* Items Grid */}
                {filteredItems.length > 0 && (
                    <div className="space-y-4">
                        {selectedFolder === 'trash' && <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">Deleted Items</h3>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map(item => (
                                <ItemCard 
                                key={item.id} 
                                item={item} 
                                onClick={() => setViewingItem(item)} 
                                onToggleFavorite={() => handleToggleFavorite(item.id, item.isFavorite)}
                                onDelete={() => handleDeleteItem(item.id)}
                                onRestore={() => handleRestoreItem(item.id)}
                                isTrash={selectedFolder === 'trash'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Chat Bot Button */}
        <div className="fixed bottom-6 right-6 z-30">
           <button
             onClick={() => setIsChatOpen(!isChatOpen)}
             className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ${isChatOpen ? 'bg-stone-200 text-stone-800 rotate-90 dark:bg-stone-800 dark:text-white' : 'bg-wood-600 text-white hover:bg-wood-500'}`}
           >
              {isChatOpen ? <Plus size={24} className="rotate-45" /> : <MessageCircle size={28} />}
           </button>
        </div>
      </main>

      {/* Modals */}
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={handleItemCreated}
          folders={activeFolders}
        />
      )}

      {isHelpModalOpen && (
          <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}

      {viewingItem && (
        <ItemViewer 
          item={viewingItem} 
          onClose={() => setViewingItem(null)} 
          onUpdateItem={handleItemUpdated}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default Dashboard;