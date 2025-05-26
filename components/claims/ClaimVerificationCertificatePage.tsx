import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { DownloadIcon, ShieldCheckIcon, CheckCircleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import VerificationSeal from '../common/VerificationSeal';
import { Claim, ClaimStatus } from '../../types';
import { PDFService } from '../../services/pdfService'; 

const mockClaimForCertificate: Claim & { verifiedOn?: string; certificateId?: string; verificationMethod?: string; transactionId?: string } = {
  id: 'clm001', // Match an ID from mock claims if possible for consistency
  claimNumber: 'DET-001',
  policyholderName: 'Demo User',
  dateOfLoss: '2024-07-15',
  claimType: 'Vehicle Accident',
  status: ClaimStatus.APPROVED, 
  amountClaimed: 1500,
  verifiedOn: '2024-07-28',
  certificateId: `DTC-CERT-${Date.now().toString().slice(-8)}`, // Shorter ID
  verificationMethod: 'Detachd AI & SecureLedger Timestamp',
  transactionId: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
};

export const ClaimVerificationCertificatePage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  // const navigate = useNavigate(); // Not used directly currently
  const [claimData, setClaimData] = useState<typeof mockClaimForCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // For demo, always show the mock certificate for any valid-looking claimId
      // In a real app, you'd fetch specific certificate data
      if (claimId) { // Simple check if claimId exists
        setClaimData({...mockClaimForCertificate, claimNumber: `DET-${claimId.slice(-3)}`}); // Adjust mock data slightly
      } else {
        setClaimData(null); 
      }
      setIsLoading(false);
    }, MOCK_DELAY);
  }, [claimId]);

  const handleDownload = async () => {
    if (!claimData) return;
    
    setIsDownloading(true);
    try {
      const { pdfBlob, downloadUrl, certificateData } = await PDFService.generateVerificationCertificatePDF(claimData);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `detachd-certificate-${certificateData.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after download
      setTimeout(() => {
        PDFService.cleanupBlobUrl(downloadUrl);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading verification certificate..." />;
  }

  if (!claimData) {
    return (
      <div>
        <PageHeader title="Certificate Not Found" showBackButton backButtonPath={ROUTES.CLAIMS} />
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary">The verification certificate for this claim could not be found.</p>
        </PixelCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Verification Certificate" 
        subtitle={`Claim #${claimData.claimNumber}`}
        showBackButton 
        backButtonPath={`${ROUTES.CLAIMS}/${claimId}`} // Or just ROUTES.CLAIMS
      />
      
      <PixelCard variant="blue" className="max-w-2xl mx-auto" contentClassName="!p-0">
        <div className="p-6 border-2 border-blue-500 rounded-lg bg-slate-800/50 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-blue-500/20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          </div>
          
          <motion.div 
            className="text-center mb-6 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <VerificationSeal size="large" className="mb-2" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-semibold text-text-on-dark-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Certificate of Verification
            </motion.h2>
            <motion.p 
              className="text-sm text-text-on-dark-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Blockchain-Secured
            </motion.p>
          </motion.div>

          <motion.div 
            className="space-y-3 text-sm mb-6 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <CertificateDetail label="Certificate ID" value={claimData.certificateId || 'N/A'} />
            <CertificateDetail label="Claim Number" value={claimData.claimNumber} />
            <CertificateDetail label="Policyholder" value={claimData.policyholderName} />
            <CertificateDetail label="Date of Incident" value={new Date(claimData.dateOfLoss).toLocaleDateString()} />
            <CertificateDetail label="Date of Verification" value={claimData.verifiedOn ? new Date(claimData.verifiedOn).toLocaleDateString() : 'N/A'} />
            <CertificateDetail label="Verification Method" value={claimData.verificationMethod || 'Standard Protocol'} />
            <CertificateDetail label="SecureLedger TxID" value={claimData.transactionId || 'N/A'} isMonospace />
          </motion.div>
          
          <motion.div 
            className="text-center my-6 p-3 bg-green-800/30 border border-green-600 rounded-md relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
              <motion.div 
                className="flex items-center justify-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <VerificationSeal size="small" showGlow={false} className="mr-3" />
                <CheckCircleIcon className="h-6 w-6 text-green-400"/>
              </motion.div>
              <motion.p 
                className="text-sm text-green-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                This document certifies that the referenced claim information has been processed and verified by Detachd's SecureAI system and recorded on the blockchain.
              </motion.p>
          </motion.div>

          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <Button 
              onClick={handleDownload} 
              isLoading={isDownloading}
              leftIcon={<DownloadIcon className="h-5 w-5" />}
              className="w-full"
              variant="primary"
            >
              {isDownloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-text-on-dark-secondary mt-4 text-center px-6 pb-6">
            This certificate is a digital representation. For official inquiries, please refer to the Detachd platform.
        </p>
      </PixelCard>
    </div>
  );
};

const CertificateDetail: React.FC<{label: string, value: string, isMonospace?: boolean}> = ({label, value, isMonospace}) => (
    <div className="flex justify-between py-1.5 border-b border-slate-700 last:border-b-0">
        <span className="font-medium text-text-on-dark-primary">{label}:</span>
        <span className={`${isMonospace ? 'font-mono text-xs' : ''} text-right text-text-on-dark-secondary`}>{value}</span>
    </div>
);

export default ClaimVerificationCertificatePage;