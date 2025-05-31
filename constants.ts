import { Page } from './types';

export const API_MODELS = {
  TEXT_GENERATION: 'gemini-2.5-flash-preview-04-17',
  IMAGE_GENERATION: 'imagen-3.0-generate-002',
  // Add other models as needed
};

export const APP_NAME = "Detachd";

export const ROUTES = Page;

export const MOCK_USER_ID = 'user-123'; // For demo purposes

export const MOCK_API_KEY = "YOUR_API_KEY"; // Placeholder, ensure process.env.API_KEY is used in actual service

export const DEFAULT_NOTIFICATION_DURATION = 5000; // 5 seconds

// Add other constants as needed
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', ...ACCEPTED_IMAGE_TYPES];

export const MOCK_DELAY = 800; // 1 second for simulating API calls

// API Constants
export const API_BASE_URL = '/api';

// Animation Constants
export const ANIMATION_DURATION = 300;

// Business Rules
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Centralized Jacob Doe Persona - SINGLE SOURCE OF TRUTH
export const JACOB_DOE_PERSONA = {
  // Basic Info
  id: 'user_001',
  name: 'Jacob Doe',
  email: 'j.doe@gmail.com',
  phone: '084 497 6894',
  address: '145 Long Street, Cape Town, 8001',
  role: 'policyholder' as const,
  
  // Avatar - Professional, consistent image
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  
  // Membership & Verification
  memberSince: 'March 2023',
  verificationLevel: 'Premium Verified',
  
  // UNIFIED RISK/TRUST SCORE - 82/100 across ALL views
  riskScore: 82,
  trustScore: 82,
  
  // Claims History
  totalClaims: 3,
  successfulClaims: 3,
  approvedClaims: 2,
  closedClaims: 1,
  
  // Policy Details
  policyNumber: 'POL-2023-001',
  policyType: 'Comprehensive Auto Insurance',
  premium: 4500,
  
  // Emergency Contact QR Data
  emergencyContact: {
    name: 'Jacob Doe',
    id: 'user_001',
    role: 'policyholder',
    phone: '084 497 6894',
    email: 'j.doe@gmail.com'
  }
} as const;

// Risk Score Color Helper
export const getRiskScoreColor = (score: number): string => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};

// Risk Level Helper  
export const getRiskLevel = (score: number): string => {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Medium';
  return 'High';
};

// Test Scenarios for Comprehensive Testing
export const TEST_SCENARIOS = {
  // Policyholder Scenarios (100+ variations)
  POLICYHOLDER: {
    // Risk Score Variations
    RISK_SCORES: [5, 15, 25, 35, 45, 55, 65, 75, 82, 85, 95],
    
    // Claims History Variations
    CLAIMS_HISTORY: [
      { total: 0, successful: 0, type: 'new_customer' },
      { total: 1, successful: 1, type: 'single_claim' },
      { total: 3, successful: 3, type: 'experienced_low_risk' },
      { total: 5, successful: 4, type: 'experienced_medium_risk' },
      { total: 8, successful: 5, type: 'high_activity' },
      { total: 12, successful: 7, type: 'frequent_claimant' }
    ],
    
    // Verification Levels
    VERIFICATION_LEVELS: [
      'Unverified',
      'Basic Verified',
      'Standard Verified', 
      'Premium Verified',
      'Elite Verified'
    ],
    
    // Geographic Variations
    LOCATIONS: [
      'Cape Town, Western Cape',
      'Johannesburg, Gauteng',
      'Durban, KwaZulu-Natal',
      'Port Elizabeth, Eastern Cape',
      'Bloemfontein, Free State'
    ],
    
    // Age Groups
    AGE_GROUPS: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    
    // Policy Types
    POLICY_TYPES: [
      'Basic Third Party',
      'Third Party Fire & Theft',
      'Comprehensive',
      'Premium Comprehensive'
    ]
  },
  
  // Government Official Scenarios
  GOVERNMENT_OFFICIAL: {
    CLEARANCE_LEVELS: ['Basic', 'Standard', 'High', 'Top Secret'],
    DEPARTMENTS: ['SAPS', 'Emergency Services', 'Municipal', 'Provincial', 'National'],
    ACCESS_LEVELS: ['View Only', 'Standard Access', 'Enhanced Access', 'Full Access']
  },
  
  // Emergency Responder Scenarios  
  EMERGENCY_RESPONDER: {
    TYPES: ['Paramedic', 'Fire Fighter', 'Police Officer', 'Traffic Officer', 'Rescue Services'],
    CERTIFICATION_LEVELS: ['Basic', 'Advanced', 'Specialist', 'Supervisor'],
    RESPONSE_ZONES: ['Urban', 'Rural', 'Highway', 'Industrial', 'Residential']
  },
  
  // Insurer Admin Scenarios
  INSURER_ADMIN: {
    ROLES: ['Claims Processor', 'Senior Adjuster', 'Manager', 'Director'],
    SPECIALIZATIONS: ['Auto Claims', 'Property Claims', 'Fraud Investigation', 'Risk Assessment'],
    EXPERIENCE_LEVELS: ['Junior', 'Mid-Level', 'Senior', 'Expert']
  }
} as const;
