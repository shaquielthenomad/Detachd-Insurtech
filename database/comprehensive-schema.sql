-- COMPREHENSIVE DETACHD INSURANCE PLATFORM DATABASE SCHEMA
-- Includes all stakeholder types, verification systems, and proper claim logic

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- Enhanced Users table with all stakeholder types
CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN (
        'SUPER_ADMIN', 'POLICYHOLDER', 'INSURER_ADMIN', 'INSURER_AGENT', 
        'THIRD_PARTY', 'WITNESS', 'MEDICAL_PROFESSIONAL', 'LEGAL_PROFESSIONAL'
    )),
    phone NVARCHAR(20),
    password_hash NVARCHAR(255),
    
    -- Verification Status
    email_verified BIT DEFAULT 0,
    phone_verified BIT DEFAULT 0,
    identity_verified BIT DEFAULT 0,
    professional_verified BIT DEFAULT 0, -- For doctors, lawyers, etc.
    
    -- Account Status
    is_active BIT DEFAULT 1,
    is_approved BIT DEFAULT 0, -- For insurers, medical professionals
    approval_status NVARCHAR(50) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    approved_by UNIQUEIDENTIFIER,
    approved_at DATETIME2,
    
    -- Profile Information
    profile_picture_url NVARCHAR(500),
    license_number NVARCHAR(100), -- For medical/legal professionals
    practice_name NVARCHAR(255), -- For medical/legal professionals
    specialization NVARCHAR(255), -- For medical professionals
    
    -- Metadata
    preferences NVARCHAR(MAX), -- JSON string for user preferences
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    last_login DATETIME2,
    
    FOREIGN KEY (approved_by) REFERENCES Users(id),
    INDEX IX_Users_Email (email),
    INDEX IX_Users_Role (role),
    INDEX IX_Users_ApprovalStatus (approval_status)
);

-- =====================================================
-- VERIFICATION TOKEN SYSTEMS
-- =====================================================

-- Email Verification Tokens
CREATE TABLE EmailVerificationTokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_EmailVerificationTokens_Token (token)
);

-- Phone Verification Tokens (SMS)
CREATE TABLE PhoneVerificationTokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    phone_number NVARCHAR(20) NOT NULL,
    verification_code NVARCHAR(10) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    attempts INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_PhoneVerificationTokens_Phone (phone_number)
);

-- Professional Verification (for doctors, lawyers, etc.)
CREATE TABLE ProfessionalVerifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    verification_type NVARCHAR(50) NOT NULL CHECK (verification_type IN ('MEDICAL', 'LEGAL', 'INSURER')),
    license_number NVARCHAR(100) NOT NULL,
    issuing_authority NVARCHAR(255) NOT NULL,
    verification_status NVARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_documents NVARCHAR(MAX), -- JSON array of document URLs
    verified_by UNIQUEIDENTIFIER,
    verified_at DATETIME2,
    expires_at DATETIME2,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES Users(id),
    INDEX IX_ProfessionalVerifications_LicenseNumber (license_number)
);

-- Password Reset Tokens
CREATE TABLE PasswordResetTokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_PasswordResetTokens_Token (token)
);

-- =====================================================
-- THIRD-PARTY ACCESS SYSTEM
-- =====================================================

-- Third Party Access Codes (for witnesses, involved parties)
CREATE TABLE ThirdPartyAccessCodes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    access_code NVARCHAR(20) NOT NULL UNIQUE,
    claim_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Contact Information
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    role_in_incident NVARCHAR(100) NOT NULL, -- 'WITNESS', 'OTHER_DRIVER', 'PASSENGER', etc.
    
    -- Access Control
    permissions NVARCHAR(MAX), -- JSON array of what they can access/submit
    is_used BIT DEFAULT 0,
    used_by_user_id UNIQUEIDENTIFIER,
    used_at DATETIME2,
    expires_at DATETIME2 NOT NULL,
    
    -- Metadata
    created_by UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by_user_id) REFERENCES Users(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    INDEX IX_ThirdPartyAccessCodes_AccessCode (access_code),
    INDEX IX_ThirdPartyAccessCodes_ClaimId (claim_id)
);

-- =====================================================
-- ENHANCED CLAIMS SYSTEM
-- =====================================================

