const { containers } = require('../config/azure');
const { v4: uuidv4 } = require('uuid');

class UserService {
  /**
   * Get user profile from Cosmos DB instead of hardcoded data
   */
  static async getUserProfile(userId) {
    try {
      const { resource: user } = await containers.users.item(userId, userId).read();
      
      if (!user) {
        // Create default user if not exists (for demo)
        return await this.createDefaultUser(userId);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatarUrl: user.avatarUrl,
        memberSince: user.memberSince,
        verificationLevel: user.verificationLevel,
        riskScore: user.riskScore,
        trustScore: user.trustScore,
        totalClaims: user.totalClaims,
        successfulClaims: user.successfulClaims,
        policyNumber: user.policyNumber,
        lastUpdated: user._ts
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Create default user (replaces hardcoded Jacob Doe)
   */
  static async createDefaultUser(userId) {
    const defaultUser = {
      id: userId,
      name: 'Jacob Doe',
      email: 'j.doe@gmail.com',
      phone: '084 497 6894',
      address: '145 Long Street, Cape Town, 8001',
      role: 'policyholder',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      memberSince: 'March 2023',
      verificationLevel: 'Premium Verified',
      riskScore: 82,
      trustScore: 82,
      totalClaims: 3,
      successfulClaims: 3,
      policyNumber: 'POL-2023-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await containers.users.items.create(defaultUser);
      return defaultUser;
    } catch (error) {
      console.error('Error creating default user:', error);
      return defaultUser; // Return data even if DB save fails
    }
  }

  /**
   * Update user risk score dynamically
   */
  static async updateRiskScore(userId, newRiskScore, factors = []) {
    try {
      const { resource: user } = await containers.users.item(userId, userId).read();
      
      if (user) {
        user.riskScore = newRiskScore;
        user.trustScore = newRiskScore; // Keep them in sync
        user.riskFactors = factors;
        user.lastRiskUpdate = new Date().toISOString();
        
        await containers.users.item(userId, userId).replace(user);
      }
      
      return { success: true, newRiskScore };
    } catch (error) {
      console.error('Error updating risk score:', error);
      throw new Error('Failed to update risk score');
    }
  }

  /**
   * Get user claims history from Cosmos DB
   */
  static async getUserClaims(userId) {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.dateOfLoss DESC',
        parameters: [{ name: '@userId', value: userId }]
      };

      const { resources: claims } = await containers.claims.items.query(querySpec).fetchAll();
      return claims;
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return [];
    }
  }

  /**
   * Create or update user verification status
   */
  static async updateVerificationStatus(userId, verificationData) {
    try {
      const { resource: user } = await containers.users.item(userId, userId).read();
      
      if (user) {
        user.verificationLevel = verificationData.level;
        user.verificationDate = verificationData.date;
        user.verificationMethod = verificationData.method;
        user.documentsVerified = verificationData.documents;
        
        await containers.users.item(userId, userId).replace(user);
      }
      
      return { success: true, verificationLevel: verificationData.level };
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  /**
   * Search users by criteria (for admin/insurer use)
   */
  static async searchUsers(criteria = {}) {
    try {
      let query = 'SELECT * FROM c WHERE 1=1';
      const parameters = [];

      if (criteria.role) {
        query += ' AND c.role = @role';
        parameters.push({ name: '@role', value: criteria.role });
      }

      if (criteria.verificationLevel) {
        query += ' AND c.verificationLevel = @verificationLevel';
        parameters.push({ name: '@verificationLevel', value: criteria.verificationLevel });
      }

      if (criteria.riskScoreMin) {
        query += ' AND c.riskScore >= @riskScoreMin';
        parameters.push({ name: '@riskScoreMin', value: criteria.riskScoreMin });
      }

      if (criteria.riskScoreMax) {
        query += ' AND c.riskScore <= @riskScoreMax';
        parameters.push({ name: '@riskScoreMax', value: criteria.riskScoreMax });
      }

      const querySpec = { query, parameters };
      const { resources: users } = await containers.users.items.query(querySpec).fetchAll();
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

module.exports = UserService; 