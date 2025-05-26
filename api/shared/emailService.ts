import { EmailClient } from '@azure/communication-email';
import { executeQuery } from './database';

const emailClient = new EmailClient(
  process.env.AZURE_COMMUNICATION_CONNECTION_STRING || ''
);

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(
  to: string,
  template: EmailTemplate,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<boolean> {
  try {
    const emailMessage = {
      senderAddress: 'support@detachd.systems',
      content: {
        subject: template.subject,
        html: template.htmlContent,
        plainText: template.textContent || template.subject,
      },
      recipients: {
        to: [{ address: to }],
      },
    };

    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    // Log email to database
    await logEmail(
      to,
      template.subject,
      'SENT',
      result.id,
      relatedEntityType,
      relatedEntityId
    );

    return result.status === 'Succeeded';
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Log failed email to database
    await logEmail(
      to,
      template.subject,
      'FAILED',
      null,
      relatedEntityType,
      relatedEntityId,
      error.message
    );
    
    return false;
  }
}

async function logEmail(
  recipientEmail: string,
  subject: string,
  status: string,
  azureMessageId?: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    await executeQuery(`
      INSERT INTO EmailLog (
        recipient_email, subject, status, azure_message_id, 
        related_entity_type, related_entity_id, error_message, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      recipientEmail,
      subject,
      status,
      azureMessageId,
      relatedEntityType,
      relatedEntityId,
      errorMessage,
      status === 'SENT' ? new Date() : null
    ]);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

export class EmailService {
  async sendClaimCreatedNotification(email: string, claimNumber: string): Promise<void> {
    const template = emailTemplates.claimSubmitted(claimNumber, 'General');
    await sendEmail(email, template, 'claim', claimNumber);
  }

  async sendClaimApprovedNotification(email: string, claimNumber: string): Promise<void> {
    const template = emailTemplates.claimApproved(claimNumber);
    await sendEmail(email, template, 'claim', claimNumber);
  }

  async sendUserApprovedNotification(email: string, name: string): Promise<void> {
    const template = emailTemplates.userApproved(name);
    await sendEmail(email, template, 'user', email);
  }

  async sendUserRejectedNotification(email: string, name: string): Promise<void> {
    const template = emailTemplates.userRejected(name);
    await sendEmail(email, template, 'user', email);
  }

  async sendAccessCodeEmail(email: string, accessCode: string, claimId: string): Promise<void> {
    const template = emailTemplates.accessCode(accessCode, claimId);
    await sendEmail(email, template, 'access_code', claimId);
  }
}

export const emailTemplates = {
  welcomeEmail: (name: string): EmailTemplate => ({
    subject: 'Welcome to Detachd - Your Account is Ready',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Detachd</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0;">AI-Powered Insurance Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Your Detachd account has been successfully created. You can now access our AI-powered 
            insurance platform to manage your policies, submit claims, and track everything in real-time.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/dashboard" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e293b; margin-top: 0;">What's Next?</h3>
            <ul style="color: #475569; line-height: 1.6;">
              <li>Complete your profile setup</li>
              <li>Upload your policy documents</li>
              <li>Explore our AI-powered claim submission</li>
              <li>Set up your notification preferences</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  claimApproved: (claimNumber: string): EmailTemplate => ({
    subject: `Claim ${claimNumber} Approved - Certificate Available`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Claim Approved</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Your claim has been approved</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Great News!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Your claim <strong>${claimNumber}</strong> has been approved. You can now generate your 
            blockchain-verified certificate for this claim.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/claims/${claimNumber}/certificate" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Generate Certificate
            </a>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  userApproved: (name: string): EmailTemplate => ({
    subject: 'Your Detachd Account Has Been Approved',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Approved</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Welcome to Detachd</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Your Detachd account has been approved by our admin team. You now have full access 
            to the platform and can begin using all available features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/dashboard" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  userRejected: (name: string): EmailTemplate => ({
    subject: 'Detachd Account Application Update',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Account application status</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in Detachd. After reviewing your application, we are unable 
            to approve your account at this time. Please contact our support team if you have any questions.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@detachd.systems" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Contact Support
            </a>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  accessCode: (accessCode: string, claimId: string): EmailTemplate => ({
    subject: 'Detachd Claim Access Code',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Claim Access Code</h1>
          <p style="color: #e9d5ff; margin: 10px 0 0 0;">Secure access to claim information</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Access Code Provided</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            You have been granted access to view claim information. Use the access code below to view the claim details.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0;">Access Code</h3>
            <div style="font-size: 24px; font-weight: bold; color: #7c3aed; letter-spacing: 2px;">${accessCode}</div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/claim-access?code=${accessCode}" 
               style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Claim
            </a>
          </div>
          
          <p style="color: #ef4444; font-size: 14px; text-align: center;">
            This access code expires in 72 hours for security reasons.
          </p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  claimSubmitted: (claimNumber: string, claimType: string): EmailTemplate => ({
    subject: `Claim ${claimNumber} Successfully Submitted`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Claim Submitted</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">We've received your claim</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Claim Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Claim Number:</strong> ${claimNumber}</p>
            <p style="margin: 10px 0 0 0;"><strong>Claim Type:</strong> ${claimType}</p>
            <p style="margin: 10px 0 0 0;"><strong>Status:</strong> Under Review</p>
          </div>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Your claim has been successfully submitted and is now being processed by our AI-powered 
            fraud detection system. You'll receive updates as your claim progresses.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/claims" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Track Claim Status
            </a>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetToken: string): EmailTemplate => ({
    subject: 'Reset Your Detachd Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">Secure your account</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password.
            This link will expire in 1 hour for security reasons.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://detachd.systems/reset-password?token=${resetToken}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this password reset, 
              please ignore this email or contact support if you have concerns.
            </p>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
            Founded 2021 | support@detachd.systems
          </p>
        </div>
      </div>
    `,
  }),
}; 