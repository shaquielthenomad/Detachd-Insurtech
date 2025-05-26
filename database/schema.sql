-- Detachd Insurance Platform Database Schema
-- Azure SQL Database

-- Users table
CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('POLICYHOLDER', 'INSURER', 'THIRD_PARTY', 'ADMIN')),
    phone NVARCHAR(20),
    password_hash NVARCHAR(255),
    email_verified BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    last_login DATETIME2,
    profile_picture_url NVARCHAR(500),
    preferences NVARCHAR(MAX), -- JSON string for user preferences
    INDEX IX_Users_Email (email),
    INDEX IX_Users_Role (role)
);

-- Claims table
CREATE TABLE Claims (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_number NVARCHAR(50) NOT NULL UNIQUE,
    policyholder_name NVARCHAR(255) NOT NULL,
    claim_type NVARCHAR(100) NOT NULL,
    date_of_loss DATE NOT NULL,
    amount_claimed DECIMAL(18,2),
    description NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_DOCUMENTS')),
    risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
    ai_analysis NVARCHAR(MAX), -- JSON string for AI analysis results
    user_id UNIQUEIDENTIFIER NOT NULL,
    assigned_adjuster_id UNIQUEIDENTIFIER,
    policy_number NVARCHAR(100),
    incident_location NVARCHAR(500),
    witness_info NVARCHAR(MAX), -- JSON string for witness information
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    approved_at DATETIME2,
    rejected_at DATETIME2,
    rejection_reason NVARCHAR(MAX),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (assigned_adjuster_id) REFERENCES Users(id),
    INDEX IX_Claims_ClaimNumber (claim_number),
    INDEX IX_Claims_Status (status),
    INDEX IX_Claims_UserId (user_id),
    INDEX IX_Claims_DateOfLoss (date_of_loss)
);

-- Documents table
CREATE TABLE Documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(100) NOT NULL, -- 'Photo', 'PDF', 'Video', etc.
    size BIGINT NOT NULL,
    url NVARCHAR(500) NOT NULL,
    azure_blob_name NVARCHAR(500),
    content_type NVARCHAR(100),
    checksum NVARCHAR(64), -- SHA-256 hash for integrity
    is_verified BIT DEFAULT 0,
    verification_result NVARCHAR(MAX), -- JSON string for verification results
    uploaded_by UNIQUEIDENTIFIER,
    uploaded_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(id),
    INDEX IX_Documents_ClaimId (claim_id),
    INDEX IX_Documents_Type (type)
);

-- Certificates table
CREATE TABLE Certificates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_id UNIQUEIDENTIFIER NOT NULL,
    certificate_id NVARCHAR(100) NOT NULL UNIQUE,
    blockchain_tx_id NVARCHAR(100),
    security_hash NVARCHAR(100),
    verification_date DATETIME2 NOT NULL,
    url NVARCHAR(500) NOT NULL,
    azure_blob_name NVARCHAR(500),
    certificate_data NVARCHAR(MAX), -- JSON string with full certificate data
    is_valid BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    INDEX IX_Certificates_ClaimId (claim_id),
    INDEX IX_Certificates_CertificateId (certificate_id)
);

-- Policies table
CREATE TABLE Policies (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    policy_number NVARCHAR(100) NOT NULL UNIQUE,
    policyholder_id UNIQUEIDENTIFIER NOT NULL,
    policy_type NVARCHAR(100) NOT NULL, -- 'Vehicle', 'Home', 'Life', etc.
    coverage_amount DECIMAL(18,2) NOT NULL,
    premium_amount DECIMAL(18,2) NOT NULL,
    deductible_amount DECIMAL(18,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED')),
    coverage_details NVARCHAR(MAX), -- JSON string with coverage details
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (policyholder_id) REFERENCES Users(id),
    INDEX IX_Policies_PolicyNumber (policy_number),
    INDEX IX_Policies_PolicyholderId (policyholder_id),
    INDEX IX_Policies_Status (status)
);

-- Notifications table
CREATE TABLE Notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL, -- 'INFO', 'WARNING', 'SUCCESS', 'ERROR'
    category NVARCHAR(50), -- 'CLAIM', 'POLICY', 'SYSTEM', etc.
    is_read BIT DEFAULT 0,
    action_url NVARCHAR(500),
    metadata NVARCHAR(MAX), -- JSON string for additional data
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    read_at DATETIME2,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_Notifications_UserId (user_id),
    INDEX IX_Notifications_IsRead (is_read),
    INDEX IX_Notifications_Type (type)
);

