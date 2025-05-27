import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  validateLoginForm, 
  validateRegistrationForm, 
  checkRateLimit, 
  clearRateLimit, 
  sanitizeHtml 
} from '../utils/validation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
  }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

// Demo accounts for development only
const DEMO_ACCOUNTS = [
  { email: 'admin@detachd.com', password: 'admin123', role: UserRole.SUPER_ADMIN, name: 'Super Admin' },
  { email: 'insurer@detachd.com', password: 'insurer123', role: UserRole.INSURER_PARTY, name: 'Insurer Admin' },
  { email: 'policyholder@detachd.com', password: 'policy123', role: UserRole.POLICYHOLDER, name: 'John Policyholder' },
  { email: 'witness@detachd.com', password: 'witness123', role: UserRole.WITNESS, name: 'Jane Witness' },
  { email: 'doctor@detachd.com', password: 'doctor123', role: UserRole.MEDICAL_PROFESSIONAL, name: 'Dr. Smith' }
];

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      const token = localStorage.getItem('detachd_token');
      const userStr = localStorage.getItem('detachd_user');
      
      if (!token || !userStr) {
        setLoading(false);
        return;
      }

      try {
        // For demo tokens in development only
        if (token === 'demo_token' && import.meta.env.DEV) {
          const userData = JSON.parse(userStr);
          // Validate the stored user data
          if (userData && userData.email && userData.name && userData.role) {
            setUser(userData);
          } else {
            // Invalid stored data, clear it
            localStorage.removeItem('detachd_token');
            localStorage.removeItem('detachd_user');
          }
          setLoading(false);
          return;
        }

        // Verify real tokens with backend
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.user) {
            setUser(userData.user);
          } else {
            throw new Error('Invalid response from server');
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('detachd_token');
          localStorage.removeItem('detachd_user');
          if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('detachd_token');
        localStorage.removeItem('detachd_user');
        
        // In production, never fall back to demo mode
        if (!import.meta.env.DEV) {
          setError('Authentication service unavailable. Please try again later.');
        }
      }
      
      setLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    
    // Input validation
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      throw new Error(firstError);
    }

    // Rate limiting
    const rateLimitKey = `login_${email}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      const error = 'Too many login attempts. Please try again in 15 minutes.';
      setError(error);
      throw new Error(error);
    }

    setLoading(true);
    
    try {
      // Check for demo accounts first (development only)
      if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
        const demoAccount = DEMO_ACCOUNTS.find(acc => 
          acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );
        
        if (demoAccount) {
          const userData: User = {
            id: `demo_${demoAccount.role.toLowerCase().replace(/\s+/g, '_')}`,
            email: demoAccount.email,
            name: sanitizeHtml(demoAccount.name),
            role: demoAccount.role,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoAccount.name)}&background=1e40af&color=fff`
          };

          setUser(userData);
          localStorage.setItem('detachd_token', 'demo_token');
          localStorage.setItem('detachd_user', JSON.stringify(userData));
          clearRateLimit(rateLimitKey);
          return;
        }
      }

      // API login for real accounts
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password 
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Invalid email or password';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Use default error message
        }
        
        if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      const userData: User = {
        id: data.user.id,
        email: sanitizeHtml(data.user.email),
        name: sanitizeHtml(data.user.name),
        role: data.user.role as UserRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=1e40af&color=fff`
      };

      setUser(userData);
      localStorage.setItem('detachd_token', data.token);
      localStorage.setItem('detachd_user', JSON.stringify(userData));
      clearRateLimit(rateLimitKey);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // In production, never create fake users
      if (import.meta.env.PROD) {
        throw error;
      }
      
      // In development, only create demo users for specific test emails
      if (import.meta.env.DEV && email.includes('@test.detachd.com')) {
        console.warn('Demo mode: Creating test user for development');
        const userData: User = {
          id: `test_${Date.now()}`,
          email: sanitizeHtml(email),
          name: sanitizeHtml(email.split('@')[0].replace(/[^a-zA-Z]/g, ' ')),
          role: UserRole.POLICYHOLDER,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=1e40af&color=fff`
        };
        
        setUser(userData);
        localStorage.setItem('detachd_user', JSON.stringify(userData));
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
    setError(null);
    
    // Input validation
    const validation = validateRegistrationForm({
      ...userData,
      confirmPassword: userData.password // For validation purposes
    });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      throw new Error(firstError);
    }

    // Rate limiting
    const rateLimitKey = `register_${userData.email}`;
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
      const error = 'Too many registration attempts. Please try again in 1 hour.';
      setError(error);
      throw new Error(error);
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          name: sanitizeHtml(userData.name.trim()),
          role: userData.role,
          phone: userData.phone ? sanitizeHtml(userData.phone.trim()) : undefined
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Use default error message
        }
        
        if (response.status === 409) {
          errorMessage = 'An account with this email already exists';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.';
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      const user: User = {
        id: data.user.id,
        email: sanitizeHtml(data.user.email),
        name: sanitizeHtml(data.user.name),
        role: data.user.role as UserRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=1e40af&color=fff`
      };

      setUser(user);
      localStorage.setItem('detachd_token', data.token);
      localStorage.setItem('detachd_user', JSON.stringify(user));
      clearRateLimit(rateLimitKey);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('detachd_token');
      
      // Call logout API if we have a real token
      if (token && token !== 'demo_token') {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.warn('Logout API call failed:', error);
          // Continue with local logout anyway
        }
      }
      
      // Clear local storage
      localStorage.removeItem('detachd_token');
      localStorage.removeItem('detachd_user');
      
      // Clear user state
      setUser(null);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      localStorage.removeItem('detachd_token');
      localStorage.removeItem('detachd_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
    error,
    register,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSecureAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
}; 