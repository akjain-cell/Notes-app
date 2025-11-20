import { storageService } from './storageService';
import { User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<User | null> {
    const user = await storageService.findUserByUsername(username);
    
    if (user && user.password === password) {
      await storageService.setCurrentUser(user);
      return user;
    }
    
    return null;
  },

  async signup(username: string, password: string): Promise<User | null> {
    const existingUser = await storageService.findUserByUsername(username);
    
    if (existingUser) {
      return null; // Username already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: new Date().toISOString(),
    };

    await storageService.saveUser(newUser);
    await storageService.setCurrentUser(newUser);
    return newUser;
  },

  async logout(): Promise<void> {
    await storageService.clearCurrentUser();
  },

  async getCurrentUser(): Promise<User | null> {
    return await storageService.getCurrentUser();
  },
};
