import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Claim, ClaimStatus, Document, ClaimNote, FraudIndicator, UserRole } from '../../types';
import { ROUTES, MAX_FILE_SIZE_MB, ACCEPTED_DOCUMENT_TYPES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileTextIcon, 
  DollarSignIcon, 
  CalendarIcon, 
  EditIcon, 
  MessageSquareIcon, 
  PaperclipIcon, 
  UserCircleIcon, 
  ShieldCheckIcon, 
  HistoryIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  UploadCloudIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UsersIcon
} from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';

const getStatusBadgeStyles = (status: ClaimStatus | undefined): string => {
  if (!status) return 'text-slate-400 bg-slate-700/30 border-slate-600';
  switch (status) {
    case ClaimStatus.APPROVED: return 'text-green-300 bg-green-700/30 border-green-500';
    case ClaimStatus.REJECTED: return 'text-red-300 bg-red-700/30 border-red-500';
    case ClaimStatus.IN_REVIEW: return 'text-yellow-300 bg-yellow-700/30 border-yellow-500';
    case ClaimStatus.SUBMITTED: return 'text-blue-300 bg-blue-700/30 border-blue-500';
    case ClaimStatus.CLOSED: return 'text-slate-300 bg-slate-700/30 border-slate-500';
    default: return 'text-slate-400 bg-slate-700/30 border-slate-600';
  }
};

interface MockClaimFull extends Claim {
    documents: Document[];
    notes: ClaimNote[];
    fraudIndicators: FraudIndicator[];
    auditTrail: { timestamp: string; event: string; user?: string }[];
}

