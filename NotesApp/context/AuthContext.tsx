import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const loggedInUser = await authService.login(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    const newUser = await authService.signup(username, password);
    if (newUser) {
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
