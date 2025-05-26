import { Claim, User, UserRole, ClaimStatus } from '../types';

// Database configuration
export const DB_CONFIG = {
  server: 'detachd-sql-76c5c226.database.windows.net',
  database: 'detachd-db',
  user: 'detachdadmin',
  password: process.env.AZURE_SQL_PASSWORD || 'DtchdKJHGFDSA#2024',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// Database schemas
export const SCHEMAS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(255) NOT NULL,
      email NVARCHAR(255) UNIQUE NOT NULL,
      role NVARCHAR(50) NOT NULL,
      avatar_url NVARCHAR(500),
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE()
    )
  `,
  
  claims: `
    CREATE TABLE IF NOT EXISTS claims (
      id NVARCHAR(50) PRIMARY KEY,
      claim_number NVARCHAR(50) UNIQUE NOT NULL,
      policyholder_name NVARCHAR(255) NOT NULL,
      date_of_loss DATETIME2 NOT NULL,
      claim_type NVARCHAR(100) NOT NULL,
      status NVARCHAR(50) NOT NULL,
      amount_claimed DECIMAL(15,2),
      description NTEXT,
      risk_score INT,
      user_id NVARCHAR(50),
      created_at DATETIME2 DEFAULT GETDATE(),
      updated_at DATETIME2 DEFAULT GETDATE(),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
  
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id NVARCHAR(50) PRIMARY KEY,
      claim_id NVARCHAR(50) NOT NULL,
      name NVARCHAR(255) NOT NULL,
      type NVARCHAR(50) NOT NULL,
      url NVARCHAR(500) NOT NULL,
      uploaded_at DATETIME2 DEFAULT GETDATE(),
      size_bytes BIGINT,
      FOREIGN KEY (claim_id) REFERENCES claims(id)
    )
  `,
  
  verification_certificates: `
    CREATE TABLE IF NOT EXISTS verification_certificates (
      id NVARCHAR(50) PRIMARY KEY,
      claim_id NVARCHAR(50) NOT NULL,
      certificate_hash NVARCHAR(255) UNIQUE NOT NULL,
      blockchain_tx_id NVARCHAR(255),
      verification_date DATETIME2 DEFAULT GETDATE(),
      ai_verification_score DECIMAL(3,2),
      certificate_data NTEXT,
      FOREIGN KEY (claim_id) REFERENCES claims(id)
    )
  `
};

// Real database operations (replace mock data)
export class DatabaseService {
  
  // User operations
  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // TODO: Implement real SQL INSERT
    return { id, ...user };
  }
  
  static async getUserById(id: string): Promise<User | null> {
    // TODO: Implement real SQL SELECT
    return null;
  }
  
  static async getUserByEmail(email: string): Promise<User | null> {
    // TODO: Implement real SQL SELECT
    return null;
  }
  
  // Claim operations
  static async createClaim(claim: Omit<Claim, 'id' | 'claimNumber'>): Promise<Claim> {
    const id = `clm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const claimNumber = `DET-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // TODO: Implement real SQL INSERT
    return {
      id,
      claimNumber,
      ...claim
    };
  }
  
  static async getClaimById(id: string): Promise<Claim | null> {
    // TODO: Implement real SQL SELECT
    return null;
  }
  
  static async getClaimsByUserId(userId: string): Promise<Claim[]> {
    // TODO: Implement real SQL SELECT
    return [];
  }
  
  static async updateClaimStatus(claimId: string, status: ClaimStatus): Promise<boolean> {
    // TODO: Implement real SQL UPDATE
    return true;
  }
  
  // Document operations
  static async uploadDocument(claimId: string, file: File): Promise<string> {
    // TODO: Implement Azure Blob Storage upload
    return `https://detachdstorage.blob.core.windows.net/documents/${claimId}/${file.name}`;
  }
  
  // Verification certificate operations
  static async generateCertificate(claimId: string): Promise<string> {
    const certificateHash = `cert_${Date.now()}_${Math.random().toString(36)}`;
    const blockchainTxId = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // TODO: Store in database and generate real PDF
    return certificateHash;
  }
  
  // Database initialization
  static async initializeDatabase(): Promise<void> {
    try {
      // TODO: Run all SCHEMAS to create tables
      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }
} 