const createMockClaimDetails = (claimId: string, userRole?: string): MockClaimFull => {
  // Create different claim details based on the claimId - consistent with MyClaimsPage
  const claimData: { [key: string]: Partial<MockClaimFull> } = {
    'clm001': {
      id: 'clm001',
      claimNumber: 'DET-001',
      policyholderName: 'John Smith', // Fixed - always use actual policyholder name
      claimType: 'Auto Accident',
      status: ClaimStatus.IN_REVIEW,
      amountClaimed: 25000,
      dateOfLoss: '2024-07-15',
      description: 'Minor fender bender at the intersection of Adderley Street and Strand Street, Cape Town. Other party involved: Nomsa Dlamini.',
      riskScore: 75, // Fixed - consistent with MyClaimsPage (was 45)
      documents: [
        { id: 'doc1', name: 'police_report.pdf', type: 'PDF', url: '#', uploadedAt: '2024-07-16', size: '1.2MB' },
        { id: 'doc2', name: 'damage_photo_front.jpg', type: 'Photo', url: 'https://picsum.photos/seed/damage1/200/150', uploadedAt: '2024-07-16', size: '850KB' },
      ],
      notes: [
        { id: 'note1', author: 'Sarah Johnson (Adjuster)', content: 'Initial review complete. Contacted policyholder for statement.', timestamp: '2024-07-17 10:30 AM', avatarUrl: 'https://picsum.photos/seed/sarah/40/40' },
      ],
      auditTrail: [
        { timestamp: '2024-07-15 02:30 PM', event: 'Claim Submitted by Policyholder' },
        { timestamp: '2024-07-16 09:00 AM', event: 'Document "police_report.pdf" Uploaded' },
        { timestamp: '2024-07-16 09:05 AM', event: 'Document "damage_photo_front.jpg" Uploaded' },
        { timestamp: '2024-07-16 09:10 AM', event: 'Initial Risk Assessment by System - Score: 75' }, // Fixed
        { timestamp: '2024-07-16 11:00 AM', event: 'Claim Assigned to Adjuster: Sarah Johnson' }, // Fixed name
        { timestamp: '2024-07-17 10:30 AM', event: 'Note added by Sarah Johnson', user: 'Sarah Johnson' },
        { timestamp: '2024-07-17 03:00 PM', event: 'Status changed to "In Review" by Sarah Johnson', user: 'Sarah Johnson' },
      ]
    },
    'clm002': {
      id: 'clm002',
      claimNumber: 'DET-002',
      policyholderName: 'Jane Doe', // Fixed - actual policyholder name
      claimType: 'Property Damage',
      status: ClaimStatus.SUBMITTED,
      amountClaimed: 12000,
      dateOfLoss: '2024-06-20',
      description: 'Water damage to home office due to burst pipe in upstairs bathroom. Affected electronics and furniture.',
      riskScore: 30, // Fixed - consistent with MyClaimsPage
      documents: [
        { id: 'doc3', name: 'water_damage_photos.jpg', type: 'Photo', url: 'https://picsum.photos/seed/water/200/150', uploadedAt: '2024-06-21', size: '2.1MB' },
        { id: 'doc4', name: 'plumber_report.pdf', type: 'PDF', url: '#', uploadedAt: '2024-06-22', size: '890KB' },
      ],
      notes: [
        { id: 'note2', author: 'Mike Wilson (Adjuster)', content: 'Awaiting additional documentation from policyholder.', timestamp: '2024-06-25 02:15 PM', avatarUrl: 'https://picsum.photos/seed/mike/40/40' },
      ],
      auditTrail: [
        { timestamp: '2024-06-20 04:45 PM', event: 'Claim Submitted by Policyholder' },
        { timestamp: '2024-06-21 09:30 AM', event: 'Document "water_damage_photos.jpg" Uploaded' },
        { timestamp: '2024-06-22 11:15 AM', event: 'Document "plumber_report.pdf" Uploaded' },
        { timestamp: '2024-06-22 11:20 AM', event: 'Initial Risk Assessment by System - Score: 30' },
        { timestamp: '2024-06-23 10:00 AM', event: 'Claim Assigned to Adjuster: Mike Wilson' },
      ]
    },
    'clm003': {
      id: 'clm003',
      claimNumber: 'DET-003',
      policyholderName: 'Bob Johnson', // Fixed - actual policyholder name
      claimType: 'Theft',
      status: ClaimStatus.APPROVED,
      amountClaimed: 8000,
      dateOfLoss: '2024-05-01',
      description: 'Laptop and camera stolen from vehicle parked at shopping center. Window was broken to gain entry.',
      riskScore: 20, // Fixed - consistent with MyClaimsPage
      documents: [
        { id: 'doc5', name: 'police_case_number.pdf', type: 'PDF', url: '#', uploadedAt: '2024-05-02', size: '450KB' },
      ],
      notes: [
        { id: 'note3', author: 'Lisa Chen (Adjuster)', content: 'Claim approved after verification with police report. Payment processed.', timestamp: '2024-05-10 11:30 AM', avatarUrl: 'https://picsum.photos/seed/lisa/40/40' },
      ],
      auditTrail: [
        { timestamp: '2024-05-01 08:20 PM', event: 'Claim Submitted by Policyholder' },
        { timestamp: '2024-05-02 10:45 AM', event: 'Document "police_case_number.pdf" Uploaded' },
        { timestamp: '2024-05-02 10:50 AM', event: 'Initial Risk Assessment by System - Score: 20' },
        { timestamp: '2024-05-03 09:00 AM', event: 'Claim Assigned to Adjuster: Lisa Chen' },
        { timestamp: '2024-05-10 11:30 AM', event: 'Claim Approved by Lisa Chen', user: 'Lisa Chen' },
      ]
    },
    'clm004': {
      id: 'clm004',
      claimNumber: 'DET-004',
      policyholderName: 'Alice Brown', // New claim data consistent with MyClaimsPage
      claimType: 'Medical',
      status: ClaimStatus.REJECTED,
      amountClaimed: 15000,
      dateOfLoss: '2024-07-10',
      description: 'Medical expenses following a slip and fall incident at shopping mall.',
      riskScore: 85,
      documents: [
        { id: 'doc6', name: 'medical_reports.pdf', type: 'PDF', url: '#', uploadedAt: '2024-07-11', size: '2.1MB' },
      ],
      notes: [
        { id: 'note4', author: 'David Kim (Adjuster)', content: 'Claim rejected due to pre-existing condition. High risk assessment confirmed.', timestamp: '2024-07-12 03:20 PM', avatarUrl: 'https://picsum.photos/seed/david/40/40' },
      ],
      auditTrail: [
        { timestamp: '2024-07-10 06:15 PM', event: 'Claim Submitted by Policyholder' },
        { timestamp: '2024-07-11 09:20 AM', event: 'Document "medical_reports.pdf" Uploaded' },
        { timestamp: '2024-07-11 09:25 AM', event: 'Initial Risk Assessment by System - Score: 85' },
        { timestamp: '2024-07-11 02:00 PM', event: 'Claim Assigned to Adjuster: David Kim' },
        { timestamp: '2024-07-12 03:20 PM', event: 'Claim Rejected by David Kim', user: 'David Kim' },
      ]
    },
    'clm005': {
      id: 'clm005',
      claimNumber: 'DET-005',
      policyholderName: 'Tom Wilson', // New claim data consistent with MyClaimsPage
      claimType: 'Auto Accident',
      status: ClaimStatus.IN_REVIEW,
      amountClaimed: 32000,
      dateOfLoss: '2024-07-08',
      description: 'Multi-vehicle collision on highway. Significant vehicle damage reported.',
      riskScore: 65,
      documents: [
        { id: 'doc7', name: 'highway_accident_report.pdf', type: 'PDF', url: '#', uploadedAt: '2024-07-09', size: '1.8MB' },
        { id: 'doc8', name: 'vehicle_damage_photos.jpg', type: 'Photo', url: 'https://picsum.photos/seed/accident/200/150', uploadedAt: '2024-07-09', size: '3.2MB' },
      ],
      notes: [
        { id: 'note5', author: 'Sarah Johnson (Adjuster)', content: 'Complex case under review. Awaiting traffic police final report.', timestamp: '2024-07-15 11:45 AM', avatarUrl: 'https://picsum.photos/seed/sarah/40/40' },
      ],
      auditTrail: [
        { timestamp: '2024-07-08 07:30 PM', event: 'Claim Submitted by Policyholder' },
        { timestamp: '2024-07-09 08:15 AM', event: 'Document "highway_accident_report.pdf" Uploaded' },
        { timestamp: '2024-07-09 08:20 AM', event: 'Document "vehicle_damage_photos.jpg" Uploaded' },
        { timestamp: '2024-07-09 08:25 AM', event: 'Initial Risk Assessment by System - Score: 65' },
        { timestamp: '2024-07-10 10:00 AM', event: 'Claim Assigned to Adjuster: Sarah Johnson' },
        { timestamp: '2024-07-15 11:45 AM', event: 'Note added by Sarah Johnson', user: 'Sarah Johnson' },
      ]
    }
  };

  const baseData = claimData[claimId] || claimData['clm001']; // Fallback to clm001 if ID not found
  
  const result: MockClaimFull = {
    id: baseData.id || claimId,
    claimNumber: baseData.claimNumber || `DET-${claimId.slice(-3)}`,
    policyholderName: baseData.policyholderName || 'John Smith', // Use actual policyholder name from data
    dateOfLoss: baseData.dateOfLoss || '2024-07-15',
    claimType: baseData.claimType || 'General Claim',
    status: baseData.status || ClaimStatus.SUBMITTED,
    amountClaimed: baseData.amountClaimed || 0,
    description: baseData.description || 'Claim description not available',
    riskScore: baseData.riskScore || 25,
    documents: baseData.documents || [],
    notes: baseData.notes || [],
    fraudIndicators: [],
    auditTrail: baseData.auditTrail || [
      { timestamp: new Date().toLocaleString(), event: 'Claim Submitted by Policyholder' }
    ]
  };
  
  return result;
};

