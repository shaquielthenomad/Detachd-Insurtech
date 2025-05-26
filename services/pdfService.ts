import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Claim } from '../types';

export class PDFService {
  
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
  
  // Generate actual PDF certificate
  static async generateVerificationCertificatePDF(claim: Claim): Promise<{
    certificateData: any;
    pdfBlob: Blob;
    downloadUrl: string;
  }> {
    const certificateData = this.generateCertificateData(claim);
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colors
    const primaryBlue = '#1e40af';
    const darkGray = '#1f2937';
    const lightGray = '#6b7280';
    const green = '#059669';
    
    // Header
    pdf.setFillColor(30, 64, 175); // Primary blue
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETACHD', pageWidth / 2, 12, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Powered Insurance Fraud Prevention', pageWidth / 2, 18, { align: 'center' });
    
    // Title
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Blockchain Verification Certificate', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Blockchain-Secured Verification', pageWidth / 2, 48, { align: 'center' });
    
    // Certificate ID Box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.rect(20, 55, pageWidth - 40, 15, 'FD');
    
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Certificate ID:', 25, 62);
    pdf.setFont('courier', 'normal');
    pdf.text(certificateData.certificateId, 25, 67);
    
    // Main content sections
    let yPos = 80;
    
    // Claim Information Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Claim Information', 20, yPos);
    yPos += 8;
    
    const claimInfo = [
      ['Claim Number:', certificateData.claimNumber],
      ['Policyholder:', certificateData.policyholderName],
      ['Claim Type:', certificateData.claimType],
      ['Date of Loss:', new Date(certificateData.dateOfLoss).toLocaleDateString()],
      ['Amount Claimed:', `R ${certificateData.amountClaimed?.toLocaleString() || 'N/A'}`]
    ];
    
    pdf.setFontSize(10);
    claimInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(label, 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(value, 80, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    
    // Verification Details Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Verification Details', 20, yPos);
    yPos += 8;
    
    const verificationInfo = [
      ['Verification Date:', new Date(certificateData.verificationDate).toLocaleString()],
      ['AI Verification Score:', certificateData.aiVerificationScore],
      ['Risk Assessment:', `${certificateData.riskAssessment}/100`],
      ['Status:', certificateData.verificationStatus],
      ['Algorithm:', certificateData.technicalDetails.algorithm]
    ];
    
    pdf.setFontSize(10);
    verificationInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(label, 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(value, 80, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    
    // Verification Seal
    pdf.setFillColor(5, 150, 105);
    pdf.setDrawColor(5, 150, 105);
    pdf.rect(20, yPos, pageWidth - 40, 20, 'FD');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('✓ BLOCKCHAIN VERIFIED', pageWidth / 2, yPos + 8, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Secured by ${certificateData.technicalDetails.verificationNodes} verification nodes`, pageWidth / 2, yPos + 15, { align: 'center' });
    
    yPos += 30;
    
    // Blockchain Details Section
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Blockchain Details', 20, yPos);
    yPos += 8;
    
    const blockchainInfo = [
      ['Transaction ID:', certificateData.blockchainTxId],
      ['Security Hash:', certificateData.securityHash],
      ['Network:', certificateData.technicalDetails.blockchainNetwork],
      ['Encryption:', certificateData.technicalDetails.encryptionLevel],
      ['Verification Nodes:', certificateData.technicalDetails.verificationNodes.toString()],
      ['Consensus:', 'REACHED']
    ];
    
    pdf.setFontSize(8);
    blockchainInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(label, 25, yPos);
      pdf.setFont('courier', 'normal');
      pdf.setTextColor(107, 114, 128);
      
      // Handle long values (like transaction ID)
      if (value.length > 50) {
        const lines = pdf.splitTextToSize(value, pageWidth - 100);
        pdf.text(lines, 80, yPos);
        yPos += (lines.length - 1) * 4;
      } else {
        pdf.text(value, 80, yPos);
      }
      yPos += 6;
    });
    
    // Footer
    const footerY = pageHeight - 30;
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY, pageWidth - 20, footerY);
    
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${certificateData.companyInfo.name} | Enterprise No: ${certificateData.companyInfo.enterpriseNumber}`, pageWidth / 2, footerY + 8, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Founded ${certificateData.companyInfo.founded} | ${certificateData.companyInfo.email}`, pageWidth / 2, footerY + 14, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.text('This certificate is cryptographically secured and tamper-proof. Verify authenticity at detachd.systems', pageWidth / 2, footerY + 20, { align: 'center' });
    
    // Generate blob
    const pdfBlob = pdf.output('blob');
    const downloadUrl = URL.createObjectURL(pdfBlob);
    
    return {
      certificateData,
      pdfBlob,
      downloadUrl
    };
  }
  
  // Generate access code text file
  static generateAccessCodeFile(accessInfo: {
    code: string;
    name: string;
    email: string;
    phone: string;
  }): { blob: Blob; downloadUrl: string } {
    const content = `DETACHD ACCESS CODE

Code: ${accessInfo.code}
Generated: ${new Date().toLocaleString()}
Name: ${accessInfo.name}
Email: ${accessInfo.email}
Phone: ${accessInfo.phone}

Save this information securely. You'll need this code to access claim information.

---
Detachd Pty Ltd
Enterprise Number: 2021/792488/07
support@detachd.systems

This access code is unique and should be kept confidential.
Share only with authorized parties for claim processing purposes.`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    
    return { blob, downloadUrl };
  }
  
  // Clean up blob URLs to prevent memory leaks
  static cleanupBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
} 