-- Enhanced Claims table with proper status logic
CREATE TABLE Claims (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_number NVARCHAR(50) NOT NULL UNIQUE,
    
    -- Basic Information
    policyholder_name NVARCHAR(255) NOT NULL,
    claim_type NVARCHAR(100) NOT NULL,
    date_of_loss DATE NOT NULL,
    amount_claimed DECIMAL(18,2),
    description NVARCHAR(MAX),
    
    -- Status Management
    status NVARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 
        'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'CLOSED'
    )),
    substatus NVARCHAR(100), -- Additional status details
    
    -- AI Analysis
    risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
    ai_analysis NVARCHAR(MAX), -- JSON string for AI analysis results
    fraud_indicators NVARCHAR(MAX), -- JSON array of fraud indicators
    
    -- Assignment
    user_id UNIQUEIDENTIFIER NOT NULL,
    assigned_adjuster_id UNIQUEIDENTIFIER,
    assigned_investigator_id UNIQUEIDENTIFIER,
    
    -- Policy Information
    policy_number NVARCHAR(100),
    policy_type NVARCHAR(100),
    coverage_amount DECIMAL(18,2),
    deductible_amount DECIMAL(18,2),
    
    -- Incident Details
    incident_location NVARCHAR(500),
    incident_coordinates NVARCHAR(100), -- Lat,Long
    weather_conditions NVARCHAR(255),
    police_report_number NVARCHAR(100),
    
    -- Third Party Information
    witness_info NVARCHAR(MAX), -- JSON string for witness information
    third_party_info NVARCHAR(MAX), -- JSON string for other involved parties
    
    -- Medical Information (if applicable)
    medical_treatment_required BIT DEFAULT 0,
    hospital_name NVARCHAR(255),
    treating_physician NVARCHAR(255),
    medical_report_required BIT DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    submitted_at DATETIME2,
    approved_at DATETIME2,
    rejected_at DATETIME2,
    closed_at DATETIME2,
    
    -- Rejection Information
    rejection_reason NVARCHAR(MAX),
    rejection_category NVARCHAR(100),
    
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (assigned_adjuster_id) REFERENCES Users(id),
    FOREIGN KEY (assigned_investigator_id) REFERENCES Users(id),
    INDEX IX_Claims_ClaimNumber (claim_number),
    INDEX IX_Claims_Status (status),
    INDEX IX_Claims_UserId (user_id),
    INDEX IX_Claims_DateOfLoss (date_of_loss),
    INDEX IX_Claims_RiskScore (risk_score)
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

-- Enhanced Documents table
CREATE TABLE Documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Document Information
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(100) NOT NULL, -- 'PHOTO', 'PDF', 'VIDEO', 'MEDICAL_REPORT', etc.
    category NVARCHAR(100), -- 'INCIDENT_PHOTOS', 'MEDICAL_RECORDS', 'POLICE_REPORT', etc.
    size BIGINT NOT NULL,
    url NVARCHAR(500) NOT NULL,
    azure_blob_name NVARCHAR(500),
    content_type NVARCHAR(100),
    
    -- Security & Verification
    checksum NVARCHAR(64), -- SHA-256 hash for integrity
    is_verified BIT DEFAULT 0,
    verification_result NVARCHAR(MAX), -- JSON string for verification results
    is_sensitive BIT DEFAULT 0, -- For medical records, etc.
    
    -- Access Control
    uploaded_by UNIQUEIDENTIFIER,
    uploaded_by_role NVARCHAR(50), -- Role of uploader
    access_level NVARCHAR(50) DEFAULT 'CLAIM_PARTIES', -- Who can access this document
    
    -- Metadata
    uploaded_at DATETIME2 DEFAULT GETUTCDATE(),
    metadata NVARCHAR(MAX), -- JSON string for additional metadata
    
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(id),
    INDEX IX_Documents_ClaimId (claim_id),
    INDEX IX_Documents_Type (type),
    INDEX IX_Documents_Category (category)
);

-- =====================================================
-- CERTIFICATE SYSTEM (CONDITIONAL)
-- =====================================================

