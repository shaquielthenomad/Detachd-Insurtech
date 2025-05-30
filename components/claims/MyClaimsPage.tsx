import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Claim, ClaimStatus, UserRole } from '../../types';
import { ROUTES } from '../../constants';
import { 
  PlusCircleIcon, 
  ChevronRightIcon, 
  FileTextIcon, 
  DownloadIcon, 
  CheckCircleIcon,
  SearchIcon,
  FilterIcon,
  UsersIcon,
  CalendarIcon,
  EyeIcon,
  AlertTriangleIcon,
  XCircleIcon
} from '../common/Icon'; 
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ClaimsStorageService, StoredClaim } from '../../services/claimsStorage';

// Extended claim interface for insurer view
interface InsurerClaim extends StoredClaim {
  // Add any additional insurer-specific fields if needed
}

const getStatusBadgeStyles = (status: ClaimStatus): string => {
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

const getPriorityBadgeStyles = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high': return 'text-red-300 bg-red-700/30 border-red-500';
    case 'medium': return 'text-yellow-300 bg-yellow-700/30 border-yellow-500';
    case 'low': return 'text-blue-300 bg-blue-700/30 border-blue-500';
    default: return 'text-slate-400 bg-slate-700/30 border-slate-600';
  }
};

export const MyClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<InsurerClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'high' | 'medium' | 'low' | 'all'>('all');

  const isInsurer = user?.role === 'insurer_admin' || user?.role === 'super_admin';

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      try {
        if (isInsurer) {
          // For insurers, get all claims across policyholders
          const allClaims = ClaimsStorageService.getInsurerViewClaims();
          setClaims(allClaims);
        } else {
          // For policyholders, get their claims only
          const userClaims = ClaimsStorageService.getUserClaims(user?.id);
          
          // If no user-specific claims found, try to get claims by name
          if (userClaims.length === 0 && user?.name) {
            const allClaims = ClaimsStorageService.getAllClaims();
            const nameBasedClaims = allClaims.filter(claim => 
              claim.policyholderName.toLowerCase().includes(user.name.toLowerCase())
            );
            setClaims(nameBasedClaims);
          } else {
            setClaims(userClaims);
          }
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
        setClaims([]);
      }
      
      setIsLoading(false);
    };
    
    fetchClaims();
  }, [user?.name, user?.id, isInsurer]);

  // Filter claims based on search and filters
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyholderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.policyNumber && claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return <LoadingSpinner message={isInsurer ? "Loading claims..." : "Loading your claims..."} />;
  }

  if (isInsurer) {
    // Insurer Claims Management View
    return (
      <div>
        <PageHeader 
          title="Claims Management" 
          subtitle={`${claims.length} total claims • ${claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length} pending review • ${claims.filter(c => c.priority === 'high').length} high priority`}
          actions={
            <div className="flex space-x-3">
              <Button variant="outline" leftIcon={<FilterIcon className="h-5 w-5" />}>
                Export Data
              </Button>
              <Button variant="primary" leftIcon={<UsersIcon className="h-5 w-5" />}>
                Assign Claims
              </Button>
            </div>
          }
        />

        {/* Search and Filters */}
        <PixelCard variant="blue" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input 
                id="search-claims"
                type="text"
                placeholder="Search by claim number, policyholder, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<SearchIcon className="h-5 w-5 text-slate-400"/>}
                className="bg-slate-700 border-slate-600 text-text-on-dark-primary placeholder-slate-400"
              />
            </div>
            <div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-text-on-dark-primary rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value={ClaimStatus.SUBMITTED}>Submitted</option>
                <option value={ClaimStatus.IN_REVIEW}>In Review</option>
                <option value={ClaimStatus.APPROVED}>Approved</option>
                <option value={ClaimStatus.REJECTED}>Rejected</option>
                <option value={ClaimStatus.CLOSED}>Closed</option>
              </select>
            </div>
            <div>
              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value as 'high' | 'medium' | 'low' | 'all')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-text-on-dark-primary rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </PixelCard>

        {/* Claims Table/List */}
        {filteredClaims.length === 0 ? (
          <PixelCard variant="blue">
            <div className="text-center py-12">
              <FileTextIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
              <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No claims found</h3>
              <p className="mt-1 text-sm text-text-on-dark-secondary">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No claims have been submitted yet.'}
              </p>
            </div>
          </PixelCard>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <PixelCard key={claim.id} variant="blue" className="hover:border-blue-400 transition-colors">
                <div className="p-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="block">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-blue-300 hover:underline">
                            Claim #{claim.claimNumber}
                          </h3>
                          {claim.priority && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadgeStyles(claim.priority)}`}>
                              {claim.priority.toUpperCase()}
                            </span>
                          )}
                          {claim.riskScore && claim.riskScore > 70 && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full border border-red-500 text-red-300 bg-red-700/30">
                              HIGH RISK ({claim.riskScore}%)
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-text-on-dark-secondary">
                          <div>Policyholder: <span className="text-text-on-dark-primary">{claim.policyholderName}</span></div>
                          <div>Type: <span className="text-text-on-dark-primary">{claim.claimType}</span></div>
                          {claim.policyNumber && (
                            <div>Policy: <span className="text-text-on-dark-primary">{claim.policyNumber}</span></div>
                          )}
                          {claim.assignedTo && (
                            <div>Assigned to: <span className="text-text-on-dark-primary">{claim.assignedTo}</span></div>
                          )}
                        </div>
                      </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                      {claim.status === ClaimStatus.APPROVED && (
                        <Link 
                          to="/test-certificate"
                          className="flex items-center px-3 py-2 bg-green-700/30 text-green-300 rounded-md hover:bg-green-700/50 transition-colors border border-green-500/50"
                          title="Download Certificate"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            {(() => {
                              const savedClaimState = localStorage.getItem(`claim_${claim.id}`);
                              const certificateIssued = savedClaimState ? JSON.parse(savedClaimState).certificateIssued : false;
                              return certificateIssued ? 'Certificate Issued' : 'Certificate Available';
                            })()}
                          </span>
                        </Link>
                      )}
                      <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="text-text-on-dark-secondary hover:text-blue-300">
                        <ChevronRightIcon className="h-6 w-6" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 text-sm text-text-on-dark-secondary">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium mr-1">Date:</span>
                        {new Date(claim.dateOfLoss).toLocaleDateString()}
                      </div>
                      {claim.amountClaimed && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Amount:</span>
                          R {claim.amountClaimed.toLocaleString()}
                        </div>
                      )}
                      {claim.lastActivity && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">Last Activity:</span>
                          {new Date(claim.lastActivity).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                </div>
              </PixelCard>
            ))}
            
            {/* Claims Management Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <PixelCard variant="blue" className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {claims.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW).length}
                  </div>
                  <div className="text-sm text-text-on-dark-secondary">Pending Review</div>
                </div>
              </PixelCard>
              <PixelCard variant="blue" className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {claims.filter(c => c.status === ClaimStatus.APPROVED).length}
                  </div>
                  <div className="text-sm text-text-on-dark-secondary">Approved</div>
                </div>
              </PixelCard>
              <PixelCard variant="blue" className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {claims.filter(c => c.priority === 'high').length}
                  </div>
                  <div className="text-sm text-text-on-dark-secondary">High Priority</div>
                </div>
              </PixelCard>
              <PixelCard variant="blue" className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {claims.filter(c => c.riskScore && c.riskScore > 70).length}
                  </div>
                  <div className="text-sm text-text-on-dark-secondary">High Risk</div>
                </div>
              </PixelCard>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Policyholder "My Claims" View (original functionality)
  return (
    <div>
      <PageHeader 
        title="My Claims" 
        subtitle={`${claims.length} total claims • ${claims.filter(c => c.status === ClaimStatus.APPROVED).length} approved`}
        actions={
          <Link to={ROUTES.NEW_CLAIM}>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
              Start a New Claim
            </Button>
          </Link>
        }
      />

      {claims.length === 0 ? (
        <PixelCard variant="blue">
          <div className="text-center py-12">
            <FileTextIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
            <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No claims yet</h3>
            <p className="mt-1 text-sm text-text-on-dark-secondary">You haven't submitted any claims yet. Start a new claim to get started.</p>
            <div className="mt-6">
              <Link to={ROUTES.NEW_CLAIM}>
                <Button variant="primary" leftIcon={<PlusCircleIcon className="h-5 w-5" />}>
                  Start a Claim
                </Button>
              </Link>
            </div>
          </div>
        </PixelCard>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <PixelCard key={claim.id} variant="blue" className="hover:border-blue-400 transition-colors">
              <div className="p-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="block">
                      <h3 className="text-lg font-semibold text-blue-300 hover:underline">
                        Claim #{claim.claimNumber}
                      </h3>
                      <p className="text-sm text-text-on-dark-secondary">{claim.claimType}</p>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    {claim.status === ClaimStatus.APPROVED && (
                      <>
                        <Link 
                          to="/test-certificate"
                          className="flex items-center px-3 py-2 bg-green-700/30 text-green-300 rounded-md hover:bg-green-700/50 transition-colors border border-green-500/50"
                          title="Download Certificate"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Certificate</span>
                        </Link>
                      </>
                    )}
                    <Link to={`${ROUTES.CLAIMS}/${claim.id}`} className="text-text-on-dark-secondary hover:text-blue-300">
                      <ChevronRightIcon className="h-6 w-6" />
                    </Link>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-text-on-dark-secondary">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Date:</span>
                      {new Date(claim.dateOfLoss).toLocaleDateString()}
                    </div>
                    {claim.amountClaimed && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Amount:</span>
                        R {claim.amountClaimed.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeStyles(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              </div>
            </PixelCard>
          ))}
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {claims.filter(c => c.status === ClaimStatus.APPROVED).length}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Approved Claims</div>
              </div>
            </PixelCard>
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {claims.filter(c => c.status === ClaimStatus.IN_REVIEW).length}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Under Review</div>
              </div>
            </PixelCard>
            <PixelCard variant="blue" className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  R {claims.filter(c => c.status === ClaimStatus.APPROVED).reduce((sum, claim) => sum + (claim.amountClaimed || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-text-on-dark-secondary">Total Approved</div>
              </div>
            </PixelCard>
          </div>
        </div>
      )}
    </div>
  );
};