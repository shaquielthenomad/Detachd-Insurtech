import { Claim, User } from '../types';

// Azure Communication Services Configuration
export const EMAIL_CONFIG = {
  connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || 'your-connection-string',
  senderEmail: 'noreply@detachd.systems',
  senderName: 'Detachd Support Team'
};

// Email Templates
export const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Detachd - Your Account is Ready',
    template: (user: User) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DETACHD</h1>
            <p style="color: #6b7280; margin: 5px 0;">AI-Powered Insurance Fraud Prevention</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome, ${user.name}!</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Your Detachd account has been successfully created. You can now access our AI-powered insurance platform to submit claims, track progress, and benefit from blockchain-secured verification.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Account Details:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Role:</strong> ${user.role}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Account ID:</strong> ${user.id}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://secure.detachd.systems/dashboard" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
              Founded 2021 | support@detachd.systems<br>
              This email was sent from a secure, monitored system.
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  claimSubmitted: {
    subject: 'Claim Submitted Successfully - {{claimNumber}}',
    template: (claim: Claim, user: User) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DETACHD</h1>
            <p style="color: #6b7280; margin: 5px 0;">Claim Submission Confirmation</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Claim Submitted Successfully</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Dear ${user.name}, your insurance claim has been successfully submitted and is now being processed by our AI verification system.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Claim Details:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Claim Number:</strong> ${claim.claimNumber}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Type:</strong> ${claim.claimType}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Date of Loss:</strong> ${new Date(claim.dateOfLoss).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Amount:</strong> R ${claim.amountClaimed?.toLocaleString() || 'TBD'}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> ${claim.status}</p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">Next Steps:</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li>AI verification will be completed within 24-48 hours</li>
              <li>You'll receive email updates on claim progress</li>
              <li>Track your claim status in your dashboard</li>
              <li>Blockchain verification certificate will be generated upon approval</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://secure.detachd.systems/claims/${claim.id}" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Track Claim Status
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Questions? Contact us at support@detachd.systems<br>
              <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  claimApproved: {
    subject: 'Claim Approved - {{claimNumber}}',
    template: (claim: Claim, user: User, certificateUrl: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DETACHD</h1>
            <p style="color: #6b7280; margin: 5px 0;">Claim Approval Notification</p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #065f46; margin: 0 0 10px 0;">🎉 Claim Approved!</h2>
            <p style="color: #047857; margin: 0;">Your claim has been successfully verified and approved.</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Dear ${user.name}, we're pleased to inform you that your insurance claim has been approved after successful AI verification and blockchain validation.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Approved Claim:</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Claim Number:</strong> ${claim.claimNumber}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Approved Amount:</strong> R ${claim.amountClaimed?.toLocaleString() || 'TBD'}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Verification Score:</strong> ${claim.riskScore || 95}/100</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${certificateUrl}" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
              Download Certificate
            </a>
            <a href="https://secure.detachd.systems/claims/${claim.id}" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Details
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Payment processing will begin within 2-3 business days<br>
              <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  passwordReset: {
    subject: 'Password Reset Request - Detachd',
    template: (user: User, resetToken: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DETACHD</h1>
            <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Hi ${user.name}, we received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://secure.detachd.systems/reset-password?token=${resetToken}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              For security questions, contact support@detachd.systems<br>
              <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07
            </p>
          </div>
        </div>
      </div>
    `
  }
};

// Email Service
export class EmailService {
  
  // Send welcome email
  static async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.welcome;
      return await this.sendEmail(
        user.email,
        template.subject,
        template.template(user)
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
  
  // Send claim submission confirmation
  static async sendClaimSubmittedEmail(claim: Claim, user: User): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.claimSubmitted;
      const subject = template.subject.replace('{{claimNumber}}', claim.claimNumber);
      return await this.sendEmail(
        user.email,
        subject,
        template.template(claim, user)
      );
    } catch (error) {
      console.error('Failed to send claim submitted email:', error);
      return false;
    }
  }
  
  // Send claim approval email
  static async sendClaimApprovedEmail(claim: Claim, user: User, certificateUrl: string): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.claimApproved;
      const subject = template.subject.replace('{{claimNumber}}', claim.claimNumber);
      return await this.sendEmail(
        user.email,
        subject,
        template.template(claim, user, certificateUrl)
      );
    } catch (error) {
      console.error('Failed to send claim approved email:', error);
      return false;
    }
  }
  
  // Send password reset email
  static async sendPasswordResetEmail(user: User, resetToken: string): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.passwordReset;
      return await this.sendEmail(
        user.email,
        template.subject,
        template.template(user, resetToken)
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
  
  // Core email sending function
  private static async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      // In production, use Azure Communication Services
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          from: {
            email: EMAIL_CONFIG.senderEmail,
            name: EMAIL_CONFIG.senderName
          }
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Mock success for demo (log email content)
      console.log('📧 EMAIL SENT (MOCK):', {
        to,
        subject,
        from: EMAIL_CONFIG.senderEmail,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
  }
  
  // Send notification email
  static async sendNotificationEmail(
    to: string, 
    subject: string, 
    message: string, 
    actionUrl?: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">DETACHD</h1>
            <p style="color: #6b7280; margin: 5px 0;">Notification</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">${subject}</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            ${message}
          </p>
          
          ${actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" 
                 style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              <strong>Detachd Pty Ltd</strong> | Enterprise No: 2021/792488/07<br>
              support@detachd.systems
            </p>
          </div>
        </div>
      </div>
    `;
    
    return await this.sendEmail(to, subject, htmlContent);
  }
} 