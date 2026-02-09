export enum ItemType {
  NOTE = 'NOTE',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  VIDEO = 'VIDEO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CabinItem {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  content: string; // Text content or URL for files
  createdAt: number;
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  mimeType?: string; // For images/files
  reminderTime?: number; // Timestamp for study alert
  reminderMessage?: string; // Custom message for the alert
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}