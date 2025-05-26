import * as jwt from 'jsonwebtoken';
import { executeQuery } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'detachd_super_secure_jwt_secret_2024_production';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  email_verified: boolean;
  is_active: boolean;
}

export async function verifyToken(authHeader?: string): Promise<User | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Get user from database to ensure they're still active
    const users = await executeQuery<User>(
      'SELECT id, email, name, role, phone, email_verified, is_active FROM Users WHERE id = ? AND is_active = 1',
      [payload.userId]
    );

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireRole(allowedRoles: string[]) {
  return (user: User): boolean => {
    return allowedRoles.includes(user.role);
  };
}

export function requireEmailVerified(user: User): boolean {
  return user.email_verified;
} 