-- Certificates (only generated for APPROVED claims)
CREATE TABLE Certificates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Certificate Information
    certificate_id NVARCHAR(100) NOT NULL UNIQUE,
    certificate_type NVARCHAR(50) NOT NULL CHECK (certificate_type IN ('VERIFICATION', 'SETTLEMENT', 'CLOSURE')),
    
    -- Blockchain/Security
    blockchain_tx_id NVARCHAR(100),
    security_hash NVARCHAR(100) NOT NULL,
    verification_url NVARCHAR(500),
    
    -- Certificate Data
    certificate_data NVARCHAR(MAX) NOT NULL, -- JSON string with full certificate data
    pdf_url NVARCHAR(500) NOT NULL,
    azure_blob_name NVARCHAR(500),
    
    -- Validity
    is_valid BIT DEFAULT 1,
    issued_by UNIQUEIDENTIFIER NOT NULL,
    verification_date DATETIME2 NOT NULL,
    expires_at DATETIME2,
    
    -- Metadata
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES Users(id),
    INDEX IX_Certificates_ClaimId (claim_id),
    INDEX IX_Certificates_CertificateId (certificate_id),
    INDEX IX_Certificates_SecurityHash (security_hash)
);

-- =====================================================
-- ADDITIONAL TABLES
-- =====================================================

-- System Audit Log
CREATE TABLE AuditLog (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id UNIQUEIDENTIFIER,
    old_values NVARCHAR(MAX), -- JSON string
    new_values NVARCHAR(MAX), -- JSON string
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    INDEX IX_AuditLog_UserId (user_id),
    INDEX IX_AuditLog_EntityType (entity_type),
    INDEX IX_AuditLog_CreatedAt (created_at)
);

-- System Settings (for super admin)
CREATE TABLE SystemSettings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    setting_key NVARCHAR(100) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX) NOT NULL,
    setting_type NVARCHAR(50) NOT NULL CHECK (setting_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
    description NVARCHAR(500),
    is_public BIT DEFAULT 0, -- Whether setting is visible to non-admins
    updated_by UNIQUEIDENTIFIER,
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (updated_by) REFERENCES Users(id),
    INDEX IX_SystemSettings_Key (setting_key)
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active Claims View
CREATE VIEW vw_ActiveClaims AS
SELECT 
    c.*,
    u.name as policyholder_name,
    u.email as policyholder_email,
    adj.name as adjuster_name,
    f.risk_score as fraud_risk_score,
    f.recommendation as fraud_recommendation
FROM Claims c
INNER JOIN Users u ON c.user_id = u.id
LEFT JOIN Users adj ON c.assigned_adjuster_id = adj.id
LEFT JOIN FraudAnalysisResults f ON c.id = f.claim_id
WHERE c.status NOT IN ('CLOSED', 'REJECTED');

-- Pending Approvals View (for super admin)
CREATE VIEW vw_PendingApprovals AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.approval_status,
    u.created_at,
    pv.license_number,
    pv.verification_status as professional_verification_status
FROM Users u
LEFT JOIN ProfessionalVerifications pv ON u.id = pv.user_id
WHERE u.approval_status = 'PENDING'
AND u.role IN ('INSURER_ADMIN', 'INSURER_AGENT', 'MEDICAL_PROFESSIONAL', 'LEGAL_PROFESSIONAL');

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to approve a claim and generate certificate
CREATE PROCEDURE sp_ApproveClaim
    @ClaimId UNIQUEIDENTIFIER,
    @ApprovedBy UNIQUEIDENTIFIER,
    @SettlementAmount DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update claim status
    UPDATE Claims 
    SET status = 'APPROVED',
        approved_at = GETUTCDATE(),
        updated_at = GETUTCDATE()
    WHERE id = @ClaimId;
    
    -- Generate certificate
    DECLARE @CertificateId NVARCHAR(100) = 'DTC-CERT-' + CAST(NEWID() AS NVARCHAR(36));
    DECLARE @SecurityHash NVARCHAR(100) = 'HASH-' + CAST(NEWID() AS NVARCHAR(36));
    
    INSERT INTO Certificates (
        claim_id, certificate_id, certificate_type, security_hash,
        issued_by, verification_date, certificate_data, pdf_url
    ) VALUES (
        @ClaimId, @CertificateId, 'VERIFICATION', @SecurityHash,
        @ApprovedBy, GETUTCDATE(), '{}', '/certificates/' + @CertificateId + '.pdf'
    );
    
    -- Log the action
    INSERT INTO AuditLog (user_id, action, entity_type, entity_id, new_values)
    VALUES (@ApprovedBy, 'APPROVE_CLAIM', 'CLAIM', @ClaimId, 
            JSON_OBJECT('settlement_amount', @SettlementAmount, 'certificate_id', @CertificateId));
END; 