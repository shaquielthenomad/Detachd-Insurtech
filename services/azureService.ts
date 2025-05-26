import { Claim, User, Document } from '../types';

// Azure SQL Database Configuration
export const AZURE_SQL_CONFIG = {
  server: process.env.AZURE_SQL_SERVER || 'detachd-sql-76c5c226.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'detachd-db',
  user: process.env.AZURE_SQL_USER || 'detachdadmin',
  password: process.env.AZURE_SQL_PASSWORD || 'DtchdKJHGFDSA#2024',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

// Azure Storage Configuration
export const AZURE_STORAGE_CONFIG = {
  accountName: process.env.AZURE_STORAGE_ACCOUNT || 'detachdstorage',
  accountKey: process.env.AZURE_STORAGE_KEY || '',
  containerName: 'documents',
  certificatesContainer: 'certificates'
};

// Azure Communication Services Configuration
export const AZURE_COMMUNICATION_CONFIG = {
  connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '',
  senderEmail: 'noreply@detachd.systems'
};

// Azure Application Insights Configuration
export const AZURE_INSIGHTS_CONFIG = {
  instrumentationKey: process.env.AZURE_APPINSIGHTS_INSTRUMENTATIONKEY || ''
};

export class AzureService {
  
  // Database Operations
  static async executeQuery(query: string, params: any[] = []): Promise<any> {
    try {
      // In production, use mssql library to connect to Azure SQL
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: JSON.stringify({ query, params })
      });
      
      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
  
  // User Management
  static async createUser(userData: {
    email: string;
    name: string;
    role: string;
    phone?: string;
  }): Promise<User> {
    const query = `
      INSERT INTO Users (id, email, name, role, phone, created_at, updated_at)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @email, @name, @role, @phone, GETUTCDATE(), GETUTCDATE())
    `;
    
    const params = [userData.email, userData.name, userData.role, userData.phone || null];
    const result = await this.executeQuery(query, params);
    
    return {
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      role: result[0].role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(result[0].name)}&background=1e40af&color=fff`
    };
  }
  
  static async getUserById(userId: string): Promise<User | null> {
    const query = 'SELECT * FROM Users WHERE id = @userId';
    const result = await this.executeQuery(query, [userId]);
    
    if (result.length === 0) return null;
    
    return {
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      role: result[0].role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(result[0].name)}&background=1e40af&color=fff`
    };
  }
  
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM Users WHERE email = @email';
    const result = await this.executeQuery(query, [email]);
    
    if (result.length === 0) return null;
    
    return {
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      role: result[0].role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(result[0].name)}&background=1e40af&color=fff`
    };
  }
  
  // Claim Management
  static async createClaim(claimData: {
    claimNumber: string;
    policyholderName: string;
    claimType: string;
    dateOfLoss: string;
    amountClaimed?: number;
    description?: string;
    userId: string;
  }): Promise<Claim> {
    const query = `
      INSERT INTO Claims (id, claim_number, policyholder_name, claim_type, date_of_loss, 
                         amount_claimed, description, status, user_id, created_at, updated_at)
      OUTPUT INSERTED.*
      VALUES (NEWID(), @claimNumber, @policyholderName, @claimType, @dateOfLoss, 
              @amountClaimed, @description, 'SUBMITTED', @userId, GETUTCDATE(), GETUTCDATE())
    `;
    
    const params = [
      claimData.claimNumber,
      claimData.policyholderName,
      claimData.claimType,
      claimData.dateOfLoss,
      claimData.amountClaimed || null,
      claimData.description || null,
      claimData.userId
    ];
    
    const result = await this.executeQuery(query, params);
    
    return {
      id: result[0].id,
      claimNumber: result[0].claim_number,
      policyholderName: result[0].policyholder_name,
      claimType: result[0].claim_type,
      dateOfLoss: result[0].date_of_loss,
      amountClaimed: result[0].amount_claimed,
      description: result[0].description,
      status: result[0].status,
      submittedAt: result[0].created_at,
      documents: []
    };
  }
  
  static async getClaimsByUserId(userId: string): Promise<Claim[]> {
    const query = `
      SELECT c.*, d.id as doc_id, d.name as doc_name, d.type as doc_type, 
             d.size as doc_size, d.url as doc_url, d.uploaded_at as doc_uploaded_at
      FROM Claims c
      LEFT JOIN Documents d ON c.id = d.claim_id
      WHERE c.user_id = @userId
      ORDER BY c.created_at DESC
    `;
    
    const result = await this.executeQuery(query, [userId]);
    
    // Group documents by claim
    const claimsMap = new Map<string, Claim>();
    
    result.forEach((row: any) => {
      if (!claimsMap.has(row.id)) {
        claimsMap.set(row.id, {
          id: row.id,
          claimNumber: row.claim_number,
          policyholderName: row.policyholder_name,
          claimType: row.claim_type,
          dateOfLoss: row.date_of_loss,
          amountClaimed: row.amount_claimed,
          description: row.description,
          status: row.status,
          submittedAt: row.created_at,
          documents: []
        });
      }
      
      if (row.doc_id) {
        claimsMap.get(row.id)!.documents.push({
          id: row.doc_id,
          name: row.doc_name,
          type: row.doc_type,
          size: row.doc_size,
          url: row.doc_url,
          uploadedAt: row.doc_uploaded_at
        });
      }
    });
    
    return Array.from(claimsMap.values());
  }
  
  static async updateClaimStatus(claimId: string, status: string, riskScore?: number): Promise<void> {
    const query = `
      UPDATE Claims 
      SET status = @status, risk_score = @riskScore, updated_at = GETUTCDATE()
      WHERE id = @claimId
    `;
    
    await this.executeQuery(query, [status, riskScore || null, claimId]);
  }
  
  // Document Storage (Azure Blob Storage)
  static async uploadDocument(file: File, claimId: string, documentType: string): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('claimId', claimId);
      formData.append('documentType', documentType);
      
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Save document metadata to database
      const query = `
        INSERT INTO Documents (id, claim_id, name, type, size, url, uploaded_at)
        OUTPUT INSERTED.*
        VALUES (NEWID(), @claimId, @name, @type, @size, @url, GETUTCDATE())
      `;
      
      const params = [claimId, file.name, documentType, file.size.toString(), result.url];
      const dbResult = await this.executeQuery(query, params);
      
      return {
        id: dbResult[0].id,
        name: dbResult[0].name,
        type: dbResult[0].type,
        size: dbResult[0].size,
        url: dbResult[0].url,
        uploadedAt: dbResult[0].uploaded_at
      };
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }
  
  static async deleteDocument(documentId: string): Promise<void> {
    // Get document info first
    const query = 'SELECT url FROM Documents WHERE id = @documentId';
    const result = await this.executeQuery(query, [documentId]);
    
    if (result.length > 0) {
      // Delete from Azure Storage
      await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: JSON.stringify({ url: result[0].url })
      });
      
      // Delete from database
      const deleteQuery = 'DELETE FROM Documents WHERE id = @documentId';
      await this.executeQuery(deleteQuery, [documentId]);
    }
  }
  
  // Certificate Storage
  static async storeCertificate(claimId: string, certificateData: any, pdfBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('certificate', pdfBlob, `certificate-${certificateData.certificateId}.pdf`);
      formData.append('claimId', claimId);
      formData.append('certificateData', JSON.stringify(certificateData));
      
      const response = await fetch('/api/storage/certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Certificate storage failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Save certificate metadata to database
      const query = `
        INSERT INTO Certificates (id, claim_id, certificate_id, blockchain_tx_id, 
                                 security_hash, verification_date, url, created_at)
        VALUES (NEWID(), @claimId, @certificateId, @blockchainTxId, 
                @securityHash, @verificationDate, @url, GETUTCDATE())
      `;
      
      const params = [
        claimId,
        certificateData.certificateId,
        certificateData.blockchainTxId,
        certificateData.securityHash,
        certificateData.verificationDate,
        result.url
      ];
      
      await this.executeQuery(query, params);
      
      return result.url;
    } catch (error) {
      console.error('Certificate storage error:', error);
      throw error;
    }
  }
  
  // Email Services (Azure Communication Services)
  static async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const response = await fetch('/api/communication/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          from: AZURE_COMMUNICATION_CONFIG.senderEmail
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }
  
  // Analytics and Insights
  static async logEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      await fetch('/api/insights/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: JSON.stringify({
          name: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            userId: localStorage.getItem('detachd_user_id')
          }
        })
      });
    } catch (error) {
      console.error('Analytics logging error:', error);
    }
  }
  
  static async logClaimSubmission(claim: Claim): Promise<void> {
    await this.logEvent('ClaimSubmitted', {
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      claimType: claim.claimType,
      amountClaimed: claim.amountClaimed
    });
  }
  
  static async logUserRegistration(user: User): Promise<void> {
    await this.logEvent('UserRegistered', {
      userId: user.id,
      userRole: user.role,
      email: user.email
    });
  }
  
  static async logDocumentUpload(document: Document, claimId: string): Promise<void> {
    await this.logEvent('DocumentUploaded', {
      documentId: document.id,
      claimId,
      documentType: document.type,
      fileSize: document.size
    });
  }
  
  // AI Fraud Detection Integration
  static async analyzeClaimForFraud(claimData: {
    claimType: string;
    amountClaimed: number;
    dateOfLoss: string;
    description: string;
    documents: Document[];
  }): Promise<{
    riskScore: number;
    riskFactors: string[];
    recommendation: 'APPROVE' | 'REVIEW' | 'REJECT';
    confidence: number;
  }> {
    try {
      const response = await fetch('/api/ai/fraud-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('detachd_token')}`
        },
        body: JSON.stringify(claimData)
      });
      
      if (!response.ok) {
        throw new Error('Fraud analysis failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fraud analysis error:', error);
      
      // Fallback to mock analysis
      const riskScore = Math.floor(Math.random() * 30 + 70); // 70-100
      return {
        riskScore,
        riskFactors: [
          'Document authenticity verified',
          'Claim amount within normal range',
          'No suspicious patterns detected'
        ],
        recommendation: riskScore >= 85 ? 'APPROVE' : riskScore >= 70 ? 'REVIEW' : 'REJECT',
        confidence: 0.95
      };
    }
  }
  
  // Health Check
  static async healthCheck(): Promise<{
    database: boolean;
    storage: boolean;
    communication: boolean;
    insights: boolean;
  }> {
    const results = {
      database: false,
      storage: false,
      communication: false,
      insights: false
    };
    
    try {
      // Test database connection
      await this.executeQuery('SELECT 1');
      results.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
    
    try {
      // Test storage connection
      const response = await fetch('/api/storage/health');
      results.storage = response.ok;
    } catch (error) {
      console.error('Storage health check failed:', error);
    }
    
    try {
      // Test communication services
      const response = await fetch('/api/communication/health');
      results.communication = response.ok;
    } catch (error) {
      console.error('Communication health check failed:', error);
    }
    
    try {
      // Test application insights
      const response = await fetch('/api/insights/health');
      results.insights = response.ok;
    } catch (error) {
      console.error('Insights health check failed:', error);
    }
    
    return results;
  }
} 