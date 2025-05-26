
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USER_ID } from '../constants';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, name: string, role: UserRole) => Promise<void>; // Added name and role for demo
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for persisted login state (e.g., from localStorage)
    const storedUser = localStorage.getItem('detachdUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, name: string, role: UserRole) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = { id: MOCK_USER_ID, email, name, role, avatarUrl: `https://picsum.photos/seed/${email}/100/100` };
    setUser(mockUser);
    localStorage.setItem('detachdUser', JSON.stringify(mockUser));
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('detachdUser');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
