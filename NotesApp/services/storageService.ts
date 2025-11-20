import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Note } from '../types';

const USERS_KEY = '@notes_app_users';
const NOTES_KEY = '@notes_app_notes';
const CURRENT_USER_KEY = '@notes_app_current_user';

export const storageService = {
  // User Management
  async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      const users = await this.getAllUsers();
      users.push(user);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  async findUserByUsername(username: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },

  async clearCurrentUser(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  },

  // Notes Management
  async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async getUserNotes(userId: string): Promise<Note[]> {
    const allNotes = await this.getAllNotes();
    return allNotes.filter(note => note.userId === userId);
  },

  async saveNote(note: Note): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const existingIndex = notes.findIndex(n => n.id === note.id);
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }
      
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(n => n.id !== noteId);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
};
