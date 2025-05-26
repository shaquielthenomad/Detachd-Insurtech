import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Claim, ClaimStatus, Document, ClaimNote, FraudIndicator } from '../../types';
import { ROUTES, MAX_FILE_SIZE_MB, ACCEPTED_DOCUMENT_TYPES } from '../../constants';
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
  ExclamationTriangleIcon
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

const mockClaimDetails: MockClaimFull = {
    id: 'clm001',
    claimNumber: 'DET-001',
    policyholderName: 'Thabo Mthembu',
    dateOfLoss: '2024-07-15',
    claimType: 'Auto Accident',
    status: ClaimStatus.IN_REVIEW,
    amountClaimed: 25000,
    description: 'Minor fender bender at the intersection of Adderley Street and Strand Street, Cape Town. Other party involved: Nomsa Dlamini.',
    riskScore: 45,
    documents: [
        { id: 'doc1', name: 'police_report.pdf', type: 'PDF', url: '#', uploadedAt: '2024-07-16', size: '1.2MB' },
        { id: 'doc2', name: 'damage_photo_front.jpg', type: 'Photo', url: 'https://picsum.photos/seed/damage1/200/150', uploadedAt: '2024-07-16', size: '850KB' },
    ],
    notes: [
        { id: 'note1', author: 'Sarah Naidoo (Adjuster)', content: 'Initial review complete. Contacted policyholder for statement.', timestamp: '2024-07-17 10:30 AM', avatarUrl: 'https://picsum.photos/seed/sarah/40/40' },
    ],
    fraudIndicators: [],
    auditTrail: [
      { timestamp: '2024-07-15 02:30 PM', event: 'Claim Submitted by Policyholder' },
      { timestamp: '2024-07-16 09:00 AM', event: 'Document "police_report.pdf" Uploaded' },
      { timestamp: '2024-07-16 09:05 AM', event: 'Document "damage_photo_front.jpg" Uploaded' },
      { timestamp: '2024-07-16 09:10 AM', event: 'Initial Risk Assessment by System - Score: 45' },
      { timestamp: '2024-07-16 11:00 AM', event: 'Claim Assigned to Adjuster: Sarah Naidoo' },
      { timestamp: '2024-07-17 10:30 AM', event: 'Note added by Sarah Naidoo', user: 'Sarah Naidoo' },
      { timestamp: '2024-07-17 03:00 PM', event: 'Status changed to "In Review" by Sarah Naidoo', user: 'Sarah Naidoo' },
    ]
};

interface FileWithPreview extends File {
  preview: string;
}

export const ClaimDetailsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<MockClaimFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | 'flag' | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  
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
      if (claimId === mockClaimDetails.id) {
        setClaim(mockClaimDetails);
      } else {
        setClaim(null);
      }
      setIsLoading(false);
    };
    fetchClaimDetails();
  }, [claimId]);

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
    }
    
    setIsSubmitting(false);
    setShowActionModal(null);
    setActionReason('');
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
        user: 'Thabo Mthembu'
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
        author: 'Sarah Naidoo (Adjuster)',
        content: newNote,
        timestamp: new Date().toLocaleString(),
        avatarUrl: 'https://picsum.photos/seed/sarah/40/40'
      };
      
      const updatedClaim = { 
        ...claim, 
        notes: [newNoteObj, ...claim.notes] 
      };
      
      const auditEntry = {
        timestamp: new Date().toLocaleString(),
        event: `Note added by Sarah Naidoo`,
        user: 'Sarah Naidoo'
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
    
    // Navigate to support request with claim context
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
        <PageHeader title="Claim Not Found" showBackButton backButtonPath={ROUTES.CLAIMS} />
        <PixelCard variant="blue">
          <p className="text-center text-text-on-dark-secondary">The claim you are looking for (ID: {claimId}) could not be found.</p>
          <div className="mt-4 text-center">
            <Link to={ROUTES.CLAIMS}>
              <Button variant="primary">Back to My Claims</Button>
            </Link>
          </div>
        </PixelCard>
      </div>
    );
  }
  
  const riskScoreColor = claim.riskScore && claim.riskScore > 70 ? 'text-red-400' : claim.riskScore && claim.riskScore > 50 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div>
      <PageHeader 
        title={`Claim #${claim.claimNumber}`} 
        subtitle={claim.claimType}
        showBackButton 
        backButtonPath={ROUTES.CLAIMS}
        actions={
          <Button 
            variant="primary" 
            leftIcon={<EditIcon className="h-4 w-4" />}
            onClick={() => setShowRequestInfoModal(true)}
          >
            Request Information
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PixelCard variant="blue" title="Claim Summary" icon={<FileTextIcon className="h-5 w-5 text-blue-400" />}>
            <div className="space-y-3">
              <InfoItem icon={<UserCircleIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Policyholder" value={claim.policyholderName} />
              <InfoItem icon={<CalendarIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Date of Loss" value={new Date(claim.dateOfLoss).toLocaleDateString()} />
              <InfoItem icon={<DollarSignIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Amount Claimed" value={claim.amountClaimed ? `R ${claim.amountClaimed.toLocaleString()}` : 'N/A'} />
              <InfoItem icon={<FileTextIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>{claim.status}</span>} />
              {claim.description && (
                <div>
                  <dt className="text-sm font-medium text-text-on-dark-secondary">Description</dt>
                  <dd className="mt-1 text-sm text-text-on-dark-primary">{claim.description}</dd>
                </div>
              )}
            </div>
             <div className="mt-4 border-t border-slate-700 pt-4">
                <Link to={`${ROUTES.CLAIMS}/${claim.id}/certificate`}>
                    <Button variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-700/30" leftIcon={<ShieldCheckIcon className="w-4 h-4"/>}>
                        View Verification Certificate
                    </Button>
                </Link>
            </div>
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
                Upload Document
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
            title="Claim Notes" 
            icon={<MessageSquareIcon className="h-5 w-5 text-blue-400" />} 
            actions={
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-400 text-blue-300 hover:bg-blue-700/30" 
                leftIcon={<MessageSquareIcon className="h-4 w-4" />}
                onClick={() => setShowNoteModal(true)}
              >
                Add Note
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
            ) : <p className="text-sm text-text-on-dark-secondary">No notes for this claim yet.</p>}
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
          
           <PixelCard variant="blue" title="Actions">
                <div className="space-y-2">
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
            </PixelCard>
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
              placeholder={`Please provide a reason for ${showActionModal}ing this claim...`}
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