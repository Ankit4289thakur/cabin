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
import { Plus, Search, Menu, Filter, Feather, MessageCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CabinItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<CabinItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Load Data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [fetchedItems, fetchedFolders] = await Promise.all([
            mockBackend.getItems(user.id),
            mockBackend.getFolders()
          ]);
          setItems(fetchedItems);
          setFolders(fetchedFolders);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  // Handle New Item
  const handleItemCreated = (newItem: CabinItem) => {
    setItems(prev => [newItem, ...prev]);
    setIsUploadModalOpen(false);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const newFolder = await mockBackend.createFolder(name);
      setFolders(prev => [...prev, newFolder]);
    } catch (e) {
      console.error("Failed to create folder", e);
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
        if (item.reminderTime && item.reminderTime <= now) {
           // Play sound
           const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
           audio.play().catch(e => console.log("Audio play blocked", e));

           // Show On-Screen Toast (Warning Alarm) with custom message or default
           const msg = item.reminderMessage ? `${item.reminderMessage}` : `Time to study: ${item.title}`;
           setToastMessage(msg);

           // Clear the reminder (mark as done) to prevent loops
           handleItemUpdated({ ...item, reminderTime: undefined });
        }
      });
    };

    const timer = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, [items]);

  // Filtering
  const filteredItems = items.filter(item => {
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
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
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
          folders={folders} 
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
            <h1 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 hidden sm:block">
              {selectedFolder === 'all' ? 'All Items' : 
               selectedFolder === 'favorites' ? 'Favorites' : 
               folders.find(f => f.id === selectedFolder)?.name || 'Folder'}
            </h1>
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
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-stone-900 hover:bg-stone-800 dark:bg-wood-600 dark:hover:bg-wood-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add New</span>
            </button>
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
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-600 animate-fade-in-up">
              <Filter size={48} className="mb-4 opacity-50" />
              <p>No items found in this view.</p>
              {searchQuery && (
                  <p className="text-sm mt-2 text-stone-500">Tip: Create a new item with these tags.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
              {filteredItems.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => setViewingItem(item)} 
                  onToggleFavorite={() => handleToggleFavorite(item.id, item.isFavorite)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Bot Button (Upcoming) */}
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
          folders={folders}
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
        />
      )}
    </div>
  );
};

export default Dashboard;