-- Audit Log table
CREATE TABLE AuditLog (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL, -- 'CLAIM', 'USER', 'DOCUMENT', etc.
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

-- Third Party Access Codes table
CREATE TABLE ThirdPartyAccessCodes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    access_code NVARCHAR(20) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50),
    is_used BIT DEFAULT 0,
    used_by_claim_id UNIQUEIDENTIFIER,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    used_at DATETIME2,
    expires_at DATETIME2,
    FOREIGN KEY (used_by_claim_id) REFERENCES Claims(id),
    INDEX IX_ThirdPartyAccessCodes_AccessCode (access_code),
    INDEX IX_ThirdPartyAccessCodes_Email (email)
);

-- Fraud Analysis Results table
CREATE TABLE FraudAnalysisResults (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    claim_id UNIQUEIDENTIFIER NOT NULL,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors NVARCHAR(MAX), -- JSON array of risk factors
    recommendation NVARCHAR(20) NOT NULL CHECK (recommendation IN ('APPROVE', 'REVIEW', 'REJECT')),
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    ai_model_version NVARCHAR(50),
    analysis_details NVARCHAR(MAX), -- JSON string with detailed analysis
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (claim_id) REFERENCES Claims(id) ON DELETE CASCADE,
    INDEX IX_FraudAnalysisResults_ClaimId (claim_id),
    INDEX IX_FraudAnalysisResults_RiskScore (risk_score)
);

-- Email Log table
CREATE TABLE EmailLog (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    recipient_email NVARCHAR(255) NOT NULL,
    subject NVARCHAR(500) NOT NULL,
    template_name NVARCHAR(100),
    status NVARCHAR(50) NOT NULL, -- 'SENT', 'FAILED', 'PENDING'
    error_message NVARCHAR(MAX),
    azure_message_id NVARCHAR(100),
    related_entity_type NVARCHAR(50), -- 'CLAIM', 'USER', etc.
    related_entity_id UNIQUEIDENTIFIER,
    sent_at DATETIME2,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    INDEX IX_EmailLog_RecipientEmail (recipient_email),
    INDEX IX_EmailLog_Status (status),
    INDEX IX_EmailLog_CreatedAt (created_at)
);

-- System Settings table
CREATE TABLE SystemSettings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    setting_key NVARCHAR(100) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX) NOT NULL,
    description NVARCHAR(500),
    is_encrypted BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER,
    FOREIGN KEY (updated_by) REFERENCES Users(id),
    INDEX IX_SystemSettings_SettingKey (setting_key)
);

-- Create views for common queries
CREATE VIEW vw_ActiveClaims AS
SELECT 
    c.*,
    u.name as user_name,
    u.email as user_email,
    COUNT(d.id) as document_count
FROM Claims c
INNER JOIN Users u ON c.user_id = u.id
LEFT JOIN Documents d ON c.id = d.claim_id
WHERE c.status IN ('SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS')
GROUP BY c.id, c.claim_number, c.policyholder_name, c.claim_type, c.date_of_loss, 
         c.amount_claimed, c.description, c.status, c.risk_score, c.ai_analysis,
         c.user_id, c.assigned_adjuster_id, c.policy_number, c.incident_location,
         c.witness_info, c.created_at, c.updated_at, c.approved_at, c.rejected_at,
         c.rejection_reason, u.name, u.email;

CREATE VIEW vw_ClaimSummary AS
SELECT 
    c.id,
    c.claim_number,
    c.policyholder_name,
    c.claim_type,
    c.status,
    c.amount_claimed,
    c.risk_score,
    c.created_at,
    u.name as submitted_by,
    COUNT(d.id) as document_count,
    MAX(d.uploaded_at) as last_document_upload,
    cert.certificate_id
FROM Claims c
INNER JOIN Users u ON c.user_id = u.id
LEFT JOIN Documents d ON c.id = d.claim_id
LEFT JOIN Certificates cert ON c.id = cert.claim_id
GROUP BY c.id, c.claim_number, c.policyholder_name, c.claim_type, c.status,
         c.amount_claimed, c.risk_score, c.created_at, u.name, cert.certificate_id;

-- Insert default system settings
INSERT INTO SystemSettings (setting_key, setting_value, description) VALUES
('fraud_detection_threshold', '70', 'Minimum risk score threshold for fraud detection'),
('auto_approve_threshold', '85', 'Risk score threshold for automatic approval'),
('max_claim_amount_auto_approve', '50000', 'Maximum claim amount for automatic approval (ZAR)'),
('document_retention_days', '2555', 'Number of days to retain documents (7 years)'),
('email_notifications_enabled', 'true', 'Enable email notifications'),
('sms_notifications_enabled', 'false', 'Enable SMS notifications'),
('ai_analysis_enabled', 'true', 'Enable AI fraud analysis'),
('blockchain_verification_enabled', 'true', 'Enable blockchain verification'),
('max_file_size_mb', '50', 'Maximum file size for document uploads (MB)'),
('allowed_file_types', '["pdf","jpg","jpeg","png","doc","docx"]', 'Allowed file types for uploads');

