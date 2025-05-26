import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Claim, ClaimStatus, Document, ClaimNote, FraudIndicator } from '../../types';
import { ROUTES } from '../../constants';
import { FileTextIcon, DollarSignIcon, CalendarIcon, EditIcon, MessageSquareIcon, PaperclipIcon, UserCircleIcon, ShieldCheckIcon, HistoryIcon, AlertTriangleIcon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';

const getStatusBadgeStyles = (status: ClaimStatus | undefined): string => {
  if (!status) return 'text-slate-400 bg-slate-700/30 border-slate-600';
  // Styles for dark PixelCard background
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
    policyholderName: 'Demo User',
    dateOfLoss: '2024-07-15',
    claimType: 'Auto Accident',
    status: ClaimStatus.IN_REVIEW,
    amountClaimed: 2500,
    description: 'Minor fender bender at the intersection of Main St and Park Ave. Other party involved: John Doe.',
    riskScore: 45,
    documents: [
        { id: 'doc1', name: 'police_report.pdf', type: 'PDF', url: '#', uploadedAt: '2024-07-16', size: '1.2MB' },
        { id: 'doc2', name: 'damage_photo_front.jpg', type: 'Photo', url: 'https://picsum.photos/seed/damage1/200/150', uploadedAt: '2024-07-16', size: '850KB' },
    ],
    notes: [
        { id: 'note1', author: 'Sarah Chen (Adjuster)', content: 'Initial review complete. Contacted policyholder for statement.', timestamp: '2024-07-17 10:30 AM', avatarUrl: 'https://picsum.photos/seed/sarah/40/40' },
    ],
    fraudIndicators: [],
    auditTrail: [
      { timestamp: '2024-07-15 02:30 PM', event: 'Claim Submitted by Policyholder' },
      { timestamp: '2024-07-16 09:00 AM', event: 'Document "police_report.pdf" Uploaded' },
      { timestamp: '2024-07-16 09:05 AM', event: 'Document "damage_photo_front.jpg" Uploaded' },
      { timestamp: '2024-07-16 09:10 AM', event: 'Initial Risk Assessment by System - Score: 45' },
      { timestamp: '2024-07-16 11:00 AM', event: 'Claim Assigned to Adjuster: Sarah Chen' },
      { timestamp: '2024-07-17 10:30 AM', event: 'Note added by Sarah Chen', user: 'Sarah Chen' },
      { timestamp: '2024-07-17 03:00 PM', event: 'Status changed to "In Review" by Sarah Chen', user: 'Sarah Chen' },
    ]
};


export const ClaimDetailsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [claim, setClaim] = useState<MockClaimFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          <Button variant="primary" leftIcon={<EditIcon className="h-4 w-4" />}>
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
              <InfoItem icon={<DollarSignIcon className="h-5 w-5 text-text-on-dark-secondary" />} label="Amount Claimed" value={claim.amountClaimed ? `$${claim.amountClaimed.toLocaleString()}` : 'N/A'} />
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

          <PixelCard variant="blue" title="Documents" icon={<PaperclipIcon className="h-5 w-5 text-blue-400" />} actions={<Button variant="outline" size="sm" className="border-blue-400 text-blue-300 hover:bg-blue-700/30" leftIcon={<PaperclipIcon className="h-4 w-4" />}>Upload Document</Button>}>
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

          <PixelCard variant="blue" title="Claim Notes" icon={<MessageSquareIcon className="h-5 w-5 text-blue-400" />} actions={<Button variant="outline" size="sm" className="border-blue-400 text-blue-300 hover:bg-blue-700/30" leftIcon={<MessageSquareIcon className="h-4 w-4" />}>Add Note</Button>}>
             {claim.notes.length > 0 ? (
                <ul className="space-y-4">
                    {claim.notes.map(note => (
                        <li key={note.id} className="flex space-x-3">
                            <img className="h-8 w-8 rounded-full" src={note.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(note.author)}&background=4A5568&color=E0E7FF`} alt={note.author} />
                            <div>
                                <div className="text-sm">
                                    <span className="font-medium text-text-on-dark-primary">{note.author}</span>
                                    <span className="text-text-on-dark-secondary"> &middot; {note.timestamp}</span>
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
            <Button variant="outline" size="sm" className="w-full mt-4 border-blue-400 text-blue-300 hover:bg-blue-700/30">View Risk Details</Button>
          </PixelCard>
          
           <PixelCard variant="blue" title="Actions">
                <div className="space-y-2">
                    <Button className="w-full" variant="primary">Approve Claim</Button>
                    <Button className="w-full" variant="danger">Reject Claim</Button>
                    <Button variant="outline" className="w-full border-slate-400 text-slate-300 hover:bg-slate-700/30">Flag for Review</Button>
                </div>
            </PixelCard>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-on-dark-secondary flex items-center">
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-text-on-dark-secondary mr-2 flex-shrink-0' })}
      {label}
    </dt>
    <dd className="mt-1 text-sm text-text-on-dark-primary ml-7">{value}</dd>
  </div>
);