
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  POLICYHOLDER = 'Policyholder',
  THIRD_PARTY = 'Third Party',
  WITNESS = 'Witness',
  RESPONDER = 'Responder', // e.g. Police, Fire
  INSURER_PARTY = 'Insurer Party', // e.g. Claims Adjuster, Admin
  INSURER_ADMIN = 'Insurer Admin',
  INSURER_AGENT = 'Insurer Agent',
  MEDICAL_PROFESSIONAL = 'Medical Professional',
  LEGAL_PROFESSIONAL = 'Legal Professional',
  GOVERNMENT_OFFICIAL = 'Government Official'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export enum ClaimStatus {
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CLOSED = 'Closed',
  PENDING_INFO = 'Pending Information'
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyholderName: string;
  dateOfLoss: string;
  claimType: string; // e.g., Auto Accident, Property Damage
  status: ClaimStatus;
  amountClaimed?: number;
  description?: string;
  riskScore?: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'Claim Submitted' | 'Claim Approved' | 'Claim Rejected' | 'Document Uploaded' | 'Note Added';
  claimId?: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // e.g., Senior Claims Adjuster, Underwriting Manager
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  permissions?: string[];
}

export interface Document {
  id: string;
  name: string;
  type: 'Photo' | 'Video' | 'PDF' | 'Audio';
  url: string;
  uploadedAt: string;
  size?: string; // e.g. "2.5 MB"
}

export interface ClaimNote {
  id: string;
  author: string; // User's name
  authorRole?: string;
  timestamp: string; // or Date object
  content: string;
  avatarUrl?: string;
}

export interface FraudIndicator {
  id: string;
  type: 'Inconsistent Statements' | 'Mismatched Incident Description' | 'Flagged Images' | 'Location Discrepancy';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Extend as needed for other entities like Reports, Notifications, Settings, etc.
export enum Page {
  WELCOME = '/',
  LOGIN = '/login',
  FORGOT_PASSWORD = '/forgot-password',
  RESET_PASSWORD = '/reset-password/:token', // Added token placeholder
  TWO_FACTOR_AUTH = '/two-factor-auth',
  VERIFY_ACCOUNT = '/verify-account/:token', // Added token placeholder
  SIGNUP = '/signup',
  ENTER_CLAIM_CODE = '/enter-claim-code',
  
  ONBOARDING_ROLE_SELECTION = '/onboarding/role',
  ONBOARDING_VERIFICATION = '/onboarding/verify',
  ONBOARDING_VERIFICATION_STATUS = '/onboarding/verification-status',
  ONBOARDING_ADDITIONAL_INFO = '/onboarding/additional-info',
  ONBOARDING_UPLOAD_ID = '/onboarding/upload-id',
  ONBOARDING_POLICYHOLDER_WELCOME = '/onboarding/policyholder-welcome',
  
  DASHBOARD = '/dashboard',
  CLAIMS = '/claims',
  CLAIM_DETAILS = '/claims/:claimId', // Explicitly for usage, path is dynamic
  CLAIM_VERIFICATION_CERTIFICATE = '/claims/:claimId/certificate',
  CLAIM_STATUS_OVERVIEW = '/claims/status', // General claim status page
  NEW_CLAIM = '/claims/new',
  NEW_CLAIM_UPLOAD_DOCUMENTS = '/claims/new/upload-documents',
  NEW_CLAIM_DECLARATION = '/claims/new/declaration',
  NEW_CLAIM_SUCCESS = '/claims/new/success',
  CLAIM_SUCCESS = '/claims/success', // General claim success page (for witness, third party, etc.)
  MY_POLICY = '/my-policy', // Added new policy page route
  POLICY_PLANS = '/policy/plans', // Policy plans management page
  NEW_POLICY = '/policy/new', // New policy creation route
  HELP_VERIFICATION = '/help/verification', // Verification issues help

  ONBOARDING_INSURANCE_CODE = '/onboarding/insurance-code', // Insurance code entry for policyholders
  ONBOARDING_THIRD_PARTY_INFO = '/onboarding/third-party-info', // Third party information collection
  ONBOARDING_WITNESS_CLAIM_CODE = '/onboarding/witness-claim-code', // Witness claim code entry
  ONBOARDING_INSURER_DEPARTMENT = '/onboarding/insurer-department', // Insurer department selection
  LOGOUT_SUCCESS = '/logout-success', // Logout success page

  TASKS_OVERVIEW = '/tasks',
  TASKS_INFO_REQUESTS = '/tasks/information-requests',
  TASKS_FLAGGED_ITEMS = '/tasks/flagged-items',

  REPORTS = '/reports',
  REPORTS_SCHEDULE = '/reports/schedule',
  REPORTS_EXPORT = '/reports/export',
  
  ANALYTICS = '/analytics',
  
  NOTIFICATIONS_OVERVIEW = '/notifications',
  NOTIFICATIONS_SETTINGS = '/notifications/settings', // New notification settings page
  NOTIFICATIONS_SUSPICIOUS_ACTIVITY = '/notifications/suspicious-activity',
  
  TEAM = '/team',
  TEAM_EDIT_MEMBER = '/team/edit/:memberId',
  TEAM_ROLES = '/team/roles',
  
  SETTINGS = '/settings',
  SETTINGS_UPDATE_PASSWORD = '/settings/update-password',
  SETTINGS_DELETE_ACCOUNT = '/settings/delete-account',
  SETTINGS_REGIONAL = '/settings/regional',
  SETTINGS_LANGUAGE = '/settings/language',
  SETTINGS_PREFERENCES = '/settings/preferences',
  SETTINGS_ACCESS_CONTROLS = '/settings/access-controls',
  SETTINGS_CONSENT = '/settings/consent',
  
  PROFILE = '/profile',
  
  HELP = '/help',
  HELP_CONTACT_SUPPORT = '/help/contact',
  HELP_REPORT_ISSUE = '/help/report-issue',
  HELP_MESSAGES = '/help/messages',
  CONTACT = '/contact', // Public contact page for non-logged in users
  
  ABOUT_APP = '/about',
  TERMS_CONDITIONS = '/terms',
  PRIVACY_POLICY = '/privacy',
  ACCESSIBILITY_STATEMENT = '/accessibility',
  COMPLIANCE_INFO = '/compliance',
  DISPUTE_RESOLUTION = '/dispute-resolution'
}

export interface NavItemType {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
  subItems?: NavItemType[];
}

export interface VerificationInput {
  responderId?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string; // From UserRole potentially
  department?: string;
  contactNumber?: string; // Can be same as phone or different
  teamAssignment?: string;
  reportingPreferences?: string;
  professionalId?: File | null;
  driversLicense?: File | null;
  // Adding fields that were in AdditionalInfoPage state
  responderRole?: string;
  emailAddress?: string;
  // Government official fields
  governmentId?: string;
  governmentDepartment?: string;
  officialTitle?: string;
}