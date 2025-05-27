import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../shared/database';
import { sendEmail, emailTemplates } from '../shared/emailService';
import { verifyToken } from '../shared/auth';
import { DatabaseService } from "../shared/database";
import { EmailService } from "../shared/emailService";
import jwt from 'jsonwebtoken';

interface Claim {
  id: string;
  claim_number: string;
  policyholder_name: string;
  claim_type: string;
  date_of_loss: string;
  amount_claimed: number;
  description: string;
  status: string;
  risk_score: number;
  user_id: string;
  policy_number: string;
  incident_location: string;
  created_at: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token
const verifyTokenMiddleware = (req: AuthenticatedRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return true;
  } catch (error) {
    return false;
  }
};

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  
  // Verify authentication for protected routes
  if (!verifyTokenMiddleware(authReq)) {
    context.res = {
      status: 401,
      body: { error: 'Unauthorized' }
    };
    return;
  }

  const method = req.method;
  const segments = req.url?.split('/').filter(Boolean) || [];
  const claimId = segments[segments.indexOf('claims') + 1];
  const action = segments[segments.indexOf('claims') + 2];

  try {
    switch (method) {
      case 'GET':
        if (req.query.witness === '1') {
          await getWitnessClaims(context, authReq);
        } else if (claimId && !action) {
          // Get specific claim
          await getClaim(context, authReq, claimId);
        } else if (!claimId) {
          // Get all claims for user
          await getClaims(context, authReq);
        } else {
          context.res = { status: 404, body: { error: 'Endpoint not found' } };
        }
        break;

      case 'POST':
        if (!claimId) {
          if (action === 'join-by-code') {
            await joinClaimByCode(context, authReq);
          } else {
            // Create new claim
            await createClaim(context, authReq);
          }
        } else if (action === 'witness-statement') {
          await submitWitnessStatement(context, authReq, claimId);
        } else if (action === 'certificate') {
          // Generate certificate
          await generateCertificate(context, authReq, claimId);
        } else if (action === 'access-code') {
          // Generate third-party access code
          await generateAccessCode(context, authReq, claimId);
        } else if (action === 'approve') {
          // Approve claim (insurer only)
          await approveClaim(context, authReq, claimId);
        } else if (action === 'reject') {
          // Reject claim (insurer only)
          await rejectClaim(context, authReq, claimId);
        } else {
          context.res = { status: 404, body: { error: 'Endpoint not found' } };
        }
        break;

      case 'PUT':
        if (claimId) {
          // Update claim
          await updateClaim(context, authReq, claimId);
        } else {
          context.res = { status: 404, body: { error: 'Endpoint not found' } };
        }
        break;

      default:
        context.res = { status: 405, body: { error: 'Method not allowed' } };
    }
  } catch (error) {
    context.log.error('Claims API error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

const getClaims = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  
  try {
    const query = `
      SELECT c.*, u.name as policyholder_name, u.email as policyholder_email
      FROM claims c
      JOIN users u ON c.policyholder_id = u.id
      WHERE c.policyholder_id = @userId OR @userRole IN ('super_admin', 'insurer_party')
      ORDER BY c.created_at DESC
    `;
    
    const result = await db.query(query, [
      { name: 'userId', value: req.user!.id },
      { name: 'userRole', value: req.user!.role }
    ]);
    
    context.res = {
      status: 200,
      body: { claims: result.recordset }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const getClaim = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  const db = new DatabaseService();
  
  try {
    const query = `
      SELECT c.*, u.name as policyholder_name, u.email as policyholder_email,
             approver.name as approved_by_name
      FROM claims c
      JOIN users u ON c.policyholder_id = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE c.id = @claimId
    `;
    
    const result = await db.query(query, [
      { name: 'claimId', value: claimId }
    ]);
    
    if (result.recordset.length === 0) {
      context.res = { status: 404, body: { error: 'Claim not found' } };
      return;
    }
    
    const claim = result.recordset[0];
    
    // Check access permissions
    if (claim.policyholder_id !== req.user!.id && 
        !['super_admin', 'insurer_party'].includes(req.user!.role)) {
      context.res = { status: 403, body: { error: 'Access denied' } };
      return;
    }
    
    context.res = {
      status: 200,
      body: { claim }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const createClaim = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  const { incidentDate, location, description, policyNumber, claimType } = req.body;
  
  try {
    const claimNumber = `CLM-${Date.now().toString().slice(-8)}`;
    
    const query = `
      INSERT INTO claims (
        claim_number, policyholder_id, incident_date, location, 
        description, policy_number, claim_type, status, created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @claimNumber, @policyholderID, @incidentDate, @location,
        @description, @policyNumber, @claimType, 'pending', GETDATE()
      )
    `;
    
    const result = await db.query(query, [
      { name: 'claimNumber', value: claimNumber },
      { name: 'policyholderID', value: req.user!.id },
      { name: 'incidentDate', value: incidentDate },
      { name: 'location', value: location },
      { name: 'description', value: description },
      { name: 'policyNumber', value: policyNumber },
      { name: 'claimType', value: claimType }
    ]);
    
    const newClaimId = result.recordset[0].id;
    
    // Send notification email
    const emailService = new EmailService();
    await emailService.sendClaimCreatedNotification(req.user!.email, claimNumber);
    
    context.res = {
      status: 201,
      body: { 
        message: 'Claim created successfully',
        claimId: newClaimId,
        claimNumber 
      }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const generateCertificate = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  const db = new DatabaseService();
  
  try {
    // Check if claim is approved
    const claimQuery = `
      SELECT status, claim_number FROM claims 
      WHERE id = @claimId AND status = 'approved'
    `;
    
    const claimResult = await db.query(claimQuery, [
      { name: 'claimId', value: claimId }
    ]);
    
    if (claimResult.recordset.length === 0) {
      context.res = { 
        status: 400, 
        body: { error: 'Certificate can only be generated for approved claims' } 
      };
      return;
    }
    
    // Generate certificate hash and blockchain transaction ID
    const certificateHash = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const blockchainTxId = `0x${Math.random().toString(16).substr(2, 16)}`;
    
    // Update claim with certificate info
    const updateQuery = `
      UPDATE claims 
      SET certificate_hash = @certificateHash, 
          blockchain_tx_id = @blockchainTxId,
          certificate_generated_at = GETDATE()
      WHERE id = @claimId
    `;
    
    await db.query(updateQuery, [
      { name: 'certificateHash', value: certificateHash },
      { name: 'blockchainTxId', value: blockchainTxId },
      { name: 'claimId', value: claimId }
    ]);
    
    context.res = {
      status: 200,
      body: { 
        hash: certificateHash,
        txId: blockchainTxId,
        message: 'Certificate generated successfully'
      }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const generateAccessCode = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  const db = new DatabaseService();
  const { recipientEmail, recipientType, expiresInHours = 72 } = req.body;
  
  try {
    // Generate access code
    const accessCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    
    const query = `
      INSERT INTO third_party_access_codes (
        claim_id, access_code, recipient_email, recipient_type, 
        expires_at, created_by, created_at
      )
      VALUES (
        @claimId, @accessCode, @recipientEmail, @recipientType,
        @expiresAt, @createdBy, GETDATE()
      )
    `;
    
    await db.query(query, [
      { name: 'claimId', value: claimId },
      { name: 'accessCode', value: accessCode },
      { name: 'recipientEmail', value: recipientEmail },
      { name: 'recipientType', value: recipientType },
      { name: 'expiresAt', value: expiresAt },
      { name: 'createdBy', value: req.user!.id }
    ]);
    
    // Send access code email
    const emailService = new EmailService();
    await emailService.sendAccessCodeEmail(recipientEmail, accessCode, claimId);
    
    context.res = {
      status: 200,
      body: { 
        message: 'Access code generated and sent successfully',
        accessCode,
        expiresAt
      }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const approveClaim = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  if (!['super_admin', 'insurer_party'].includes(req.user!.role)) {
    context.res = { status: 403, body: { error: 'Insufficient permissions' } };
    return;
  }
  
  const db = new DatabaseService();
  const { notes } = req.body;
  
  try {
    const query = `
      UPDATE claims 
      SET status = 'approved', 
          approved_by = @approvedBy,
          approved_at = GETDATE(),
          approval_notes = @notes
      WHERE id = @claimId
    `;
    
    await db.query(query, [
      { name: 'approvedBy', value: req.user!.id },
      { name: 'notes', value: notes || '' },
      { name: 'claimId', value: claimId }
    ]);
    
    // Get claim details for notification
    const claimQuery = `
      SELECT c.claim_number, u.email as policyholder_email
      FROM claims c
      JOIN users u ON c.policyholder_id = u.id
      WHERE c.id = @claimId
    `;
    
    const claimResult = await db.query(claimQuery, [
      { name: 'claimId', value: claimId }
    ]);
    
    if (claimResult.recordset.length > 0) {
      const claim = claimResult.recordset[0];
      const emailService = new EmailService();
      await emailService.sendClaimApprovedNotification(
        claim.policyholder_email, 
        claim.claim_number
      );
    }
    
    context.res = {
      status: 200,
      body: { message: 'Claim approved successfully' }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const rejectClaim = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  if (!['super_admin', 'insurer_party'].includes(req.user!.role)) {
    context.res = { status: 403, body: { error: 'Insufficient permissions' } };
    return;
  }
  
  const db = new DatabaseService();
  const { reason } = req.body;
  
  try {
    const query = `
      UPDATE claims 
      SET status = 'rejected', 
          rejected_by = @rejectedBy,
          rejected_at = GETDATE(),
          rejection_reason = @reason
      WHERE id = @claimId
    `;
    
    await db.query(query, [
      { name: 'rejectedBy', value: req.user!.id },
      { name: 'reason', value: reason || '' },
      { name: 'claimId', value: claimId }
    ]);
    
    context.res = {
      status: 200,
      body: { message: 'Claim rejected successfully' }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const updateClaim = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  const db = new DatabaseService();
  const updates = req.body;
  
  try {
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    const query = `
      UPDATE claims 
      SET ${setClause}, updated_at = GETDATE()
      WHERE id = @claimId AND policyholder_id = @userId
    `;
    
    const parameters = [
      { name: 'claimId', value: claimId },
      { name: 'userId', value: req.user!.id },
      ...Object.entries(updates).map(([key, value]) => ({ name: key, value }))
    ];
    
    await db.query(query, parameters);
    
    context.res = {
      status: 200,
      body: { message: 'Claim updated successfully' }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

function calculateRiskScore(data: any): number {
  let score = 0;

  // Amount-based risk
  if (data.amountClaimed > 100000) score += 30;
  else if (data.amountClaimed > 50000) score += 20;
  else if (data.amountClaimed > 20000) score += 10;

  // Claim type risk
  const highRiskTypes = ['theft', 'fire', 'flood'];
  if (highRiskTypes.some(type => data.claimType.toLowerCase().includes(type))) {
    score += 25;
  }

  // Description analysis (simplified)
  const suspiciousWords = ['urgent', 'emergency', 'total loss', 'stolen'];
  const suspiciousCount = suspiciousWords.filter(word => 
    data.description.toLowerCase().includes(word)
  ).length;
  score += suspiciousCount * 10;

  // User history
  if (data.userHistory.recentClaims > 2) score += 20;
  if (data.userHistory.rejectedClaims > 0) score += 15;

  return Math.min(score, 100);
}

function generateRiskFactors(riskScore: number): string[] {
  const factors = [];
  
  if (riskScore > 70) {
    factors.push('High claim amount', 'Multiple recent claims', 'Suspicious timing');
  } else if (riskScore > 40) {
    factors.push('Moderate claim amount', 'Standard risk profile');
  } else {
    factors.push('Low risk profile', 'Standard claim amount');
  }

  return factors;
}

async function getUserClaimHistory(userId: string): Promise<any> {
  const recentClaims = await executeQuery(
    'SELECT COUNT(*) as count FROM Claims WHERE user_id = ? AND created_at > DATEADD(month, -6, GETUTCDATE())',
    [userId]
  );

  const rejectedClaims = await executeQuery(
    'SELECT COUNT(*) as count FROM Claims WHERE user_id = ? AND status = \'REJECTED\'',
    [userId]
  );

  return {
    recentClaims: recentClaims[0]?.count || 0,
    rejectedClaims: rejectedClaims[0]?.count || 0
  };
}

// Add: Get claims for witness
const getWitnessClaims = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  try {
    // Find claims where this user is a witness (assume witness_claims table or similar)
    const query = `
      SELECT c.* FROM claims c
      JOIN third_party_access_codes tpa ON tpa.claim_id = c.id
      WHERE tpa.recipient_email = @email AND tpa.recipient_type = 'witness'
    `;
    const result = await db.query(query, [
      { name: 'email', value: req.user!.email }
    ]);
    context.res = {
      status: 200,
      body: { claims: result.recordset }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

// Add: Witness statement submission
const submitWitnessStatement = async (context: Context, req: AuthenticatedRequest, claimId: string) => {
  const db = new DatabaseService();
  const { statement } = req.body;
  try {
    const query = `
      INSERT INTO witness_statements (claim_id, witness_email, statement, created_at)
      VALUES (@claimId, @witnessEmail, @statement, GETDATE())
    `;
    await db.query(query, [
      { name: 'claimId', value: claimId },
      { name: 'witnessEmail', value: req.user!.email },
      { name: 'statement', value: statement }
    ]);
    context.res = { status: 200, body: { message: 'Statement submitted' } };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

// Add: Medical pro join by code
const joinClaimByCode = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  const { code } = req.body;
  try {
    // Find claim by code
    const codeQuery = `SELECT claim_id FROM third_party_access_codes WHERE access_code = @code AND recipient_type = 'medical_professional' AND expires_at > GETDATE()`;
    const codeResult = await db.query(codeQuery, [ { name: 'code', value: code } ]);
    if (codeResult.recordset.length === 0) {
      context.res = { status: 404, body: { error: 'Invalid or expired code' } };
      return;
    }
    const claimId = codeResult.recordset[0].claim_id;
    // Add this user as a medical professional on the claim (assume a join table)
    await db.query(
      `INSERT INTO claim_medical_professionals (claim_id, email, joined_at) VALUES (@claimId, @email, GETDATE())`,
      [ { name: 'claimId', value: claimId }, { name: 'email', value: req.user!.email } ]
    );
    // Return claim info
    const claimResult = await db.query('SELECT * FROM claims WHERE id = @claimId', [ { name: 'claimId', value: claimId } ]);
    context.res = { status: 200, body: { claim: claimResult.recordset[0] } };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

export default httpTrigger; 