describe('Policyholder Complete Workflow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Claim Creation Flow', () => {
    it('should allow policyholder to create a new claim', () => {
      cy.loginAs('POLICYHOLDER');
      
      // Navigate to new claim page
      cy.visit('/claims/new');
      
      // Fill out claim form
      cy.get('input[name="fullName"]').type('John Policyholder');
      cy.get('input[name="policyNumber"]').type('POL-123456');
      cy.get('select[name="claimType"]').select('Auto Accident');
      cy.get('input[name="dateOfLoss"]').type('2024-01-15');
      cy.get('input[name="location"]').type('Cape Town, South Africa');
      cy.get('textarea[name="incidentDescription"]').type('Collision at intersection during rush hour traffic');
      cy.get('input[name="estimatedAmount"]').type('25000');
      
      // Submit claim
      cy.get('button[type="submit"]').click();
      
      // Should redirect to document upload
      cy.url().should('include', '/upload-documents');
    });

    it('should require all mandatory fields for claim creation', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims/new');
      
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains('required').should('be.visible');
    });
  });

  describe('Document Upload Flow', () => {
    beforeEach(() => {
      cy.loginAs('POLICYHOLDER');
      // Create a claim first
      cy.createTestClaim();
    });

    it('should allow document upload', () => {
      // Should be on upload documents page
      cy.url().should('include', '/upload-documents');
      
      // Upload test files
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        cy.get('input[type="file"]').first().attachFile({
          fileContent,
          fileName: 'accident-photo.jpg',
          mimeType: 'image/jpeg',
          encoding: 'base64'
        });
      });
      
      // Verify file is uploaded
      cy.contains('accident-photo.jpg').should('be.visible');
      
      // Continue to next step
      cy.contains('Continue').click();
      cy.url().should('include', '/declaration');
    });

    it('should support multiple file uploads', () => {
      cy.url().should('include', '/upload-documents');
      
      // Upload multiple files
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        cy.get('input[type="file"]').first().attachFile({
          fileContent,
          fileName: 'photo1.jpg',
          mimeType: 'image/jpeg',
          encoding: 'base64'
        });
      });
      
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').last().attachFile({
          fileContent,
          fileName: 'police-report.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        });
      });
      
      // Verify both files are shown
      cy.contains('photo1.jpg').should('be.visible');
      cy.contains('police-report.pdf').should('be.visible');
    });
  });

  describe('Declaration and Submission', () => {
    beforeEach(() => {
      cy.loginAs('POLICYHOLDER');
      cy.createTestClaim();
      // Navigate through upload documents
      cy.contains('Continue').click();
    });

    it('should complete claim submission with declaration', () => {
      cy.url().should('include', '/declaration');
      
      // Accept terms and conditions
      cy.get('input[type="checkbox"]').check();
      
      // Submit claim
      cy.contains('Submit Claim').click();
      
      // Should redirect to success page
      cy.url().should('include', '/success');
      cy.contains('Claim submitted successfully').should('be.visible');
    });

    it('should require terms acceptance before submission', () => {
      cy.url().should('include', '/declaration');
      
      // Try to submit without accepting terms
      cy.contains('Submit Claim').click();
      
      // Should show error or be disabled
      cy.contains('Submit Claim').should('be.disabled');
    });
  });

  describe('Claim Management', () => {
    it('should display policyholder claims list', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims');
      
      // Should show claims list
      cy.contains('My Claims').should('be.visible');
      
      // If no claims, should show empty state
      cy.get('body').then($body => {
        if ($body.text().includes('No claims')) {
          cy.contains('No claims found').should('be.visible');
        } else {
          // Should show claim cards/list
          cy.get('[data-testid="claim-item"]').should('exist');
        }
      });
    });

    it('should allow viewing claim details', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims');
      
      // Click on first claim (if exists)
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims')) {
          cy.get('[data-testid="claim-item"]').first().click();
          cy.url().should('include', '/claims/');
          cy.contains('Claim Details').should('be.visible');
        }
      });
    });
  });

  describe('Certificate Download', () => {
    it('should allow downloading certificate for approved claims', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims');
      
      // Navigate to an approved claim (mock or create one)
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims')) {
          // Look for approved claim
          cy.contains('Approved').parent().click();
          
          // Should be able to download certificate
          cy.contains('Download Certificate').click();
          
          // Verify certificate page
          cy.url().should('include', '/certificate');
          cy.contains('Verification Certificate').should('be.visible');
        }
      });
    });
  });

  describe('Policy Management', () => {
    it('should display policy information', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/my-policy');
      
      cy.contains('My Policy').should('be.visible');
      
      // Should show policy details or empty state
      cy.get('body').then($body => {
        if ($body.text().includes('No active policy')) {
          cy.contains('No active policy').should('be.visible');
        } else {
          cy.contains('Policy Number').should('be.visible');
        }
      });
    });

    it('should allow creating new policy', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/policy/new');
      
      cy.contains('New Policy Application').should('be.visible');
      
      // Fill out basic information
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john.doe@example.com');
      
      // Continue through steps
      cy.contains('Next').click();
    });
  });

  describe('Settings and Profile', () => {
    it('should allow updating profile information', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/profile');
      
      cy.contains('User Profile').should('be.visible');
      
      // Should show user information
      cy.contains('policyholder@detachd.com').should('be.visible');
    });

    it('should allow accessing settings', () => {
      cy.loginAs('POLICYHOLDER');
      cy.visit('/settings');
      
      cy.contains('Settings').should('be.visible');
      
      // Should show various setting options
      cy.contains('Change Password').should('be.visible');
      cy.contains('Regional Settings').should('be.visible');
    });
  });
}); 