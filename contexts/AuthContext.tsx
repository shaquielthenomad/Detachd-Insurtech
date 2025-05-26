import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for persisted login state
    const checkAuthState = async () => {
      const token = localStorage.getItem('detachd_token');
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('detachd_token');
            localStorage.removeItem('detachd_user');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('detachd_token');
          localStorage.removeItem('detachd_user');
        }
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=1e40af&color=fff`
      };

      setUser(userData);
      localStorage.setItem('detachd_token', data.token);
      localStorage.setItem('detachd_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo mode for development
      if (import.meta.env.DEV) {
        const demoUser: User = {
          id: `demo_${Date.now()}`,
          email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: email.includes('admin') ? UserRole.SUPER_ADMIN : 
                email.includes('insurer') ? UserRole.INSURER_PARTY : UserRole.POLICYHOLDER,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=1e40af&color=fff`
        };
        setUser(demoUser);
        localStorage.setItem('detachd_user', JSON.stringify(demoUser));
        localStorage.setItem('detachd_token', 'demo_token');
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=1e40af&color=fff`
      };

      setUser(user);
      localStorage.setItem('detachd_token', data.token);
      localStorage.setItem('detachd_user', JSON.stringify(user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout endpoint if available
      const token = localStorage.getItem('detachd_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {}); // Ignore errors on logout
      }
    } finally {
      setUser(null);
      localStorage.removeItem('detachd_token');
      localStorage.removeItem('detachd_user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      login, 
      logout, 
      loading,
      register 
    }}>
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
