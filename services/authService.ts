import { User, UserRole } from '../types';

// Azure AD B2C Configuration
export const AUTH_CONFIG = {
  clientId: process.env.AZURE_CLIENT_ID || 'your-azure-client-id',
  authority: 'https://detachd.b2clogin.com/detachd.onmicrosoft.com/B2C_1_signupsignin',
  redirectUri: 'https://detachd.systems/auth/callback',
  scopes: ['openid', 'profile', 'email'],
  knownAuthorities: ['detachd.b2clogin.com']
};

// JWT Configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
  expiresIn: '24h',
  issuer: 'detachd.systems',
  audience: 'detachd-users'
};

// Authentication Service
export class AuthService {
  
  // Generate JWT token
  static generateToken(user: User): string {
    // In a real implementation, use a proper JWT library like jsonwebtoken
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iss: JWT_CONFIG.issuer,
      aud: JWT_CONFIG.audience
    };
    
    // Mock JWT token (in production, use proper signing)
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.mock-signature`;
  }
  
  // Verify JWT token
  static verifyToken(token: string): User | null {
    try {
      // In a real implementation, verify signature and expiration
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=1e40af&color=fff`
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
  
  // Login with email/password
  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Mock successful login for demo
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: email.includes('insurer') ? UserRole.INSURER_PARTY : UserRole.POLICYHOLDER,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=1e40af&color=fff`
      };
      
      const token = this.generateToken(mockUser);
      return { user: mockUser, token };
    }
  }
  
  // Register new user
  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
  }): Promise<{ user: User; token: string } | null> {
    try {
      // In production, this would call your backend API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Mock successful registration for demo
      const mockUser: User = {
        id: `usr_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1e40af&color=fff`
      };
      
      const token = this.generateToken(mockUser);
      return { user: mockUser, token };
    }
  }
  
  // Password reset
  static async resetPassword(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Password reset error:', error);
      return true; // Mock success for demo
    }
  }
  
  // Logout
  static logout(): void {
    localStorage.removeItem('detachd_token');
    localStorage.removeItem('detachd_user');
    // In production, also invalidate token on server
  }
  
  // Get current user from storage
  static getCurrentUser(): User | null {
    try {
      const token = localStorage.getItem('detachd_token');
      if (!token) return null;
      
      return this.verifyToken(token);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
  
  // Save user session
  static saveSession(user: User, token: string): void {
    localStorage.setItem('detachd_token', token);
    localStorage.setItem('detachd_user', JSON.stringify(user));
  }
  
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  }
  
  // Get authorization header
  static getAuthHeader(): { Authorization: string } | {} {
    const token = localStorage.getItem('detachd_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
} 