import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { DatabaseService } from '../shared/database';
import { EmailService } from '../shared/emailService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token and super admin role
const verifyAdminToken = (req: AuthenticatedRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return req.user.role === 'super_admin';
  } catch (error) {
    return false;
  }
};

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  
  // Verify authentication and super admin role
  if (!verifyAdminToken(authReq)) {
    context.res = {
      status: 403,
      body: { error: 'Super Admin access required' }
    };
    return;
  }

  const method = req.method;
  const segments = req.url?.split('/').filter(Boolean) || [];
  const action = segments[segments.indexOf('admin') + 1];
  const id = segments[segments.indexOf('admin') + 2];

  try {
    switch (action) {
      case 'stats':
        if (method === 'GET') {
          await handleGetStats(context, authReq);
        }
        break;
      case 'pending-approvals':
        if (method === 'GET') {
          await handleGetPendingApprovals(context, authReq);
        }
        break;
      case 'approve-user':
        if (method === 'POST' && id) {
          await handleApproveUser(context, authReq, id);
        }
        break;
      case 'settings':
        if (method === 'GET') {
          await handleGetSettings(context, authReq);
        } else if (method === 'PUT' && id) {
          await handleUpdateSetting(context, authReq, id);
        }
        break;
      case 'users':
        if (method === 'GET') {
          await handleGetUsers(context, authReq);
        }
        break;
      case 'claims':
        if (method === 'GET') {
          await handleGetAllClaims(context, authReq);
        }
        break;
      case 'audit':
        if (method === 'GET') {
          await handleGetAuditLog(context, authReq);
        }
        break;
      default:
        context.res = {
          status: 404,
          body: { error: 'Endpoint not found' }
        };
    }
  } catch (error) {
    context.log.error('Admin API Error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  }
};

const handleGetStats = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  
  try {
    // Get total users
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users', []);
    const totalUsers = usersResult.recordset[0].total;

    // Get pending approvals
    const pendingResult = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE approval_status = @status',
      [{ name: 'status', value: 'pending' }]
    );
    const pendingApprovals = pendingResult.recordset[0].total;

    // Get active claims
    const activeClaimsResult = await db.query(
      'SELECT COUNT(*) as total FROM claims WHERE status IN (@status1, @status2)',
      [
        { name: 'status1', value: 'pending' },
        { name: 'status2', value: 'under_review' }
      ]
    );
    const activeClaims = activeClaimsResult.recordset[0].total;

    // Get total claims
    const totalClaimsResult = await db.query('SELECT COUNT(*) as total FROM claims', []);
    const totalClaims = totalClaimsResult.recordset[0].total;

    // Get fraud detected (high risk claims)
    const fraudResult = await db.query(
      'SELECT COUNT(*) as total FROM claims WHERE risk_score > @threshold AND created_at >= DATEADD(month, -1, GETDATE())',
      [{ name: 'threshold', value: 70 }]
    );
    const fraudDetected = fraudResult.recordset[0].total;

    // System health check (simplified)
    const systemHealth = totalUsers > 0 && activeClaims < 1000 ? 'HEALTHY' : 'WARNING';

    context.res = {
      status: 200,
      body: {
        totalUsers,
        pendingApprovals,
        activeClaims,
        totalClaims,
        fraudDetected,
        systemHealth
      }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleGetPendingApprovals = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  
  try {
    const query = `
      SELECT id, name, email, role, approval_status, created_at, 
             license_number, professional_verification_status
      FROM users 
      WHERE approval_status = @status
      ORDER BY created_at ASC
    `;
    
    const result = await db.query(query, [
      { name: 'status', value: 'pending' }
    ]);
    
    context.res = {
      status: 200,
      body: { approvals: result.recordset }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleApproveUser = async (context: Context, req: AuthenticatedRequest, userId: string) => {
  const db = new DatabaseService();
  const { action } = req.body; // 'APPROVE' or 'REJECT'
  
  try {
    const newStatus = action === 'APPROVE' ? 'approved' : 'rejected';
    
    const query = `
      UPDATE users 
      SET approval_status = @status,
          approved_by = @approvedBy,
          approved_at = GETDATE()
      WHERE id = @userId
    `;
    
    await db.query(query, [
      { name: 'status', value: newStatus },
      { name: 'approvedBy', value: req.user!.id },
      { name: 'userId', value: userId }
    ]);

    // Get user details for notification
    const userQuery = 'SELECT email, name FROM users WHERE id = @userId';
    const userResult = await db.query(userQuery, [
      { name: 'userId', value: userId }
    ]);

    if (userResult.recordset.length > 0) {
      const user = userResult.recordset[0];
      const emailService = new EmailService();
      
      if (action === 'APPROVE') {
        await emailService.sendUserApprovedNotification(user.email, user.name);
      } else {
        await emailService.sendUserRejectedNotification(user.email, user.name);
      }
    }

    context.res = {
      status: 200,
      body: { message: `User ${action.toLowerCase()}d successfully` }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleGetSettings = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  
  try {
    const query = `
      SELECT id, setting_key, setting_value, setting_type, description, is_public
      FROM system_settings 
      ORDER BY setting_key
    `;
    
    const result = await db.query(query, []);
    
    context.res = {
      status: 200,
      body: { settings: result.recordset }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleUpdateSetting = async (context: Context, req: AuthenticatedRequest, settingKey: string) => {
  const db = new DatabaseService();
  const { value } = req.body;
  
  try {
    const query = `
      UPDATE system_settings 
      SET setting_value = @value,
          updated_by = @updatedBy,
          updated_at = GETDATE()
      WHERE setting_key = @settingKey
    `;
    
    await db.query(query, [
      { name: 'value', value: value },
      { name: 'updatedBy', value: req.user!.id },
      { name: 'settingKey', value: settingKey }
    ]);

    // Log the setting change
    const auditQuery = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
      VALUES (@userId, @action, @entityType, @entityId, @details, GETDATE())
    `;
    
    await db.query(auditQuery, [
      { name: 'userId', value: req.user!.id },
      { name: 'action', value: 'UPDATE_SETTING' },
      { name: 'entityType', value: 'system_settings' },
      { name: 'entityId', value: settingKey },
      { name: 'details', value: JSON.stringify({ old_value: 'previous', new_value: value }) }
    ]);

    context.res = {
      status: 200,
      body: { message: 'Setting updated successfully' }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleGetUsers = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  const { page = 1, limit = 50, role, status } = req.query;
  
  try {
    let query = `
      SELECT id, name, email, role, approval_status, created_at, last_login,
             phone, license_number, professional_verification_status
      FROM users 
      WHERE 1=1
    `;
    
    const parameters: any[] = [];
    
    if (role) {
      query += ' AND role = @role';
      parameters.push({ name: 'role', value: role });
    }
    
    if (status) {
      query += ' AND approval_status = @status';
      parameters.push({ name: 'status', value: status });
    }
    
    query += ' ORDER BY created_at DESC';
    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    parameters.push(
      { name: 'offset', value: (parseInt(page as string) - 1) * parseInt(limit as string) },
      { name: 'limit', value: parseInt(limit as string) }
    );
    
    const result = await db.query(query, parameters);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams: any[] = [];
    
    if (role) {
      countQuery += ' AND role = @role';
      countParams.push({ name: 'role', value: role });
    }
    
    if (status) {
      countQuery += ' AND approval_status = @status';
      countParams.push({ name: 'status', value: status });
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = countResult.recordset[0].total;
    
    context.res = {
      status: 200,
      body: { 
        users: result.recordset,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

const handleGetAllClaims = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  const { page = 1, limit = 50, status, risk_level } = req.query;
  
  try {
    let query = `
      SELECT c.*, u.name as policyholder_name, u.email as policyholder_email,
             approver.name as approved_by_name
      FROM claims c
      JOIN users u ON c.policyholder_id = u.id
      LEFT JOIN users approver ON c.approved_by = approver.id
      WHERE 1=1
    `;
    
    const parameters: any[] = [];
    
    if (status) {
      query += ' AND c.status = @status';
      parameters.push({ name: 'status', value: status });
    }
    
    if (risk_level === 'high') {
      query += ' AND c.risk_score > @highRisk';
      parameters.push({ name: 'highRisk', value: 70 });
    } else if (risk_level === 'medium') {
      query += ' AND c.risk_score BETWEEN @mediumLow AND @mediumHigh';
      parameters.push(
        { name: 'mediumLow', value: 40 },
        { name: 'mediumHigh', value: 70 }
      );
    } else if (risk_level === 'low') {
      query += ' AND c.risk_score < @lowRisk';
      parameters.push({ name: 'lowRisk', value: 40 });
    }
    
    query += ' ORDER BY c.created_at DESC';
    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    parameters.push(
      { name: 'offset', value: (parseInt(page as string) - 1) * parseInt(limit as string) },
      { name: 'limit', value: parseInt(limit as string) }
    );
    
    const result = await db.query(query, parameters);
    
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

const handleGetAuditLog = async (context: Context, req: AuthenticatedRequest) => {
  const db = new DatabaseService();
  const { page = 1, limit = 100, action, entity_type } = req.query;
  
  try {
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    
    const parameters: any[] = [];
    
    if (action) {
      query += ' AND a.action = @action';
      parameters.push({ name: 'action', value: action });
    }
    
    if (entity_type) {
      query += ' AND a.entity_type = @entityType';
      parameters.push({ name: 'entityType', value: entity_type });
    }
    
    query += ' ORDER BY a.created_at DESC';
    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    
    parameters.push(
      { name: 'offset', value: (parseInt(page as string) - 1) * parseInt(limit as string) },
      { name: 'limit', value: parseInt(limit as string) }
    );
    
    const result = await db.query(query, parameters);
    
    context.res = {
      status: 200,
      body: { logs: result.recordset }
    };
  } catch (error) {
    throw error;
  } finally {
    await db.close();
  }
};

export default httpTrigger; 