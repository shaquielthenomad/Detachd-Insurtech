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
      // Check for demo accounts first
      const demoAccounts = [
        { email: 'admin@detachd.com', password: 'admin123', role: UserRole.SUPER_ADMIN, name: 'Super Admin' },
        { email: 'insurer@detachd.com', password: 'insurer123', role: UserRole.INSURER_PARTY, name: 'Insurer Admin' },
        { email: 'policyholder@detachd.com', password: 'policy123', role: UserRole.POLICYHOLDER, name: 'John Policyholder' },
        { email: 'witness@detachd.com', password: 'witness123', role: UserRole.WITNESS, name: 'Jane Witness' },
        { email: 'doctor@detachd.com', password: 'doctor123', role: UserRole.MEDICAL_PROFESSIONAL, name: 'Dr. Smith' }
      ];

      const demoAccount = demoAccounts.find(acc => acc.email === email && acc.password === password);
      
      if (demoAccount) {
        const userData: User = {
          id: `demo_${demoAccount.role.toLowerCase().replace(/\s+/g, '_')}`,
          email: demoAccount.email,
          name: demoAccount.name,
          role: demoAccount.role,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoAccount.name)}&background=1e40af&color=fff`
        };

        setUser(userData);
        localStorage.setItem('detachd_token', 'demo_token');
        localStorage.setItem('detachd_user', JSON.stringify(userData));
        return;
      }

      // Try API login for non-demo accounts
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Invalid email or password');
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
      
      // Enhanced fallback for development
      if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
        // Create a demo user based on email pattern
        const userData: User = {
          id: `demo_${Date.now()}`,
          email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: email.includes('admin') ? UserRole.SUPER_ADMIN : 
                email.includes('insurer') ? UserRole.INSURER_PARTY : 
                email.includes('witness') ? UserRole.WITNESS :
                email.includes('doctor') || email.includes('medical') ? UserRole.MEDICAL_PROFESSIONAL :
                UserRole.POLICYHOLDER,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=1e40af&color=fff`
        };
        
        setUser(userData);
        localStorage.setItem('detachd_user', JSON.stringify(userData));
        localStorage.setItem('detachd_token', 'demo_token');
        console.log('Demo mode: Logged in as', userData);
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
