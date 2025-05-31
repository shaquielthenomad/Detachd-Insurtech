import { ClaimStatus } from '../types';

export interface StoredClaim {
  id: string;
  claimNumber: string;
  policyholderName: string;
  dateOfLoss: string;
  claimType: string;
  status: ClaimStatus;
  amountClaimed: number;
  location: string;
  description: string;
  policyNumber?: string;
  submittedAt: string;
  riskScore: number;
  fraudAlerts: any[];
  documentFlags: any[];
  verificationData?: any;
  isInsuranceClaim: boolean;
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
  lastActivity?: string;
  auditTrail?: Array<{
    timestamp: string;
    event: string;
    user: string;
  }>;
  certificateIssued?: boolean;
}

export class ClaimsStorageService {
  private static readonly CLAIMS_KEY = 'detachd_claims';
  
  // Store a new claim
  static storeClaim(claimData: Omit<StoredClaim, 'id' | 'submittedAt' | 'lastActivity'>): StoredClaim {
    const claimId = `clm_${Date.now()}`;
    const now = new Date().toISOString();
    
    const storedClaim: StoredClaim = {
      ...claimData,
      id: claimId,
      submittedAt: now,
      lastActivity: now,
      auditTrail: [{
        timestamp: now,
        event: `Claim submitted by ${claimData.policyholderName}`,
        user: claimData.policyholderName
      }]
    };

    // Store individual claim
    localStorage.setItem(`claim_${claimId}`, JSON.stringify(storedClaim));

    // Update claims list
    const existingClaims = this.getAllClaims();
    existingClaims.unshift(storedClaim);
    localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(existingClaims));

