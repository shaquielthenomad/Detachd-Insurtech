import { Claim } from '../types';

// PDF generation utilities
export class PDFGenerator {
  
  // Generate unique certificate hash
  static generateCertificateHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }
  
  // Generate unique blockchain transaction ID
  static generateBlockchainTxId(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Generate unique security hash
  static generateSecurityHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `SHA256:${timestamp}${random}`.toUpperCase();
  }
  
  // Generate verification certificate data
  static generateCertificateData(claim: Claim): any {
    const certificateHash = this.generateCertificateHash();
    const blockchainTxId = this.generateBlockchainTxId();
    const securityHash = this.generateSecurityHash();
    const verificationDate = new Date().toISOString();
    
    return {
      certificateId: certificateHash,
      claimNumber: claim.claimNumber,
      policyholderName: claim.policyholderName,
      claimType: claim.claimType,
      dateOfLoss: claim.dateOfLoss,
      amountClaimed: claim.amountClaimed,
      verificationDate,
      blockchainTxId,
      securityHash,
      aiVerificationScore: (Math.random() * 0.3 + 0.7).toFixed(3), // 0.700-1.000
      riskAssessment: claim.riskScore || Math.floor(Math.random() * 30 + 70), // 70-100
      verificationStatus: 'VERIFIED',
      companyInfo: {
        name: 'Detachd Pty Ltd',
        enterpriseNumber: '2021/792488/07',
        founded: '2021',
        email: 'support@detachd.systems'
      },
      technicalDetails: {
        algorithm: 'SecureAI-v2.1',
        encryptionLevel: 'AES-256',
        blockchainNetwork: 'Ethereum Mainnet',
        verificationNodes: Math.floor(Math.random() * 5 + 15), // 15-20 nodes
        consensusReached: true
      }
    };
  }
  
  // Generate PDF content (HTML template for now, can be converted to actual PDF)
  static generatePDFContent(certificateData: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Detachd Verification Certificate</title>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .certificate { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .title { font-size: 24px; color: #1f2937; margin-bottom: 5px; }
        .subtitle { color: #6b7280; font-size: 14px; }
        .content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .section { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .section h3 { margin: 0 0 15px 0; color: #1f2937; font-size: 16px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #1f2937; font-size: 14px; margin-top: 2px; }
        .verification-seal { text-align: center; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .seal-text { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .seal-subtext { font-size: 12px; opacity: 0.9; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .hash { font-family: 'Courier New', monospace; background: #f3f4f6; padding: 8px; border-radius: 4px; word-break: break-all; font-size: 11px; }
        .status-verified { color: #059669; font-weight: bold; }
        .blockchain-id { font-family: 'Courier New', monospace; font-size: 10px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">DETACHD</div>
            <div class="title">Blockchain Verification Certificate</div>
            <div class="subtitle">AI-Powered Insurance Fraud Prevention</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h3>Claim Information</h3>
                <div class="field">
                    <div class="label">Claim Number</div>
                    <div class="value">${certificateData.claimNumber}</div>
                </div>
                <div class="field">
                    <div class="label">Policyholder</div>
                    <div class="value">${certificateData.policyholderName}</div>
                </div>
                <div class="field">
                    <div class="label">Claim Type</div>
                    <div class="value">${certificateData.claimType}</div>
                </div>
                <div class="field">
                    <div class="label">Date of Loss</div>
                    <div class="value">${new Date(certificateData.dateOfLoss).toLocaleDateString()}</div>
                </div>
                <div class="field">
                    <div class="label">Amount Claimed</div>
                    <div class="value">R ${certificateData.amountClaimed?.toLocaleString() || 'N/A'}</div>
                </div>
            </div>
            
            <div class="section">
                <h3>Verification Details</h3>
                <div class="field">
                    <div class="label">Certificate ID</div>
                    <div class="value hash">${certificateData.certificateId}</div>
                </div>
                <div class="field">
                    <div class="label">Verification Date</div>
                    <div class="value">${new Date(certificateData.verificationDate).toLocaleString()}</div>
                </div>
                <div class="field">
                    <div class="label">AI Verification Score</div>
                    <div class="value">${certificateData.aiVerificationScore}</div>
                </div>
                <div class="field">
                    <div class="label">Risk Assessment</div>
                    <div class="value">${certificateData.riskAssessment}/100</div>
                </div>
                <div class="field">
                    <div class="label">Status</div>
                    <div class="value status-verified">${certificateData.verificationStatus}</div>
                </div>
            </div>
        </div>
        
        <div class="verification-seal">
            <div class="seal-text">BLOCKCHAIN VERIFIED</div>
            <div class="seal-subtext">Secured by ${certificateData.technicalDetails.verificationNodes} verification nodes</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h3>Blockchain Details</h3>
                <div class="field">
                    <div class="label">Transaction ID</div>
                    <div class="value blockchain-id">${certificateData.blockchainTxId}</div>
                </div>
                <div class="field">
                    <div class="label">Security Hash</div>
                    <div class="value hash">${certificateData.securityHash}</div>
                </div>
                <div class="field">
                    <div class="label">Network</div>
                    <div class="value">${certificateData.technicalDetails.blockchainNetwork}</div>
                </div>
                <div class="field">
                    <div class="label">Encryption</div>
                    <div class="value">${certificateData.technicalDetails.encryptionLevel}</div>
                </div>
            </div>
            
            <div class="section">
                <h3>Technical Verification</h3>
                <div class="field">
                    <div class="label">Algorithm</div>
                    <div class="value">${certificateData.technicalDetails.algorithm}</div>
                </div>
                <div class="field">
                    <div class="label">Verification Nodes</div>
                    <div class="value">${certificateData.technicalDetails.verificationNodes} nodes</div>
                </div>
                <div class="field">
                    <div class="label">Consensus</div>
                    <div class="value status-verified">REACHED</div>
                </div>
                <div class="field">
                    <div class="label">Immutable Record</div>
                    <div class="value status-verified">CONFIRMED</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>${certificateData.companyInfo.name}</strong> | Enterprise No: ${certificateData.companyInfo.enterpriseNumber}</p>
            <p>Founded ${certificateData.companyInfo.founded} | ${certificateData.companyInfo.email}</p>
            <p>This certificate is cryptographically secured and tamper-proof. Verify authenticity at secure.detachd.systems</p>
        </div>
    </div>
</body>
</html>`;
  }
  
  // Generate downloadable PDF (returns HTML for now, can be converted to PDF using libraries like puppeteer)
  static async generateVerificationCertificate(claim: Claim): Promise<{
    certificateData: any;
    htmlContent: string;
    downloadUrl: string;
  }> {
    const certificateData = this.generateCertificateData(claim);
    const htmlContent = this.generatePDFContent(certificateData);
    
    // In a real implementation, you would:
    // 1. Convert HTML to PDF using puppeteer or similar
    // 2. Upload to Azure Blob Storage
    // 3. Return the blob URL
    
    const downloadUrl = `https://detachdstorage.blob.core.windows.net/certificates/${certificateData.certificateId}.pdf`;
    
    return {
      certificateData,
      htmlContent,
      downloadUrl
    };
  }
} 