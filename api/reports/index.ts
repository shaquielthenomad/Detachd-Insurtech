import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { DatabaseService } from '../shared/database';
import jwt from 'jsonwebtoken';
import { Parser as Json2CsvParser } from 'json2csv';
import PDFDocument from 'pdfkit';
import stream from 'stream';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token and role
const verifyAdminToken = (req: AuthenticatedRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    return ['super_admin', 'insurer_admin'].includes(req.user.role);
  } catch (error) {
    return false;
  }
};

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  if (!verifyAdminToken(authReq)) {
    context.res = {
      status: 403,
      body: { error: 'Admin access required' }
    };
    return;
  }

  const { format = 'csv', status, from, to } = req.query;
  const db = new DatabaseService();

  try {
    // Build query
    let query = `SELECT c.*, u.name as policyholder_name, u.email as policyholder_email FROM claims c JOIN users u ON c.policyholder_id = u.id WHERE 1=1`;
    const params: any[] = [];
    if (status) {
      query += ' AND c.status = @status';
      params.push({ name: 'status', value: status });
    }
    if (from) {
      query += ' AND c.created_at >= @from';
      params.push({ name: 'from', value: from });
    }
    if (to) {
      query += ' AND c.created_at <= @to';
      params.push({ name: 'to', value: to });
    }
    query += ' ORDER BY c.created_at DESC';
    const result = await db.query(query, params);
    const claims = result.recordset;

    if (format === 'csv') {
      // CSV export
      const fields = [
        'id', 'claim_number', 'policyholder_name', 'policyholder_email', 'claim_type', 'status', 'amount_claimed', 'description', 'created_at', 'approved_at', 'rejected_at', 'risk_score'
      ];
      const opts = { fields };
      const parser = new Json2CsvParser(opts);
      const csv = parser.parse(claims);
      context.res = {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="claims-report.csv"'
        },
        body: csv
      };
      return;
    } else if (format === 'pdf') {
      // PDF export
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        context.res = {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="claims-report.pdf"'
          },
          body: pdfData
        };
      });
      // Title
      doc.fontSize(18).text('Claims Report', { align: 'center' });
      doc.moveDown();
      // Table header
      doc.fontSize(12).text('Claim Number', 30, doc.y, { continued: true, width: 100 });
      doc.text('Policyholder', 140, doc.y, { continued: true, width: 120 });
      doc.text('Type', 260, doc.y, { continued: true, width: 60 });
      doc.text('Status', 320, doc.y, { continued: true, width: 60 });
      doc.text('Amount', 380, doc.y, { continued: true, width: 60 });
      doc.text('Created', 440, doc.y, { width: 100 });
      doc.moveDown(0.5);
      doc.moveTo(30, doc.y).lineTo(540, doc.y).stroke();
      // Table rows
      claims.forEach((c: any) => {
        doc.fontSize(10).text(c.claim_number, 30, doc.y, { continued: true, width: 100 });
        doc.text(c.policyholder_name, 140, doc.y, { continued: true, width: 120 });
        doc.text(c.claim_type, 260, doc.y, { continued: true, width: 60 });
        doc.text(c.status, 320, doc.y, { continued: true, width: 60 });
        doc.text(c.amount_claimed ? `R${c.amount_claimed}` : '', 380, doc.y, { continued: true, width: 60 });
        doc.text(new Date(c.created_at).toLocaleDateString(), 440, doc.y, { width: 100 });
      });
      doc.end();
      return;
    } else {
      context.res = {
        status: 400,
        body: { error: 'Invalid format. Use csv or pdf.' }
      };
      return;
    }
  } catch (error) {
    context.log.error('Report export error:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error' }
    };
  } finally {
    await db.close();
  }
};

export default httpTrigger; 