-- Additional tables for authentication system

-- Password Reset Tokens table
CREATE TABLE PasswordResetTokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_PasswordResetTokens_Token (token),
    INDEX IX_PasswordResetTokens_ExpiresAt (expires_at)
);

-- Email Verification Tokens table
CREATE TABLE EmailVerificationTokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    token NVARCHAR(100) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_EmailVerificationTokens_Token (token),
    INDEX IX_EmailVerificationTokens_ExpiresAt (expires_at)
);

-- API Keys table (for third-party integrations)
CREATE TABLE ApiKeys (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    key_name NVARCHAR(100) NOT NULL,
    api_key NVARCHAR(255) NOT NULL UNIQUE,
    user_id UNIQUEIDENTIFIER,
    permissions NVARCHAR(MAX), -- JSON array of permissions
    is_active BIT DEFAULT 1,
    expires_at DATETIME2,
    last_used_at DATETIME2,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    INDEX IX_ApiKeys_ApiKey (api_key),
    INDEX IX_ApiKeys_UserId (user_id)
);

-- Session Management table
CREATE TABLE UserSessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    session_token NVARCHAR(255) NOT NULL UNIQUE,
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    expires_at DATETIME2 NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    last_activity DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX IX_UserSessions_SessionToken (session_token),
    INDEX IX_UserSessions_UserId (user_id),
    INDEX IX_UserSessions_ExpiresAt (expires_at)
); 