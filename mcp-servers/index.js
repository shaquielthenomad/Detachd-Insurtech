const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const Joi = require('joi');
require('dotenv').config();

// Import services
const UserService = require('./services/userService');
const AIRiskService = require('./services/aiRiskService');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyStore: new Map(),
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
};

app.use(rateLimiterMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================================
// USER MANAGEMENT MCP ENDPOINTS
// ============================================================================

/**
 * GET /mcp/users/:userId
 * Get user profile from Azure Cosmos DB
 * Replaces hardcoded Jacob Doe data
 */
app.get('/mcp/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    const schema = Joi.string().alphanum().min(3).max(50).required();
    const { error } = schema.validate(userId);
    if (error) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userProfile = await UserService.getUserProfile(userId);
    res.json({
      success: true,
      data: userProfile,
      source: 'azure-cosmos-db'
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error.message 
    });
  }
});

/**
 * GET /mcp/users/:userId/claims
 * Get user claims history from Azure Cosmos DB
 */
app.get('/mcp/users/:userId/claims', async (req, res) => {
  try {
    const { userId } = req.params;
    const claims = await UserService.getUserClaims(userId);
    
    res.json({
      success: true,
      data: claims,
      count: claims.length,
      source: 'azure-cosmos-db'
    });
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user claims',
      message: error.message 
    });
  }
});

/**
 * PUT /mcp/users/:userId/verification
 * Update user verification status
 */
app.put('/mcp/users/:userId/verification', async (req, res) => {
  try {
    const { userId } = req.params;
    const verificationData = req.body;
    
    // Validate input
    const schema = Joi.object({
      level: Joi.string().valid('Unverified', 'Basic Verified', 'Standard Verified', 'Premium Verified', 'Elite Verified').required(),
      date: Joi.string().isoDate().required(),
      method: Joi.string().required(),
      documents: Joi.array().items(Joi.string())
    });
    
    const { error } = schema.validate(verificationData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await UserService.updateVerificationStatus(userId, verificationData);
    res.json({
      success: true,
      data: result,
      message: 'Verification status updated successfully'
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ 
      error: 'Failed to update verification status',
      message: error.message 
    });
  }
});

// ============================================================================
// AI RISK ASSESSMENT MCP ENDPOINTS
// ============================================================================

/**
 * POST /mcp/risk/calculate
 * Calculate AI-powered risk score using Azure OpenAI
 * Replaces hardcoded 82/100 risk scores
 */
app.post('/mcp/risk/calculate', async (req, res) => {
  try {
    const { userId, riskData } = req.body;
    
    // Validate input
    const schema = Joi.object({
      userId: Joi.string().required(),
      riskData: Joi.object({
        claimsHistory: Joi.array().optional(),
        drivingRecord: Joi.object().optional(),
        personalInfo: Joi.object().optional(),
        financialHistory: Joi.object().optional(),
        geographicFactors: Joi.object().optional(),
        behavioralData: Joi.object().optional()
      }).optional()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const riskAssessment = await AIRiskService.calculateRiskScore(userId, riskData);
    
    // Update user's risk score in the database
    await UserService.updateRiskScore(userId, riskAssessment.riskScore, riskAssessment.keyRiskFactors);
    
    res.json({
      success: true,
      data: riskAssessment,
      message: 'Risk assessment completed successfully'
    });
  } catch (error) {
    console.error('Error calculating risk score:', error);
    res.status(500).json({ 
      error: 'Failed to calculate risk score',
      message: error.message 
    });
  }
});

/**
 * GET /mcp/risk/:userId/history
 * Get risk assessment history
 */
app.get('/mcp/risk/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const history = await AIRiskService.getRiskHistory(userId, parseInt(limit));
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching risk history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch risk history',
      message: error.message 
    });
  }
});

/**
 * POST /mcp/fraud/detect
 * Detect fraud patterns in claims using AI
 */
app.post('/mcp/fraud/detect', async (req, res) => {
  try {
    const claimData = req.body;
    
    const fraudAnalysis = await AIRiskService.detectFraudPatterns(claimData);
    res.json({
      success: true,
      data: fraudAnalysis,
      message: 'Fraud detection analysis completed'
    });
  } catch (error) {
    console.error('Error detecting fraud patterns:', error);
    res.status(500).json({ 
      error: 'Failed to detect fraud patterns',
      message: error.message 
    });
  }
});

// ============================================================================
// SEARCH AND ANALYTICS ENDPOINTS
// ============================================================================

/**
 * POST /mcp/users/search
 * Search users by criteria (for admin/insurer use)
 */
app.post('/mcp/users/search', async (req, res) => {
  try {
    const criteria = req.body;
    
    const users = await UserService.searchUsers(criteria);
    res.json({
      success: true,
      data: users,
      count: users.length,
      criteria: criteria
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      error: 'Failed to search users',
      message: error.message 
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'GET /mcp/users/:userId',
      'GET /mcp/users/:userId/claims',
      'PUT /mcp/users/:userId/verification',
      'POST /mcp/risk/calculate',
      'GET /mcp/risk/:userId/history',
      'POST /mcp/fraud/detect',
      'POST /mcp/users/search'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Detachd MCP Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Ready to serve Azure-backed insurance data!`);
}); 