interface FileWithPreview extends File {
  preview: string;
}

export const ClaimDetailsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<MockClaimFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | 'flag' | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form states
  const [actionReason, setActionReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [requestInfo, setRequestInfo] = useState({ subject: '', message: '' });
  const [uploadFiles, setUploadFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      if (claimId) {
        const mockClaimDetails = createMockClaimDetails(claimId, user?.role);
        
        // Check for saved claim state in localStorage
        const savedClaimState = localStorage.getItem(`claim_${claimId}`);
        if (savedClaimState) {
          const parsedState = JSON.parse(savedClaimState);
          // Merge saved state with mock data
          mockClaimDetails.status = parsedState.status || mockClaimDetails.status;
          if (parsedState.auditTrail) {
            mockClaimDetails.auditTrail = [...parsedState.auditTrail, ...mockClaimDetails.auditTrail];
          }
          setCertificateIssued(parsedState.certificateIssued || false);
        }
        
        setClaim(mockClaimDetails);
      } else {
        setClaim(null);
      }
      setIsLoading(false);
    };
    fetchClaimDetails();
  }, [claimId, user?.role]);

  // Auto-close success toast after 3 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Save claim state to localStorage
  const saveClaimState = (updatedClaim: MockClaimFull) => {
    if (claimId) {
      const stateToSave = {
        status: updatedClaim.status,
        auditTrail: updatedClaim.auditTrail.slice(0, 10), // Save only recent audit entries
        certificateIssued: certificateIssued
      };
      localStorage.setItem(`claim_${claimId}`, JSON.stringify(stateToSave));
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'flag') => {
    if (!actionReason.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (claim) {
      const newStatus = action === 'approve' ? ClaimStatus.APPROVED : 
                       action === 'reject' ? ClaimStatus.REJECTED : ClaimStatus.IN_REVIEW;
      
      const updatedClaim = { ...claim, status: newStatus };
      const newAuditEntry = {
        timestamp: new Date().toLocaleString(),
        event: `Claim ${action}d by Sarah Naidoo - ${actionReason}`,
        user: 'Sarah Naidoo'
      };
      updatedClaim.auditTrail = [newAuditEntry, ...updatedClaim.auditTrail];
      setClaim(updatedClaim);
      saveClaimState(updatedClaim);
      
      // If approved, show certificate issuance option for insurers
      if (action === 'approve' && isInsurer) {
        setShowCertificateModal(true);
      }
    }
    
    setIsSubmitting(false);
    setShowActionModal(null);
    setActionReason('');
  };

  const issueCertificate = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (claim) {
      const updatedClaim = { ...claim };
      const certificateEntry = {
        timestamp: new Date().toLocaleString(),
        event: `Certificate issued by Sarah Johnson - Policy payout certificate generated`,
        user: 'Sarah Johnson'
      };
      updatedClaim.auditTrail = [certificateEntry, ...updatedClaim.auditTrail];
      setClaim(updatedClaim);
      setCertificateIssued(true);
      setShowSuccessToast(true);
      
      // Save updated state with certificate issued
      const stateToSave = {
        status: updatedClaim.status,
        auditTrail: updatedClaim.auditTrail.slice(0, 10),
        certificateIssued: true
      };
      localStorage.setItem(`claim_${claimId}`, JSON.stringify(stateToSave));
    }
    
    setIsSubmitting(false);
    setShowCertificateModal(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FileWithPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) continue;
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type) && !file.type.startsWith('image/')) continue;
      
      newFiles.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const submitDocuments = async () => {
    if (uploadFiles.length === 0) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (claim) {
      const newDocuments = uploadFiles.map((file, index) => ({
        id: `doc${claim.documents.length + index + 1}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'Photo' as const : 'PDF' as const,
        url: file.preview,
        uploadedAt: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(1)}MB`
      }));
      
      const updatedClaim = { 
        ...claim, 
        documents: [...claim.documents, ...newDocuments] 
      };
      
      const auditEntries = uploadFiles.map(file => ({
        timestamp: new Date().toLocaleString(),
        event: `Document "${file.name}" Uploaded`,
        user: user?.name || 'John Smith'
      }));
      
      updatedClaim.auditTrail = [...auditEntries, ...updatedClaim.auditTrail];
      setClaim(updatedClaim);
    }
    
    // Cleanup
    uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setUploadFiles([]);
    setIsSubmitting(false);
    setShowUploadModal(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (claim) {
      const newNoteObj = {
        id: `note${claim.notes.length + 1}`,
        author: isInsurer ? 'Sarah Johnson (Adjuster)' : `${user?.name || 'John Smith'} (Policyholder)`,
        content: newNote,
        timestamp: new Date().toLocaleString(),
        avatarUrl: isInsurer ? 'https://picsum.photos/seed/sarah/40/40' : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'John Smith')}&background=4A5568&color=E0E7FF`
      };
      
      const updatedClaim = { 
        ...claim, 
        notes: [newNoteObj, ...claim.notes] 
      };
      
      const auditEntry = {
        timestamp: new Date().toLocaleString(),
        event: isInsurer ? `Internal note added by Sarah Johnson` : `Note added by ${user?.name || 'Policyholder'}`,
        user: isInsurer ? 'Sarah Johnson' : user?.name || 'Policyholder'
      };
      updatedClaim.auditTrail = [auditEntry, ...updatedClaim.auditTrail];
      setClaim(updatedClaim);
    }
    
    setIsSubmitting(false);
    setShowNoteModal(false);
    setNewNote('');
  };

  const submitRequestInfo = async () => {
    if (!requestInfo.subject.trim() || !requestInfo.message.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isInsurer) {
      // For insurers, add a communication log to the claim
      if (claim) {
        const auditEntry = {
          timestamp: new Date().toLocaleString(),
          event: `Policyholder contacted by Sarah Johnson - ${requestInfo.subject}`,
          user: 'Sarah Johnson'
        };
        const updatedClaim = { ...claim };
        updatedClaim.auditTrail = [auditEntry, ...updatedClaim.auditTrail];
        setClaim(updatedClaim);
      }
    } else {
      // For policyholders, navigate to support request with claim context
      navigate(ROUTES.HELP_CONTACT_SUPPORT, {
        state: {
          claimContext: {
            claimNumber: claim?.claimNumber,
            claimType: claim?.claimType,
            policyholderName: claim?.policyholderName,
            subject: requestInfo.subject,
            message: requestInfo.message
          }
        }
      });
    }
    
    setIsSubmitting(false);
    setShowRequestInfoModal(false);
    setRequestInfo({ subject: '', message: '' });
  };

  if (isLoading) {
    return <LoadingSpinner message={`Loading claim ${claimId} details...`} />;
  }

  if (!claim) {
    return (
      <div>
        <PageHeader title="Error Loading Claim" showBackButton backButtonPath={ROUTES.CLAIMS} />
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary">Failed to load claim data</p>
          <div className="mt-4 text-center">
            <Link to={ROUTES.CLAIMS}>
              <Button variant="primary">Back to Claims</Button>
            </Link>
          </div>
        </PixelCard>
      </div>
    );
  }
  
  const riskScoreColor = claim.riskScore && claim.riskScore > 70 ? 'text-red-400' : claim.riskScore && claim.riskScore > 50 ? 'text-yellow-400' : 'text-green-400';
  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';

  return (
    <div>
      <PageHeader 
        title={`Claim #${claim.claimNumber}`} 
        subtitle={isInsurer ? `${claim.claimType} • Policyholder: ${claim.policyholderName}` : claim.claimType}
        showBackButton 
        backButtonPath={ROUTES.CLAIMS}
        actions={
          isInsurer ? (
            <div className="flex space-x-3">
              {claim.status === ClaimStatus.IN_REVIEW && (
                <>
                  <Button 
                    variant="primary" 
                    leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                    onClick={() => setShowActionModal('approve')}
                  >
                    Approve Claim
                  </Button>
                  <Button 
                    variant="danger" 
                    leftIcon={<XCircleIcon className="h-4 w-4" />}
                    onClick={() => setShowActionModal('reject')}
                  >
                    Reject Claim
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                leftIcon={<MessageSquareIcon className="h-4 w-4" />}
                onClick={() => setShowNoteModal(true)}
              >
                Add Note
              </Button>
            </div>
          ) : (
            <Button 
              variant="primary" 
              leftIcon={<EditIcon className="h-4 w-4" />}
              onClick={() => setShowRequestInfoModal(true)}
            >
              Request Information
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PixelCard variant="blue" title="Claim Summary" icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-3">
              <InfoItem icon={<UserCircleIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Policyholder" value={claim.policyholderName} />
              {isInsurer && (
                <InfoItem icon={<ShieldCheckIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Policy Number" value="POL-12345" />
              )}
              <InfoItem icon={<CalendarIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Date of Loss" value={new Date(claim.dateOfLoss).toLocaleDateString()} />
              <InfoItem icon={<DollarSignIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Amount Claimed" value={claim.amountClaimed ? `R ${claim.amountClaimed.toLocaleString()}` : 'N/A'} />
              <InfoItem icon={<FileTextIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>{claim.status}</span>} />
              {isInsurer && (
                <InfoItem icon={<UsersIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Assigned Adjuster" value="Sarah Johnson" />
              )}
              {claim.description && (
                <div>
                  <dt className="text-sm font-medium text-text-on-dark-secondary">Description</dt>
                  <dd className="mt-1 text-sm text-text-on-dark-primary">{claim.description}</dd>
                </div>
              )}
            </div>
             {claim.status === ClaimStatus.APPROVED && (
               <div className="mt-4 border-t border-slate-700 pt-4">
                  <Link to={`${ROUTES.CLAIMS}/${claim.id}/certificate`}>
                      <Button variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-700/30" leftIcon={<ShieldCheckIcon className="w-4 h-4"/>}>
                          {isInsurer ? 'Issue Verification Certificate' : 'View Verification Certificate'}
                      </Button>
                  </Link>
              </div>
             )}
             
             {claim.status !== ClaimStatus.IN_REVIEW && (
               <div className="mt-4 border-t border-slate-700 pt-4">
                 <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                   <p className="text-yellow-300 text-sm">
                     {isInsurer ? 'Certificate can be issued once claim is approved' : 'Certificate will be available once claim is approved'}
                   </p>
                 </div>
               </div>
             )}
          </PixelCard>

          <PixelCard 
            variant="blue" 
            title="Documents" 
            icon={<PaperclipIcon className="h-5 w-5 text-blue-400" />} 
            actions={
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-400 text-blue-300 hover:bg-blue-700/30" 
                leftIcon={<PaperclipIcon className="h-4 w-4" />}
                onClick={() => setShowUploadModal(true)}
              >
                {isInsurer ? 'Upload Additional Evidence' : 'Upload Document'}
              </Button>
            }
          >
             {claim.documents.length > 0 ? (
                <ul className="divide-y divide-slate-700">
                    {claim.documents.map(doc => (
                        <li key={doc.id} className="py-3 flex justify-between items-center">
                            <div>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-300 hover:underline">{doc.name}</a>
                                <p className="text-xs text-text-on-dark-secondary">{doc.type} - {doc.size} - Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            {doc.type === 'Photo' && doc.url.startsWith('https') && <img src={doc.url} alt={doc.name} className="h-10 w-10 rounded object-cover" />}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-text-on-dark-secondary">No documents uploaded for this claim.</p>}
          </PixelCard>

          <PixelCard 
            variant="blue" 
            title={isInsurer ? 'Internal Notes & Communication' : 'Claim Notes'} 
            icon={<MessageSquareIcon className="h-5 w-5 text-blue-400" />} 
            actions={
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-400 text-blue-300 hover:bg-blue-700/30" 
                leftIcon={<MessageSquareIcon className="h-4 w-4" />}
                onClick={() => setShowNoteModal(true)}
              >
                {isInsurer ? 'Add Internal Note' : 'Add Note'}
              </Button>
            }
          >
             {claim.notes.length > 0 ? (
                <ul className="space-y-4">
                    {claim.notes.map(note => (
                        <li key={note.id} className="flex space-x-3 cursor-pointer hover:bg-slate-700/30 p-2 rounded-md transition-colors" onClick={() => setShowNoteModal(true)}>
                            <img className="h-8 w-8 rounded-full" src={note.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.author)}&background=4A5568&color=E0E7FF`} alt={note.author} />
                            <div>
                                <div className="text-sm">
                                    <span className="font-medium text-text-on-dark-primary">{note.author}</span>
                                    <span className="text-text-on-dark-secondary"> • {note.timestamp}</span>
                                </div>
                                <p className="text-sm text-text-on-dark-secondary mt-0.5">{note.content}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-text-on-dark-secondary">{isInsurer ? 'No internal notes for this claim yet.' : 'No notes for this claim yet.'}</p>}
          </PixelCard>
          
          <PixelCard variant="blue" title="Claim Audit Trail" icon={<HistoryIcon className="h-5 w-5 text-blue-400" />}>
            {claim.auditTrail.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {claim.auditTrail.map((event, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-slate-700/50 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">
                    <span className="text-text-on-dark-secondary">{event.event} {event.user && `by ${event.user}`}</span>
                    <span className="text-slate-400">{event.timestamp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-on-dark-secondary">No audit trail available for this claim.</p>
            )}
          </PixelCard>

        </div>

        <div className="space-y-6">
          <PixelCard variant="blue" title="Risk Assessment" icon={<AlertTriangleIcon className="h-5 w-5 text-blue-400" />}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-on-dark-secondary">Overall Risk Score:</p>
              <p className={`text-2xl font-bold ${riskScoreColor}`}>
                {claim.riskScore !== undefined ? claim.riskScore : 'N/A'}
              </p>
            </div>
            {claim.riskScore && claim.riskScore > 70 && isInsurer && (
              <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-xs font-medium">⚠ HIGH RISK - Requires additional scrutiny</p>
              </div>
            )}
            {claim.fraudIndicators.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-on-dark-primary mb-1">Potential Fraud Indicators:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
                  {claim.fraudIndicators.map(fi => <li key={fi.id}>{fi.type} ({fi.severity})</li>)}
                </ul>
              </div>
            )}
             {claim.fraudIndicators.length === 0 && claim.riskScore !== undefined && (
                <p className="text-xs text-text-on-dark-secondary mt-2">No specific fraud indicators flagged.</p>
            )}
            {claim.riskScore === undefined && (
                 <p className="text-xs text-text-on-dark-secondary mt-2">Risk assessment pending.</p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 border-blue-400 text-blue-300 hover:bg-blue-700/30"
              onClick={() => setShowRiskModal(true)}
            >
              View Risk Details
            </Button>
          </PixelCard>
          
           {/* Role-based Actions */}
          {isInsurer ? (
            <PixelCard variant="blue" title="Claim Management">
              <div className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-on-dark-secondary">Priority:</span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-red-500 text-red-300 bg-red-700/30">HIGH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-on-dark-secondary">Assigned To:</span>
                    <span className="text-text-on-dark-primary">Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-on-dark-secondary">Last Activity:</span>
                    <span className="text-text-on-dark-primary">2 hours ago</span>
                  </div>
                </div>
                
                {claim.status === ClaimStatus.IN_REVIEW && (
                  <div className="space-y-2 pt-3 border-t border-slate-700">
                    <Button 
                      className="w-full" 
                      variant="primary"
                      leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                      onClick={() => setShowActionModal('approve')}
                    >
                      Approve Claim
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="danger"
                      leftIcon={<XCircleIcon className="h-4 w-4" />}
                      onClick={() => setShowActionModal('reject')}
                    >
                      Reject Claim
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30"
                      leftIcon={<FlagIcon className="h-4 w-4" />}
                      onClick={() => setShowActionModal('flag')}
                    >
                      Flag for Review
                    </Button>
                  </div>
                )}
                
                {claim.status !== ClaimStatus.IN_REVIEW && (
                  <div className="space-y-2 pt-3 border-t border-slate-700">
                    <div className="text-center">
                      <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                        {claim.status}
                      </div>
                      <p className="text-xs text-text-on-dark-secondary mt-2">
                        {claim.status === ClaimStatus.APPROVED && 'Claim processing completed'}
                        {claim.status === ClaimStatus.REJECTED && 'Claim has been rejected'}
                        {claim.status === ClaimStatus.SUBMITTED && 'Awaiting adjuster assignment'}
                        {claim.status === ClaimStatus.CLOSED && 'Claim is closed'}
                      </p>
                    </div>
                    
                    {/* Issue Certificate button for approved claims */}
                    {claim.status === ClaimStatus.APPROVED && !certificateIssued && (
                      <Button 
                        className="w-full" 
                        variant="primary"
                        leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                        onClick={() => setShowCertificateModal(true)}
                      >
                        Issue Certificate
                      </Button>
                    )}
                    
                    {/* Show certificate issued status */}
                    {certificateIssued && (
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mx-auto mb-1" />
                        <p className="text-xs text-green-300">Certificate Issued</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 pt-3 border-t border-slate-700">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-400 text-blue-300 hover:bg-blue-700/30"
                    leftIcon={<MessageSquareIcon className="h-4 w-4" />}
                    onClick={() => setShowRequestInfoModal(true)}
                  >
                    Contact Policyholder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30"
                    leftIcon={<UserCircleIcon className="h-4 w-4" />}
                  >
                    View Policy Details
                  </Button>
                </div>
              </div>
            </PixelCard>
          ) : (
            <PixelCard variant="blue" title="Claim Status">
              <div className="space-y-3">
                <div className="text-center">
                  <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                    {claim.status}
                  </div>
                </div>
                <div className="text-sm text-text-on-dark-secondary space-y-2">
                  <p><strong>Current Status:</strong> Your claim is currently {claim.status.toLowerCase().replace('_', ' ')}</p>
                  {claim.status === ClaimStatus.IN_REVIEW && (
                    <p className="text-yellow-300">⏳ Your claim is being reviewed by our team. We'll update you soon.</p>
                  )}
                  {claim.status === ClaimStatus.APPROVED && (
                    <p className="text-green-300">✅ Your claim has been approved! Payment processing will begin shortly.</p>
                  )}
                  {claim.status === ClaimStatus.REJECTED && (
                    <p className="text-red-300">❌ Your claim was not approved. You can appeal this decision.</p>
                  )}
                  {claim.status === ClaimStatus.SUBMITTED && (
                    <p className="text-blue-300">📋 Your claim has been submitted and is awaiting initial review.</p>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-400 text-blue-300 hover:bg-blue-700/30"
                    leftIcon={<MessageSquareIcon className="h-4 w-4" />}
                    onClick={() => setShowRequestInfoModal(true)}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">
                {showActionModal === 'approve' ? 'Approve Claim' : 
                 showActionModal === 'reject' ? 'Reject Claim' : 'Flag for Review'}
              </h3>
              <button onClick={() => setShowActionModal(null)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <Textarea
              label="Reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={`Please provide a reason for ${showActionModal === 'approve' ? 'approving' : showActionModal}ing this claim...`}
              rows={4}
              required
            />
            <div className="flex space-x-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowActionModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant={showActionModal === 'approve' ? 'primary' : 'danger'}
                onClick={() => handleAction(showActionModal)}
                isLoading={isSubmitting}
                disabled={!actionReason.trim()}
                className="flex-1"
              >
                {showActionModal === 'approve' ? 'Approve' : 
                 showActionModal === 'reject' ? 'Reject' : 'Flag'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Risk Details Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Risk Assessment Details</h3>
              <button onClick={() => setShowRiskModal(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${riskScoreColor} mb-2`}>{claim.riskScore}/100</div>
                <p className="text-text-on-dark-secondary">Overall Risk Score</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-on-dark-secondary">Document Authenticity:</span>
                  <span className="text-green-400">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-secondary">Claim Amount Analysis:</span>
                  <span className="text-green-400">✓ Within Normal Range</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-secondary">Pattern Recognition:</span>
                  <span className="text-green-400">✓ No Suspicious Patterns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-secondary">Location Verification:</span>
                  <span className="text-green-400">✓ Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-on-dark-secondary">Timeline Consistency:</span>
                  <span className="text-yellow-400">⚠ Minor Discrepancies</span>
                </div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-md">
                <p className="text-sm text-text-on-dark-secondary">
                  <strong>AI Analysis:</strong> This claim shows low risk indicators. Minor timeline discrepancies noted but within acceptable parameters for this claim type.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowRiskModal(false)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Upload Documents</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
              <p className="text-text-on-dark-primary mb-2">Drag and drop files here</p>
              <p className="text-text-on-dark-secondary text-sm mb-4">or</p>
              <input
                type="file"
                multiple
                accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose Files
                </Button>
              </label>
              <p className="text-xs text-text-on-dark-secondary mt-2">
                PDF, JPG, PNG up to {MAX_FILE_SIZE_MB}MB each
              </p>
            </div>

            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                    <div className="flex items-center min-w-0">
                      {file.type.startsWith('image/') && (
                        <img src={file.preview} alt="preview" className="h-8 w-8 rounded object-cover mr-2" />
                      )}
                      <span className="text-sm text-text-on-dark-primary truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(file.preview);
                        setUploadFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={submitDocuments}
                isLoading={isSubmitting}
                disabled={uploadFiles.length === 0}
                className="flex-1"
              >
                Upload {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Add Note</h3>
              <button onClick={() => setShowNoteModal(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <Textarea
              label="Note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add your note here..."
              rows={4}
              required
            />
            <div className="flex space-x-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNoteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={addNote}
                isLoading={isSubmitting}
                disabled={!newNote.trim()}
                className="flex-1"
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Information Modal */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Request Information</h3>
              <button onClick={() => setShowRequestInfoModal(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-3 rounded-md">
                <p className="text-sm text-text-on-dark-secondary">
                  <strong>Claim:</strong> #{claim.claimNumber} - {claim.claimType}<br />
                  <strong>Policyholder:</strong> {claim.policyholderName}
                </p>
              </div>
              <Input
                label="Subject"
                value={requestInfo.subject}
                onChange={(e) => setRequestInfo(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="What information do you need?"
                required
              />
              <Textarea
                label="Message"
                value={requestInfo.message}
                onChange={(e) => setRequestInfo(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide details about the information you're requesting..."
                rows={4}
                required
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowRequestInfoModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={submitRequestInfo}
                isLoading={isSubmitting}
                disabled={!requestInfo.subject.trim() || !requestInfo.message.trim()}
                className="flex-1"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Issuance Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Issue Verification Certificate</h3>
              <button onClick={() => setShowCertificateModal(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <p className="text-text-on-dark-secondary">
              Are you sure you want to issue a verification certificate for this claim?
            </p>
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCertificateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={issueCertificate}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Issue Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-on-dark-primary">Certificate Issued Successfully</h3>
              <button onClick={() => setShowSuccessToast(false)}>
                <XMarkIcon className="h-5 w-5 text-text-on-dark-secondary" />
              </button>
            </div>
            <p className="text-text-on-dark-secondary">
              Your certificate has been issued successfully!
            </p>
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowSuccessToast(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {icon}
    <div className="min-w-0 flex-1">
      <dt className="text-sm font-medium text-text-on-dark-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-text-on-dark-primary">{typeof value === 'string' ? value : value}</dd>
    </div>
  </div>
);

export default ClaimDetailsPage;