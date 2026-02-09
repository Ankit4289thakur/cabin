import { AuthState, CabinItem, ItemType, User, Folder } from '../types';

// Initial Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Student',
  email: 'alex@cabin.app',
  avatarUrl: 'https://picsum.photos/150/150'
};

const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Mathematics' },
  { id: 'f2', name: 'History' },
  { id: 'f3', name: 'Research Project' }
];

const INITIAL_ITEMS: CabinItem[] = [
  {
    id: 'i1',
    userId: 'u1',
    type: ItemType.NOTE,
    title: 'Calculus Formulas',
    content: 'Derivatives:\nd/dx(x^n) = nx^(n-1)\nd/dx(sin x) = cos x\n\nIntegrals:\n∫x^n dx = (x^(n+1))/(n+1) + C',
    createdAt: Date.now() - 10000000,
    tags: ['math', 'finals'],
    folderId: 'f1',
    isFavorite: true
  },
  {
    id: 'i2',
    userId: 'u1',
    type: ItemType.IMAGE,
    title: 'Cell Structure Diagram',
    content: 'https://picsum.photos/800/600', // Placeholder
    mimeType: 'image/jpeg',
    createdAt: Date.now() - 5000000,
    tags: ['biology', 'diagram'],
    isFavorite: false
  },
  {
    id: 'i3',
    userId: 'u1',
    type: ItemType.NOTE,
    title: 'Thesis Ideas',
    content: '1. The impact of AI on modern education.\n2. Sustainable architecture in urban environments.\n3. Digital minimalism and mental health.',
    createdAt: Date.now() - 200000,
    tags: ['ideas', 'research'],
    folderId: 'f3',
    isFavorite: false
  }
];

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

  // Auth
  async login(email: string): Promise<User> {
    await delay(800);
    return { ...MOCK_USER, email };
  }

  async logout(): Promise<void> {
    await delay(300);
  }

  // Data
  async getItems(userId: string): Promise<CabinItem[]> {
    await delay(500);
    return this.items.filter(i => i.userId === userId);
  }

  async getFolders(): Promise<Folder[]> {
    await delay(300);
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

  async deleteItem(id: string): Promise<void> {
    await delay(300);
    this.items = this.items.filter(i => i.id !== id);
    this.saveItems();
  }

  // File Upload Simulation
  async uploadFile(file: File): Promise<string> {
    await delay(1000);
    // In a real app, this would upload to Storage (Firebase/Supabase) and return a URL.
    // Here we convert small files to Base64 for demo purposes, or return a placeholder for large ones.
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

export const mockBackend = new MockBackend();