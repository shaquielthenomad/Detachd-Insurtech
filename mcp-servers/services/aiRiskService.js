const { openAIClient, config, containers } = require('../config/azure');

class AIRiskService {
  /**
   * Calculate comprehensive risk score using Azure OpenAI
   */
  static async calculateRiskScore(userId, riskData = {}) {
    try {
      const {
        claimsHistory = [],
        drivingRecord = {},
        personalInfo = {},
        financialHistory = {},
        geographicFactors = {},
        behavioralData = {}
      } = riskData;

      // Prepare data for AI analysis
      const riskAnalysisPrompt = this.buildRiskAnalysisPrompt({
        userId,
        claimsHistory,
        drivingRecord,
        personalInfo,
        financialHistory,
        geographicFactors,
        behavioralData
      });

      // Call Azure OpenAI for risk analysis
      const completion = await openAIClient.getChatCompletions(
        config.openAIDeploymentName,
        [
          {
            role: 'system',
            content: `You are an expert insurance risk analyst specializing in South African insurance markets. 
            Analyze the provided data and return a JSON response with risk score (0-100), risk level (Low/Medium/High), 
            key risk factors, and recommendations. Be precise and data-driven.`
          },
          {
            role: 'user',
            content: riskAnalysisPrompt
          }
        ],
        {
          maxTokens: 1000,
          temperature: 0.3, // Lower temperature for more consistent results
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      );

      const aiResponse = completion.choices[0].message.content;
      const riskAssessment = this.parseAIResponse(aiResponse);

      // Store assessment in Cosmos DB
      await this.storeRiskAssessment(userId, riskAssessment, riskData);

      return riskAssessment;
    } catch (error) {
      console.error('Error calculating risk score:', error);
      // Return fallback risk assessment
      return this.getFallbackRiskAssessment(riskData);
    }
  }

  /**
   * Build comprehensive risk analysis prompt
   */
  static buildRiskAnalysisPrompt(data) {
    return `
SOUTH AFRICAN INSURANCE RISK ASSESSMENT

User ID: ${data.userId}

CLAIMS HISTORY:
- Total Claims: ${data.claimsHistory.length}
- Recent Claims (last 2 years): ${data.claimsHistory.filter(c => new Date(c.dateOfLoss) > new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)).length}
- Total Claim Amount: R${data.claimsHistory.reduce((sum, c) => sum + (c.amountClaimed || 0), 0).toLocaleString()}
- Claim Types: ${[...new Set(data.claimsHistory.map(c => c.claimType))].join(', ')}

DRIVING RECORD:
- License Type: ${data.drivingRecord.licenseType || 'Unknown'}
- Years Licensed: ${data.drivingRecord.yearsLicensed || 'Unknown'}
- Traffic Violations: ${data.drivingRecord.violations || 0}
- Accidents: ${data.drivingRecord.accidents || 0}
- DUI/DWI: ${data.drivingRecord.dui ? 'Yes' : 'No'}

PERSONAL INFORMATION:
- Age: ${data.personalInfo.age || 'Unknown'}
- Gender: ${data.personalInfo.gender || 'Unknown'}
- Marital Status: ${data.personalInfo.maritalStatus || 'Unknown'}
- Education Level: ${data.personalInfo.education || 'Unknown'}
- Employment Status: ${data.personalInfo.employment || 'Unknown'}

FINANCIAL HISTORY:
- Credit Score: ${data.financialHistory.creditScore || 'Unknown'}
- Payment History: ${data.financialHistory.paymentHistory || 'Unknown'}
- Income Level: ${data.financialHistory.incomeLevel || 'Unknown'}
- Debt-to-Income Ratio: ${data.financialHistory.debtToIncome || 'Unknown'}

GEOGRAPHIC FACTORS:
- Province: ${data.geographicFactors.province || 'Unknown'}
- City: ${data.geographicFactors.city || 'Unknown'}
- Crime Rate Area: ${data.geographicFactors.crimeRate || 'Unknown'}
- Weather Risk: ${data.geographicFactors.weatherRisk || 'Unknown'}

BEHAVIORAL DATA:
- App Usage Pattern: ${data.behavioralData.appUsage || 'Unknown'}
- Communication Responsiveness: ${data.behavioralData.responsiveness || 'Unknown'}
- Document Submission Timeline: ${data.behavioralData.documentTimeliness || 'Unknown'}

Please analyze this data and provide a JSON response with:
1. riskScore (0-100, where 0 is highest risk, 100 is lowest risk)
2. riskLevel (Low/Medium/High)
3. keyRiskFactors (array of top 5 risk factors)
4. protectiveFactors (array of positive factors)
5. recommendations (array of specific recommendations)
6. confidence (0-100, how confident you are in this assessment)

Consider South African specific factors: crime rates, economic conditions, road conditions, weather patterns, and regulatory environment.
    `;
  }

  /**
   * Parse AI response and validate structure
   */
  static parseAIResponse(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (parsed.riskScore !== undefined && parsed.riskLevel && parsed.keyRiskFactors) {
          return {
            riskScore: Math.max(0, Math.min(100, parsed.riskScore)),
            trustScore: Math.max(0, Math.min(100, parsed.riskScore)), // Keep in sync
            riskLevel: parsed.riskLevel,
            keyRiskFactors: parsed.keyRiskFactors || [],
            protectiveFactors: parsed.protectiveFactors || [],
            recommendations: parsed.recommendations || [],
            confidence: parsed.confidence || 75,
            calculatedAt: new Date().toISOString(),
            source: 'azure-openai'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    
    // Return fallback if parsing fails
    return this.getFallbackRiskAssessment();
  }

  /**
   * Store risk assessment in Cosmos DB
   */
  static async storeRiskAssessment(userId, assessment, originalData) {
    try {
      const riskAssessmentRecord = {
        id: `${userId}-${Date.now()}`,
        userId,
        assessment,
        inputData: originalData,
        createdAt: new Date().toISOString()
      };

      await containers.riskAssessments.items.create(riskAssessmentRecord);
    } catch (error) {
      console.error('Error storing risk assessment:', error);
      // Don't throw - assessment can still be returned
    }
  }

  /**
   * Get risk assessment history for user
   */
  static async getRiskHistory(userId, limit = 10) {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit',
        parameters: [
          { name: '@userId', value: userId },
          { name: '@limit', value: limit }
        ]
      };

      const { resources } = await containers.riskAssessments.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error fetching risk history:', error);
      return [];
    }
  }

  /**
   * Detect fraud patterns using AI
   */
  static async detectFraudPatterns(claimData) {
    try {
      const fraudAnalysisPrompt = `
FRAUD DETECTION ANALYSIS

Claim Details:
- Claim Type: ${claimData.claimType}
- Amount Claimed: R${claimData.amountClaimed?.toLocaleString()}
- Date of Loss: ${claimData.dateOfLoss}
- Description: ${claimData.description}
- Location: ${claimData.location}
- Time of Day: ${claimData.timeOfDay}
- Weather Conditions: ${claimData.weatherConditions}
- Witnesses: ${claimData.witnesses?.length || 0}
- Police Report: ${claimData.policeReport ? 'Yes' : 'No'}

Historical Pattern:
- Previous Claims: ${claimData.claimHistory?.length || 0}
- Time Since Last Claim: ${claimData.daysSinceLastClaim || 'N/A'} days

Analyze this claim for potential fraud indicators. Return JSON with:
1. fraudRisk (0-100, where 100 is highest fraud risk)
2. flaggedIndicators (array of specific red flags)
3. recommendedActions (array of investigation steps)
4. confidence (0-100)
      `;

      const completion = await openAIClient.getChatCompletions(
        config.openAIDeploymentName,
        [
          {
            role: 'system',
            content: 'You are a fraud detection specialist for South African insurance companies. Analyze claims for suspicious patterns and provide actionable insights.'
          },
          {
            role: 'user',
            content: fraudAnalysisPrompt
          }
        ],
        { maxTokens: 800, temperature: 0.2 }
      );

      const aiResponse = completion.choices[0].message.content;
      return this.parseFraudResponse(aiResponse);
    } catch (error) {
      console.error('Error detecting fraud patterns:', error);
      return { fraudRisk: 25, flaggedIndicators: [], recommendedActions: [], confidence: 50 };
    }
  }

  /**
   * Parse fraud detection response
   */
  static parseFraudResponse(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          fraudRisk: Math.max(0, Math.min(100, parsed.fraudRisk || 25)),
          flaggedIndicators: parsed.flaggedIndicators || [],
          recommendedActions: parsed.recommendedActions || [],
          confidence: parsed.confidence || 50,
          analyzedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error parsing fraud response:', error);
    }
    
    return { fraudRisk: 25, flaggedIndicators: [], recommendedActions: [], confidence: 50 };
  }

  /**
   * Fallback risk assessment when AI fails
   */
  static getFallbackRiskAssessment(riskData = {}) {
    const claimsCount = riskData.claimsHistory?.length || 0;
    const violations = riskData.drivingRecord?.violations || 0;
    
    let baseScore = 80; // Start with good score
    
    // Adjust based on available data
    baseScore -= (claimsCount * 5); // -5 per claim
    baseScore -= (violations * 10); // -10 per violation
    
    const finalScore = Math.max(20, Math.min(95, baseScore));
    
    return {
      riskScore: finalScore,
      trustScore: finalScore,
      riskLevel: finalScore >= 80 ? 'Low' : finalScore >= 60 ? 'Medium' : 'High',
      keyRiskFactors: [
        claimsCount > 2 ? 'Multiple previous claims' : null,
        violations > 0 ? 'Traffic violations on record' : null
      ].filter(Boolean),
      protectiveFactors: ['Long-standing customer', 'Verified identity'],
      recommendations: ['Continue safe driving practices', 'Consider defensive driving course'],
      confidence: 60,
      calculatedAt: new Date().toISOString(),
      source: 'fallback-algorithm'
    };
  }
}

module.exports = AIRiskService; 