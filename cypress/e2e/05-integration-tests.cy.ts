describe('Integration Tests - Complete Workflows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Complete Claim Lifecycle', () => {
    it('should complete full claim workflow from creation to certificate', () => {
      // Step 1: Policyholder creates claim
      cy.loginAs('POLICYHOLDER');
      
      cy.visit('/claims/new');
      
      // Create comprehensive claim
      cy.get('input[name="fullName"]').type('John Policyholder');
      cy.get('input[name="policyNumber"]').type('POL-123456-TEST');
      cy.get('select[name="claimType"]').select('Auto Accident');
      cy.get('input[name="dateOfLoss"]').type('2024-01-15');
      cy.get('input[name="location"]').type('Cape Town, South Africa');
      cy.get('textarea[name="incidentDescription"]').type('Integration test claim - rear-end collision at traffic light');
      cy.get('input[name="estimatedAmount"]').type('35000');
      
      cy.get('button[type="submit"]').click();
      
      // Upload documents
      cy.url().should('include', '/upload-documents');
      
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        cy.get('input[type="file"]').first().attachFile({
          fileContent,
          fileName: 'accident-scene.jpg',
          mimeType: 'image/jpeg',
          encoding: 'base64'
        });
      });
      
      cy.contains('Continue').click();
      
      // Complete declaration
      cy.url().should('include', '/declaration');
      cy.get('input[type="checkbox"]').check();
      cy.contains('Submit Claim').click();
      
      // Verify claim creation success
      cy.url().should('include', '/success');
      cy.contains('Claim submitted successfully').should('be.visible');
      
      // Extract claim number for later use
      cy.get('[data-testid="claim-number"]').invoke('text').as('claimNumber');
      
      cy.logout();
      
      // Step 2: Admin reviews and approves claim
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/claims');
      
      // Find the newly created claim
      cy.get('@claimNumber').then(claimNumber => {
        cy.contains(claimNumber).parent().click();
      });
      
      // Approve the claim
      cy.contains('Approve Claim').click();
      cy.get('textarea[name="notes"]').type('Claim approved after review - all documentation valid');
      cy.contains('Confirm Approval').click();
      
      cy.contains('Claim approved successfully').should('be.visible');
      
      cy.logout();
      
      // Step 3: Policyholder downloads certificate
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims');
      
      // Find approved claim
      cy.get('@claimNumber').then(claimNumber => {
        cy.contains(claimNumber).parent().within(() => {
          cy.contains('Approved').should('be.visible');
          cy.contains('View Certificate').click();
        });
      });
      
      // Generate and download certificate
      cy.url().should('include', '/certificate');
      cy.contains('Generate Certificate').click();
      cy.contains('Download Certificate').click();
      
      // Verify certificate details
      cy.contains('Verification Certificate').should('be.visible');
      cy.contains('POL-123456-TEST').should('be.visible');
      cy.contains('Approved').should('be.visible');
    });

    it('should handle claim rejection workflow', () => {
      // Policyholder creates claim
      cy.loginAs('POLICYHOLDER');
      cy.createTestClaim({
        description: 'Test rejection claim - suspicious circumstances',
        estimatedAmount: '150000' // High amount to trigger review
      });
      
      cy.logout();
      
      // Admin rejects claim
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/claims');
      
      // Find and reject the claim
      cy.contains('Test rejection claim').parent().click();
      cy.contains('Reject Claim').click();
      cy.get('textarea[name="reason"]').type('Claim rejected due to insufficient evidence and suspicious circumstances');
      cy.contains('Confirm Rejection').click();
      
      cy.contains('Claim rejected successfully').should('be.visible');
      
      cy.logout();
      
      // Policyholder sees rejection
      cy.loginAs('POLICYHOLDER');
      cy.visit('/claims');
      
      // Should see rejected status
      cy.contains('Rejected').should('be.visible');
      cy.contains('insufficient evidence').should('be.visible');
    });
  });

  describe('Multi-User Collaboration', () => {
    it('should allow policyholder to add witness and witness to contribute', () => {
      // Policyholder creates claim and adds witness
      cy.loginAs('POLICYHOLDER');
      cy.createTestClaim();
      
      // Navigate to claim details
      cy.visit('/claims');
      cy.get('[data-testid="claim-item"]').first().click();
      
      // Add witness
      cy.contains('Add Witness').click();
      cy.get('input[name="witnessEmail"]').type('witness@example.com');
      cy.get('input[name="witnessName"]').type('Jane Witness');
      cy.contains('Generate Access Code').click();
      
      // Get access code
      cy.get('[data-testid="access-code"]').invoke('text').as('accessCode');
      
      cy.logout();
      
      // Witness uses access code to join
      cy.get('@accessCode').then(accessCode => {
        cy.visit('/enter-claim-code');
        cy.get('input[name="accessCode"]').type(accessCode);
        cy.contains('Submit').click();
        
        // Should redirect to witness registration
        cy.url().should('include', '/onboarding/witness-claim-code');
        
        // Complete witness registration
        cy.get('input[name="name"]').type('Jane Witness');
        cy.get('input[name="email"]').type('witness@example.com');
        cy.get('input[name="phone"]').type('+27821234567');
        cy.contains('Submit').click();
        
        // Should now have access to the claim
        cy.url().should('include', '/witness/claims');
        
        // Submit witness statement
        cy.submitWitnessStatement('I saw the entire accident. The other driver was clearly at fault.');
      });
    });
  });

  describe('System Health & Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.loginAs('POLICYHOLDER');
      
      // Mock API failure
      cy.intercept('POST', '/api/claims', { statusCode: 500 }).as('claimSubmitFail');
      
      cy.visit('/claims/new');
      cy.createTestClaim();
      
      cy.wait('@claimSubmitFail');
      
      // Should show error message
      cy.contains('Failed to submit claim').should('be.visible');
      cy.contains('Please try again').should('be.visible');
    });

    it('should handle file upload errors', () => {
      cy.loginAs('POLICYHOLDER');
      cy.createTestClaim();
      
      // Mock file upload failure
      cy.intercept('POST', '/api/documents/upload', { statusCode: 413 }).as('uploadFail');
      
      // Try to upload large file
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'large-file.jpg',
          mimeType: 'image/jpeg',
          encoding: 'base64'
        });
      });
      
      cy.wait('@uploadFail');
      
      // Should show file size error
      cy.contains('File too large').should('be.visible');
    });

    it('should handle session expiry', () => {
      cy.loginAs('POLICYHOLDER');
      
      // Clear auth token to simulate expiry
      cy.clearLocalStorage();
      
      // Try to access protected route
      cy.visit('/claims/new');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      cy.contains('Please log in').should('be.visible');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should work with different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.loginAs('POLICYHOLDER');
      cy.visit('/dashboard');
      
      // Should be responsive
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.reload();
      
      // Should adapt layout
      cy.get('[data-testid="sidebar"]').should('be.visible');
      
      // Test desktop viewport
      cy.viewport(1920, 1080);
      cy.reload();
      
      // Should show full layout
      cy.get('[data-testid="dashboard-grid"]').should('be.visible');
    });
  });

  describe('Performance & Loading', () => {
    it('should load pages within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.loginAs('POLICYHOLDER');
      cy.visit('/dashboard');
      
      cy.get('[data-testid="dashboard-content"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('should handle large data sets efficiently', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/claims');
      
      // Test with many claims
      cy.intercept('GET', '/api/claims', { fixture: 'large-claims-dataset.json' }).as('loadClaims');
      cy.reload();
      
      cy.wait('@loadClaims');
      
      // Should still be responsive
      cy.get('[data-testid="claims-list"]').should('be.visible');
      cy.get('[data-testid="pagination"]').should('be.visible');
    });
  });
}); 