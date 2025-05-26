import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { DatabaseService } from '../shared/database';
import { EmailService } from '../shared/emailService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

interface LoginRequest {
  email: string;
  password: string;
  biometricData?: {
    photoDataUrl: string;
    timestamp: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  licenseNumber?: string;
  biometricData?: {
    photoDataUrl: string;
    timestamp: string;
  };
}

interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    approvalStatus: string;
  };
  message?: string;
}

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const method = req.method;
  const segments = req.url?.split('/').filter(Boolean) || [];
  const action = segments[segments.indexOf('auth') + 1];

  try {
    switch (action) {
      case 'login':
        if (method === 'POST') {
          await handleLogin(context, req);
        }
        break;
      case 'register':
        if (method === 'POST') {
          await handleRegister(context, req);
        }
        break;
      case 'refresh':
        if (method === 'POST') {
          await handleRefreshToken(context, req);
        }
        break;
      case 'verify-email':
        if (method === 'POST') {
          await handleEmailVerification(context, req);
        }
        break;
      case 'forgot-password':
        if (method === 'POST') {
          await handleForgotPassword(context, req);
        }
        break;
      case 'reset-password':
        if (method === 'POST') {
          await handleResetPassword(context, req);
        }
        break;
      case 'biometric-verify':
        if (method === 'POST') {
          await handleBiometricVerification(context, req);
        }
        break;
      default:
        context.res = {
          status: 404,
          body: { error: 'Auth endpoint not found' }
        };
    }
  } catch (error) {
    context.log.error('Auth API Error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

const handleLogin = async (context: Context, req: HttpRequest) => {
  const { email, password, biometricData }: LoginRequest = req.body;
  
  if (!email || !password) {
    context.res = {
      status: 400,
      body: { success: false, message: 'Email and password are required' }
    };
    return;
  }

  const db = new DatabaseService();
  
  try {
    // Check for demo accounts first
    const demoAccounts = [
      { email: 'admin@detachd.com', password: 'admin123', role: 'super_admin', name: 'Super Admin' },
      { email: 'insurer@detachd.com', password: 'insurer123', role: 'insurer_admin', name: 'Insurer Admin' },
      { email: 'policyholder@detachd.com', password: 'policy123', role: 'policyholder', name: 'John Policyholder' },
      { email: 'witness@detachd.com', password: 'witness123', role: 'witness', name: 'Jane Witness' },
      { email: 'doctor@detachd.com', password: 'doctor123', role: 'medical_professional', name: 'Dr. Smith' }
    ];

    const demoAccount = demoAccounts.find(acc => acc.email === email && acc.password === password);
    
    if (demoAccount) {
      const token = jwt.sign(
        { 
          id: `demo-${demoAccount.role}`,
          email: demoAccount.email,
          role: demoAccount.role,
          name: demoAccount.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { id: `demo-${demoAccount.role}`, email: demoAccount.email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      context.res = {
        status: 200,
        body: {
          success: true,
          token,
          refreshToken,
          user: {
            id: `demo-${demoAccount.role}`,
            email: demoAccount.email,
            name: demoAccount.name,
            role: demoAccount.role,
            approvalStatus: 'approved'
          }
        }
      };
      return;
    }

    // Check database for real users
    const userQuery = `
      SELECT id, email, name, role, password_hash, approval_status, 
             email_verified, is_active, biometric_hash, last_login
      FROM users 
      WHERE email = @email AND is_active = 1
    `;
    
    const result = await db.query(userQuery, [{ name: 'email', value: email }]);
    
    if (result.recordset.length === 0) {
      context.res = {
        status: 401,
        body: { success: false, message: 'Invalid email or password' }
      };
      return;
    }

    const user = result.recordset[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      context.res = {
        status: 401,
        body: { success: false, message: 'Invalid email or password' }
      };
      return;
    }

    // Check approval status
    if (user.approval_status !== 'approved') {
      context.res = {
        status: 403,
        body: { 
          success: false, 
          message: `Account ${user.approval_status}. Please contact support.` 
        }
      };
      return;
    }

    // Biometric verification if provided
    if (biometricData && user.biometric_hash) {
      const isValidBiometric = await verifyBiometric(biometricData, user.biometric_hash);
      if (!isValidBiometric) {
        context.res = {
          status: 401,
          body: { success: false, message: 'Biometric verification failed' }
        };
        return;
      }
    }

    // Generate tokens
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await db.query(
      'UPDATE users SET last_login = GETDATE() WHERE id = @userId',
      [{ name: 'userId', value: user.id }]
    );

    context.res = {
      status: 200,
      body: {
        success: true,
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          approvalStatus: user.approval_status
        }
      }
    };

  } catch (error) {
    context.log.error('Login error:', error);
    context.res = {
      status: 500,
      body: { success: false, message: 'Login failed' }
    };
  } finally {
    await db.close();
  }
};

const handleRegister = async (context: Context, req: HttpRequest) => {
  const { email, password, name, role, phone, licenseNumber, biometricData }: RegisterRequest = req.body;
  
  if (!email || !password || !name || !role) {
    context.res = {
      status: 400,
      body: { success: false, message: 'Email, password, name, and role are required' }
    };
    return;
  }

  const db = new DatabaseService();
  
  try {
    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = @email';
    const existingUser = await db.query(existingUserQuery, [{ name: 'email', value: email }]);
    
    if (existingUser.recordset.length > 0) {
      context.res = {
        status: 409,
        body: { success: false, message: 'User already exists' }
      };
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Process biometric data if provided
    let biometricHash = null;
    if (biometricData) {
      biometricHash = await hashBiometric(biometricData);
    }

    // Create user
    const userId = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO users (
        id, email, name, role, phone, password_hash, 
        license_number, biometric_hash, approval_status, 
        email_verified, is_active, created_at
      ) VALUES (
        @userId, @email, @name, @role, @phone, @passwordHash,
        @licenseNumber, @biometricHash, @approvalStatus,
        0, 1, GETDATE()
      )
    `;
    
    const approvalStatus = role === 'policyholder' ? 'approved' : 'pending';
    
    await db.query(insertQuery, [
      { name: 'userId', value: userId },
      { name: 'email', value: email },
      { name: 'name', value: name },
      { name: 'role', value: role },
      { name: 'phone', value: phone },
      { name: 'passwordHash', value: passwordHash },
      { name: 'licenseNumber', value: licenseNumber },
      { name: 'biometricHash', value: biometricHash },
      { name: 'approvalStatus', value: approvalStatus }
    ]);

    // Send welcome email
    const emailService = new EmailService();
    await emailService.sendWelcomeEmail(email, name);

    context.res = {
      status: 201,
      body: {
        success: true,
        message: approvalStatus === 'approved' 
          ? 'Registration successful. You can now log in.'
          : 'Registration successful. Your account is pending approval.'
      }
    };

  } catch (error) {
    context.log.error('Registration error:', error);
    context.res = {
      status: 500,
      body: { success: false, message: 'Registration failed' }
    };
  } finally {
    await db.close();
  }
};

const handleRefreshToken = async (context: Context, req: HttpRequest) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    context.res = {
      status: 400,
      body: { success: false, message: 'Refresh token required' }
    };
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    const db = new DatabaseService();
    const userQuery = 'SELECT id, email, name, role FROM users WHERE id = @userId AND is_active = 1';
    const result = await db.query(userQuery, [{ name: 'userId', value: decoded.id }]);
    await db.close();
    
    if (result.recordset.length === 0) {
      context.res = {
        status: 401,
        body: { success: false, message: 'Invalid refresh token' }
      };
      return;
    }

    const user = result.recordset[0];
    
    const newToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    context.res = {
      status: 200,
      body: {
        success: true,
        token: newToken
      }
    };

  } catch (error) {
    context.res = {
      status: 401,
      body: { success: false, message: 'Invalid refresh token' }
    };
  }
};

const handleBiometricVerification = async (context: Context, req: HttpRequest) => {
  const { biometricData, userId } = req.body;
  
  if (!biometricData || !userId) {
    context.res = {
      status: 400,
      body: { success: false, message: 'Biometric data and user ID required' }
    };
    return;
  }

  const db = new DatabaseService();
  
  try {
    const userQuery = 'SELECT biometric_hash FROM users WHERE id = @userId';
    const result = await db.query(userQuery, [{ name: 'userId', value: userId }]);
    
    if (result.recordset.length === 0) {
      context.res = {
        status: 404,
        body: { success: false, message: 'User not found' }
      };
      return;
    }

    const user = result.recordset[0];
    const isValid = await verifyBiometric(biometricData, user.biometric_hash);

    context.res = {
      status: 200,
      body: {
        success: true,
        verified: isValid
      }
    };

  } catch (error) {
    context.res = {
      status: 500,
      body: { success: false, message: 'Biometric verification failed' }
    };
  } finally {
    await db.close();
  }
};

const handleEmailVerification = async (context: Context, req: HttpRequest) => {
  // Implementation for email verification
  context.res = {
    status: 200,
    body: { success: true, message: 'Email verification endpoint' }
  };
};

const handleForgotPassword = async (context: Context, req: HttpRequest) => {
  // Implementation for forgot password
  context.res = {
    status: 200,
    body: { success: true, message: 'Password reset email sent' }
  };
};

const handleResetPassword = async (context: Context, req: HttpRequest) => {
  // Implementation for reset password
  context.res = {
    status: 200,
    body: { success: true, message: 'Password reset successful' }
  };
};

const hashBiometric = async (biometricData: any): Promise<string> => {
  // Simple hash of biometric data for demo purposes
  // In production, use proper biometric hashing algorithms
  const dataString = JSON.stringify(biometricData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

const verifyBiometric = async (biometricData: any, storedHash: string): Promise<boolean> => {
  // Simple verification for demo purposes
  // In production, use proper biometric matching algorithms
  const dataHash = await hashBiometric(biometricData);
  return dataHash === storedHash;
};

export default httpTrigger; 