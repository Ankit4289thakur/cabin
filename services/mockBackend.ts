import { AuthState, CabinItem, ItemType, User, Folder } from '../types';

// Initial Mock Data Structure
const INITIAL_FOLDERS: Folder[] = [];
const INITIAL_ITEMS: CabinItem[] = [];

// Local Storage Keys
const STORAGE_KEY_ITEMS = 'cabin_items';
const STORAGE_KEY_FOLDERS = 'cabin_folders';

// Simulation Delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackend {
  private items: CabinItem[] = [];
  private folders: Folder[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
    const savedFolders = localStorage.getItem(STORAGE_KEY_FOLDERS);

    if (savedItems) {
      this.items = JSON.parse(savedItems);
    } else {
      this.items = INITIAL_ITEMS;
      this.saveItems();
    }

    if (savedFolders) {
      this.folders = JSON.parse(savedFolders);
    } else {
      this.folders = INITIAL_FOLDERS;
      this.saveFolders();
    }
  }

  private saveItems() {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(this.items));
  }

  private saveFolders() {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(this.folders));
  }

  // --- Demo Data Generator ---
  private seedDemoData(userId: string) {
    // Check persistent flag to avoid re-seeding if user deleted everything
    const seedKey = `cabin_seeded_${userId}`;
    if (localStorage.getItem(seedKey)) return;

    // Check if user already has items (fallback)
    if (this.items.some(i => i.userId === userId)) {
        localStorage.setItem(seedKey, 'true');
        return;
    }

    const now = Date.now();
    
    // Create Default Folders
    const folderId = Math.random().toString(36).substr(2, 9);
    const demoFolders: Folder[] = [
        { id: folderId, name: 'Welcome Guide' }
    ];
    this.folders.push(...demoFolders);
    this.saveFolders();

    // Create Demo Items
    const demoItems: CabinItem[] = [
        {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            type: ItemType.NOTE,
            title: 'Welcome to Cabin by Ankito',
            content: `Welcome to your new personal data store!\n\nThis app was designed to help you organize your study life. Here are a few things you can do:\n\n1. **Upload**: Click 'Add New' to upload PDFs, Images, or write notes.\n2. **Camera**: Use the camera tab to snap photos of whiteboards or textbooks directly.\n3. **AI Powers**: Open any note and use the AI buttons to Summarize, Rewrite, or Chat with your content.\n4. **Trash**: Deleted items go to 'Recently Deleted' for 30 days before being removed permanently.\n\nEnjoy your distraction-free space!`,
            createdAt: now,
            tags: ['welcome', 'guide'],
            isFavorite: true,
            folderId: folderId
        },
        {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            type: ItemType.NOTE,
            title: 'Math Formula Sheet (Demo)',
            content: 'Quadratic Formula:\nx = (-b ± √(b² - 4ac)) / 2a\n\nPythagorean Theorem:\na² + b² = c²\n\nArea of Circle:\nA = πr²',
            createdAt: now - 100000,
            tags: ['math', 'formulas'],
            isFavorite: false
        },
        {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            type: ItemType.IMAGE,
            title: 'Study Setup Inspiration',
            content: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
            mimeType: 'image/jpeg',
            createdAt: now - 500000,
            tags: ['inspiration'],
            isFavorite: true
        }
    ];

    this.items.push(...demoItems);
    this.saveItems();
    localStorage.setItem(seedKey, 'true');
  }

  // Auth
  async login(email: string): Promise<User> {
    await delay(800);
    
    // Generate a consistent User ID based on email for the mock
    let userId = 'u_' + email.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    
    const name = await this.getUserName(email);
    
    // Seed data for this user if they are new
    this.seedDemoData(userId);

    return {
        id: userId,
        name: name,
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`
    };
  }

  async logout(): Promise<void> {
    await delay(300);
  }

  async getUserName(email: string): Promise<string> {
    await delay(500);
    const namePart = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    if (!namePart) return "Explorer";
    return namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Data
  async getItems(userId: string): Promise<CabinItem[]> {
    await delay(500);
    return this.items.filter(i => i.userId === userId);
  }

  async getFolders(): Promise<Folder[]> {
    await delay(300);
    // Return all folders (frontend handles filtering deleted ones)
    return this.folders;
  }

  async createFolder(name: string): Promise<Folder> {
    await delay(400);
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name
    };
    this.folders.push(newFolder);
    this.saveFolders();
    return newFolder;
  }

  // Soft Delete Folder (Moves to Trash)
  async deleteFolder(id: string): Promise<void> {
    await delay(300);
    const index = this.folders.findIndex(f => f.id === id);
    if (index !== -1) {
        this.folders[index].deletedAt = Date.now();
        this.saveFolders();
    }
    // We do NOT unlink items in soft delete. 
    // This allows items to reappear in the folder if restored.
  }

  // Restore Folder
  async restoreFolder(id: string): Promise<void> {
    await delay(300);
    const index = this.folders.findIndex(f => f.id === id);
    if (index !== -1) {
        this.folders[index].deletedAt = undefined;
        this.saveFolders();
    }
  }

  // Permanent Delete Folder (From Trash)
  async permanentDeleteFolder(id: string): Promise<void> {
      await delay(300);
      this.folders = this.folders.filter(f => f.id !== id);
      // Now we must unlink items because the folder is gone forever
      this.items = this.items.map(item => item.folderId === id ? { ...item, folderId: undefined } : item);
      
      this.saveFolders();
      this.saveItems();
  }

  async createItem(item: Omit<CabinItem, 'id' | 'createdAt' | 'userId'>, userId: string): Promise<CabinItem> {
    await delay(600);
    const newItem: CabinItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      userId
    };
    this.items.unshift(newItem);
    this.saveItems();
    return newItem;
  }

  async updateItem(id: string, updates: Partial<CabinItem>): Promise<CabinItem> {
    await delay(300);
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Item not found");
    
    this.items[index] = { ...this.items[index], ...updates };
    this.saveItems();
    return this.items[index];
  }

  // Soft Delete - Moves to "Recently Deleted"
  async deleteItem(id: string): Promise<void> {
    await delay(300);
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) {
        this.items[index].deletedAt = Date.now(); // Set timestamp for trash
        this.saveItems();
    }
  }

  // Restore from Trash
  async restoreItem(id: string): Promise<void> {
      await delay(300);
      const index = this.items.findIndex(i => i.id === id);
      if (index !== -1) {
          this.items[index].deletedAt = undefined; // Remove timestamp to restore
          this.saveItems();
      }
  }

  // Hard Delete
  async permanentDeleteItem(id: string): Promise<void> {
      await delay(300);
      this.items = this.items.filter(i => i.id !== id);
      this.saveItems();
  }

  // File Upload Simulation
  async uploadFile(file: File): Promise<string> {
    await delay(1000);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

export const mockBackend = new MockBackend();