    return storedClaim;
  }

  // Get all claims
  static getAllClaims(): StoredClaim[] {
    try {
      const claimsData = localStorage.getItem(this.CLAIMS_KEY);
      return claimsData ? JSON.parse(claimsData) : [];
    } catch (error) {
      console.error('Error retrieving claims:', error);
      return [];
    }
  }

  // Get claims for a specific user
  static getUserClaims(userId?: string): StoredClaim[] {
    if (!userId) return [];
    
    try {
      const userClaimsData = localStorage.getItem(`user_claims_${userId}`);
      if (userClaimsData) {
        return JSON.parse(userClaimsData);
      }
      
      // Fallback: filter all claims by user
      const allClaims = this.getAllClaims();
      return allClaims.filter(claim => 
        claim.policyholderName && userId.includes(claim.policyholderName.split(' ')[0].toLowerCase())
      );
    } catch (error) {
      console.error('Error retrieving user claims:', error);
      return [];
    }
  }

  // Get a specific claim by ID
  static getClaim(claimId: string): StoredClaim | null {
    try {
      const claimData = localStorage.getItem(`claim_${claimId}`);
      return claimData ? JSON.parse(claimData) : null;
    } catch (error) {
      console.error('Error retrieving claim:', error);
      return null;
    }
  }

  // Update a claim
  static updateClaim(claimId: string, updates: Partial<StoredClaim>): StoredClaim | null {
    try {
      const existingClaim = this.getClaim(claimId);
      if (!existingClaim) return null;

      const updatedClaim: StoredClaim = {
        ...existingClaim,
        ...updates,
        lastActivity: new Date().toISOString()
      };

      // Update individual claim
      localStorage.setItem(`claim_${claimId}`, JSON.stringify(updatedClaim));

      // Update in claims list
      const allClaims = this.getAllClaims();
      const claimIndex = allClaims.findIndex(claim => claim.id === claimId);
      if (claimIndex !== -1) {
        allClaims[claimIndex] = updatedClaim;
        localStorage.setItem(this.CLAIMS_KEY, JSON.stringify(allClaims));
      }

      return updatedClaim;
    } catch (error) {
      console.error('Error updating claim:', error);
      return null;
    }
  }

  // Add audit trail entry
  static addAuditEntry(claimId: string, event: string, user: string): boolean {
    try {
      const claim = this.getClaim(claimId);
      if (!claim) return false;

      const auditEntry = {
        timestamp: new Date().toISOString(),
        event,
        user
      };

      claim.auditTrail = claim.auditTrail || [];
      claim.auditTrail.unshift(auditEntry);
      
      return this.updateClaim(claimId, { auditTrail: claim.auditTrail }) !== null;
    } catch (error) {
      console.error('Error adding audit entry:', error);
      return false;
    }
  }

  // Get claims statistics
  static getClaimsStats(): {
    total: number;
    byStatus: Record<ClaimStatus, number>;
    totalAmount: number;
    avgRiskScore: number;
  } {
    const claims = this.getAllClaims();
    
    const stats = {
      total: claims.length,
      byStatus: {
        [ClaimStatus.SUBMITTED]: 0,
        [ClaimStatus.IN_REVIEW]: 0,
        [ClaimStatus.APPROVED]: 0,
        [ClaimStatus.REJECTED]: 0,
        [ClaimStatus.CLOSED]: 0
      } as Record<ClaimStatus, number>,
      totalAmount: 0,
      avgRiskScore: 0
    };

    claims.forEach(claim => {
      stats.byStatus[claim.status]++;
      stats.totalAmount += claim.amountClaimed;
    });

    stats.avgRiskScore = claims.length > 0 
      ? claims.reduce((sum, claim) => sum + claim.riskScore, 0) / claims.length 
      : 0;

    return stats;
  }

  // Clear all claims (for testing/demo purposes)
  static clearAllClaims(): void {
    localStorage.removeItem(this.CLAIMS_KEY);
    // Clear individual claim entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('claim_') || key.startsWith('user_claims_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Generate mock insurer claims (for admin views) with real stored claims mixed in
  static getInsurerViewClaims(): StoredClaim[] {
    const realClaims = this.getAllClaims();
    
    // Create mock claims for other policyholders that show variety
    const mockClaims: StoredClaim[] = [
      {
        id: 'clm_mock_001',
        claimNumber: 'DET-001',
        policyholderName: 'John Smith',
        dateOfLoss: '2024-07-15',
        claimType: 'Auto Accident',
        status: ClaimStatus.IN_REVIEW,
        amountClaimed: 25000,
        location: 'Main St & Oak Ave, Cape Town',
        description: 'Intersection collision during peak traffic',
        policyNumber: 'POL-12345',
        submittedAt: '2024-07-16T10:30:00Z',
        riskScore: 75,
        fraudAlerts: [],
        documentFlags: [],
        isInsuranceClaim: true,
        assignedTo: 'Sarah Johnson',
        priority: 'high',
        lastActivity: '2024-07-16T15:22:00Z'
      },
      {
        id: 'clm_mock_002',
        claimNumber: 'DET-002',
        policyholderName: 'Jane Doe',
        dateOfLoss: '2024-06-20',
        claimType: 'Property Damage',
        status: ClaimStatus.SUBMITTED,
        amountClaimed: 12000,
        location: '123 Beach Road, Cape Town',
        description: 'Water damage from burst pipe',
        policyNumber: 'POL-67890',
        submittedAt: '2024-06-21T09:15:00Z',
        riskScore: 30,
        fraudAlerts: [],
        documentFlags: [],
        isInsuranceClaim: true,
        assignedTo: 'Mike Wilson',
        priority: 'medium',
        lastActivity: '2024-07-14T11:45:00Z'
      },
      {
        id: 'clm_mock_003',
        claimNumber: 'DET-003',
        policyholderName: 'Bob Johnson',
        dateOfLoss: '2024-05-01',
        claimType: 'Theft',
        status: ClaimStatus.APPROVED,
        amountClaimed: 8000,
        location: '456 Garden Street, Cape Town',
        description: 'Laptop and electronics stolen from home',
        policyNumber: 'POL-11111',
        submittedAt: '2024-05-02T14:20:00Z',
        riskScore: 20,
        fraudAlerts: [],
        documentFlags: [],
        isInsuranceClaim: true,
        assignedTo: 'Lisa Chen',
        priority: 'low',
        lastActivity: '2024-07-10T16:30:00Z'
      }
    ];

    // Merge real claims with mock claims, real claims first
    return [...realClaims, ...mockClaims.filter(mock => 
      !realClaims.some(real => real.claimNumber === mock.claimNumber)
    )];
  }
} 