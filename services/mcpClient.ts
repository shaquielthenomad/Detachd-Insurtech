import { User, Claim } from '../types';

const MCP_BASE_URL = process.env.REACT_APP_MCP_BASE_URL || 'http://localhost:3001';

interface MCPResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  source?: string;
  count?: number;
}

interface RiskAssessment {
  riskScore: number;
  trustScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  keyRiskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  confidence: number;
  calculatedAt: string;
  source: string;
}

interface FraudAnalysis {
  fraudRisk: number;
  flaggedIndicators: string[];
  recommendedActions: string[];
  confidence: number;
  analyzedAt: string;
}

interface VerificationData {
  level: 'Unverified' | 'Basic Verified' | 'Standard Verified' | 'Premium Verified' | 'Elite Verified';
  date: string;
  method: string;
  documents?: string[];
}

class MCPClient {
  private baseURL: string;

  constructor() {
    this.baseURL = MCP_BASE_URL;
  }

  /**
   * Generic API call helper
   */
  private async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<MCPResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MCP API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiCall<any>('/health');
      return response.success !== false;
    } catch (error) {
      console.error('MCP health check failed:', error);
      return false;
    }
  }

  // ============================================================================
  // USER MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get user profile from Azure Cosmos DB
   * Replaces hardcoded JACOB_DOE_PERSONA
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await this.apiCall<User>(`/mcp/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile from MCP:', error);
      // Fallback to local data if MCP fails
      throw error;
    }
  }

  /**
   * Get user claims history from Azure Cosmos DB
   */
  async getUserClaims(userId: string): Promise<Claim[]> {
    try {
      const response = await this.apiCall<Claim[]>(`/mcp/users/${userId}/claims`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user claims from MCP:', error);
      return [];
    }
  }

  /**
   * Update user verification status
   */
  async updateVerificationStatus(userId: string, verificationData: VerificationData): Promise<boolean> {
    try {
      const response = await this.apiCall<any>(`/mcp/users/${userId}/verification`, {
        method: 'PUT',
        body: JSON.stringify(verificationData),
      });
      return response.success;
    } catch (error) {
      console.error('Failed to update verification status:', error);
      return false;
    }
  }

  /**
   * Search users by criteria (admin/insurer use)
   */
  async searchUsers(criteria: any): Promise<User[]> {
    try {
      const response = await this.apiCall<User[]>('/mcp/users/search', {
        method: 'POST',
        body: JSON.stringify(criteria),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  // ============================================================================
  // AI RISK ASSESSMENT METHODS
  // ============================================================================

  /**
   * Calculate AI-powered risk score
   * Replaces hardcoded 82/100 risk scores with dynamic Azure OpenAI calculations
   */
  async calculateRiskScore(userId: string, riskData?: any): Promise<RiskAssessment> {
    try {
      const response = await this.apiCall<RiskAssessment>('/mcp/risk/calculate', {
        method: 'POST',
        body: JSON.stringify({ userId, riskData }),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to calculate risk score:', error);
      // Return fallback assessment
      return {
        riskScore: 82,
        trustScore: 82,
        riskLevel: 'Low',
        keyRiskFactors: ['Assessment temporarily unavailable'],
        protectiveFactors: ['Verified user'],
        recommendations: ['Continue current practices'],
        confidence: 50,
        calculatedAt: new Date().toISOString(),
        source: 'fallback'
      };
    }
  }

  /**
   * Get risk assessment history
   */
  async getRiskHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.apiCall<any[]>(`/mcp/risk/${userId}/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get risk history:', error);
      return [];
    }
  }

  /**
   * Detect fraud patterns in claims
   */
  async detectFraudPatterns(claimData: any): Promise<FraudAnalysis> {
    try {
      const response = await this.apiCall<FraudAnalysis>('/mcp/fraud/detect', {
        method: 'POST',
        body: JSON.stringify(claimData),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to detect fraud patterns:', error);
      return {
        fraudRisk: 25,
        flaggedIndicators: [],
        recommendedActions: [],
        confidence: 50,
        analyzedAt: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Get comprehensive user data in a single call
   * Combines profile, claims, and risk assessment
   */
  async getComprehensiveUserData(userId: string): Promise<{
    profile: User;
    claims: Claim[];
    riskAssessment: RiskAssessment;
  }> {
    try {
      // Make parallel calls to MCP servers
      const [profileResponse, claimsResponse, riskResponse] = await Promise.allSettled([
        this.getUserProfile(userId),
        this.getUserClaims(userId),
        this.calculateRiskScore(userId)
      ]);

      return {
        profile: profileResponse.status === 'fulfilled' ? profileResponse.value : null,
        claims: claimsResponse.status === 'fulfilled' ? claimsResponse.value : [],
        riskAssessment: riskResponse.status === 'fulfilled' ? riskResponse.value : null
      };
    } catch (error) {
      console.error('Failed to get comprehensive user data:', error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Simple in-memory cache for frequently accessed data
   */
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Get data from cache or fetch from MCP
   */
  async getCachedData<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlMinutes: number = 5
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < (cached.ttl * 60 * 1000)) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: ttlMinutes
      });
      return data;
    } catch (error) {
      // If fresh fetch fails, return stale cache if available
      if (cached) {
        console.warn('Using stale cache due to fetch failure:', error);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }
}

// Create singleton instance
export const mcpClient = new MCPClient();

// Export class for testing
export default MCPClient; 