-- Create stored procedures for common operations
GO

CREATE PROCEDURE sp_CreateClaim
    @ClaimNumber NVARCHAR(50),
    @PolicyholderName NVARCHAR(255),
    @ClaimType NVARCHAR(100),
    @DateOfLoss DATE,
    @AmountClaimed DECIMAL(18,2) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @UserId UNIQUEIDENTIFIER,
    @PolicyNumber NVARCHAR(100) = NULL,
    @IncidentLocation NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ClaimId UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO Claims (
        id, claim_number, policyholder_name, claim_type, date_of_loss,
        amount_claimed, description, user_id, policy_number, incident_location
    )
    VALUES (
        @ClaimId, @ClaimNumber, @PolicyholderName, @ClaimType, @DateOfLoss,
        @AmountClaimed, @Description, @UserId, @PolicyNumber, @IncidentLocation
    );
    
    -- Log the action
    INSERT INTO AuditLog (user_id, action, entity_type, entity_id, new_values)
    VALUES (@UserId, 'CREATE', 'CLAIM', @ClaimId, 
            JSON_OBJECT('claim_number', @ClaimNumber, 'claim_type', @ClaimType));
    
    SELECT * FROM Claims WHERE id = @ClaimId;
END;
GO

CREATE PROCEDURE sp_UpdateClaimStatus
    @ClaimId UNIQUEIDENTIFIER,
    @NewStatus NVARCHAR(50),
    @RiskScore INT = NULL,
    @UpdatedBy UNIQUEIDENTIFIER,
    @RejectionReason NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @OldStatus NVARCHAR(50);
    SELECT @OldStatus = status FROM Claims WHERE id = @ClaimId;
    
    UPDATE Claims 
    SET 
        status = @NewStatus,
        risk_score = COALESCE(@RiskScore, risk_score),
        updated_at = GETUTCDATE(),
        approved_at = CASE WHEN @NewStatus = 'APPROVED' THEN GETUTCDATE() ELSE approved_at END,
        rejected_at = CASE WHEN @NewStatus = 'REJECTED' THEN GETUTCDATE() ELSE rejected_at END,
        rejection_reason = CASE WHEN @NewStatus = 'REJECTED' THEN @RejectionReason ELSE rejection_reason END
    WHERE id = @ClaimId;
    
    -- Log the action
    INSERT INTO AuditLog (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (@UpdatedBy, 'UPDATE_STATUS', 'CLAIM', @ClaimId,
            JSON_OBJECT('old_status', @OldStatus),
            JSON_OBJECT('new_status', @NewStatus, 'risk_score', @RiskScore));
END;
GO

CREATE PROCEDURE sp_GetUserClaims
    @UserId UNIQUEIDENTIFIER,
    @Status NVARCHAR(50) = NULL,
    @PageSize INT = 20,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        c.*,
        COUNT(d.id) as document_count,
        cert.certificate_id,
        cert.url as certificate_url
    FROM Claims c
    LEFT JOIN Documents d ON c.id = d.claim_id
    LEFT JOIN Certificates cert ON c.id = cert.claim_id
    WHERE c.user_id = @UserId
        AND (@Status IS NULL OR c.status = @Status)
    GROUP BY c.id, c.claim_number, c.policyholder_name, c.claim_type, c.date_of_loss,
             c.amount_claimed, c.description, c.status, c.risk_score, c.ai_analysis,
             c.user_id, c.assigned_adjuster_id, c.policy_number, c.incident_location,
             c.witness_info, c.created_at, c.updated_at, c.approved_at, c.rejected_at,
             c.rejection_reason, cert.certificate_id, cert.url
    ORDER BY c.created_at DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- Create indexes for performance
CREATE INDEX IX_Claims_CreatedAt ON Claims(created_at DESC);
CREATE INDEX IX_Documents_UploadedAt ON Documents(uploaded_at DESC);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(created_at DESC);
CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(created_at DESC);

-- Create triggers for automatic timestamp updates
GO

CREATE TRIGGER tr_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET updated_at = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER tr_Claims_UpdateTimestamp
ON Claims
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Claims 
    SET updated_at = GETUTCDATE()
    FROM Claims c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO 