export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  body: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'newest' | 'oldest' | 'titleAZ' | 'titleZA';

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}
