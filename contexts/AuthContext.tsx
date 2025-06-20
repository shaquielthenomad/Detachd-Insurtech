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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for persisted login state
    const checkAuthState = async () => {
      const token = localStorage.getItem('detachd_token');
      const userStr = localStorage.getItem('detachd_user');
      
      if (token && userStr) {
        try {
          // For demo tokens, just restore from localStorage
          if (token === 'demo_token') {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setLoading(false);
            return;
          }

          // Verify token with backend for real tokens
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
          // For demo mode, try to restore from localStorage anyway
          if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
            try {
              const userData = JSON.parse(userStr);
              setUser(userData);
              console.log('Demo mode: Restored user from localStorage', userData);
            } catch (parseError) {
              localStorage.removeItem('detachd_token');
              localStorage.removeItem('detachd_user');
            }
          } else {
            localStorage.removeItem('detachd_token');
            localStorage.removeItem('detachd_user');
          }
        }
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Demo authentication - no API needed!
      const demoAccounts = {
        'admin@detachd.com': { 
          password: 'admin123', 
          user: { 
            id: '1', 
            email: 'admin@detachd.com', 
            name: 'Super Admin', 
            role: 'super_admin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=1e40af&color=fff'
          }
        },
        'insurer@detachd.com': { 
          password: 'insurer123', 
          user: { 
            id: '2', 
            email: 'insurer@detachd.com', 
            name: 'Insurer Admin', 
            role: 'insurer_admin',
            avatarUrl: 'https://ui-avatars.com/api/?name=Insurer+Admin&background=059669&color=fff'
          }
        },
        'policyholder@detachd.com': { 
          password: 'policy123', 
          user: { 
            id: '3', 
            email: 'policyholder@detachd.com', 
            name: 'John Policyholder', 
            role: 'policyholder',
            avatarUrl: 'https://ui-avatars.com/api/?name=John+Policyholder&background=3b82f6&color=fff'
          }
        },
        'witness@detachd.com': { 
          password: 'witness123', 
          user: { 
            id: '4', 
            email: 'witness@detachd.com', 
            name: 'Jane Witness', 
            role: 'witness',
            avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Witness&background=f59e0b&color=fff'
          }
        },
        'doctor@detachd.com': { 
          password: 'doctor123', 
          user: { 
            id: '5', 
            email: 'doctor@detachd.com', 
            name: 'Dr. Smith', 
            role: 'medical_professional',
            avatarUrl: 'https://ui-avatars.com/api/?name=Dr+Smith&background=ef4444&color=fff'
          }
        }
      };

      const account = demoAccounts[email as keyof typeof demoAccounts];
      
      if (!account || account.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = account.user;
      const token = 'demo_token';

      localStorage.setItem('detachd_token', token);
      localStorage.setItem('detachd_user', JSON.stringify(user));
      setUser(user);
      
      // Redirect to role-based route
      window.location.href = '#/redirect';
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
