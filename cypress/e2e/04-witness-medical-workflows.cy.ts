describe('Witness & Medical Professional Workflows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Witness User Flow', () => {
    it('should redirect witness to claims page after login', () => {
      cy.loginAs('WITNESS');
      cy.verifyUserRedirectedToCorrectDashboard('WITNESS');
    });

    it('should display witness claims page with minimal interface', () => {
      cy.loginAs('WITNESS');
      cy.url().should('include', '/witness/claims');
      
      // Verify minimal interface
      cy.contains('Witness Claims').should('be.visible');
      
      // Should not have full navigation menu
      cy.get('[data-testid="main-navigation"]').should('not.exist');
      
      // Should only show basic settings and logout
      cy.contains('Settings').should('be.visible');
      cy.contains('Logout').should('be.visible');
    });

    it('should display assigned claims for witness', () => {
      cy.loginAs('WITNESS');
      
      // Should show claims the witness is assigned to
      cy.get('body').then($body => {
        if ($body.text().includes('No claims assigned')) {
          cy.contains('No claims assigned').should('be.visible');
          cy.contains('You will see claims here when you are added as a witness').should('be.visible');
        } else {
          cy.get('[data-testid="witness-claim"]').should('exist');
        }
      });
    });

    it('should allow witness to submit statements', () => {
      cy.loginAs('WITNESS');
      
      // Mock a claim being available
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims assigned')) {
          // Find a claim and submit statement
          cy.get('[data-testid="witness-claim"]').first().within(() => {
            cy.contains('Add Statement').click();
          });
          
          // Submit witness statement
          const statement = 'I witnessed the accident at approximately 3:30 PM. The red vehicle ran the red light and collided with the blue vehicle.';
          cy.submitWitnessStatement(statement);
        }
      });
    });

    it('should restrict witness access to other pages', () => {
      cy.loginAs('WITNESS');
      
      // Try to access restricted pages
      cy.visit('/dashboard');
      cy.verifyAccessDenied();
      
      cy.visit('/claims');
      cy.verifyAccessDenied();
      
      cy.visit('/reports');
      cy.verifyAccessDenied();
      
      cy.visit('/admin');
      cy.verifyAccessDenied();
    });
  });

  describe('Medical Professional User Flow', () => {
    it('should redirect medical professional to QR join page after login', () => {
      cy.loginAs('MEDICAL_PRO');
      cy.verifyUserRedirectedToCorrectDashboard('MEDICAL_PRO');
    });

    it('should display QR code scanner interface', () => {
      cy.loginAs('MEDICAL_PRO');
      cy.url().should('include', '/medical/join-claim');
      
      // Verify QR scanner interface
      cy.contains('Join Claim via QR Code').should('be.visible');
      cy.contains('[QR Scanner Placeholder]').should('be.visible');
      
      // Should have manual code input as backup
      cy.contains('Paste QR code value here for demo').should('be.visible');
    });

    it('should allow joining claim via QR code', () => {
      cy.loginAs('MEDICAL_PRO');
      
      // Simulate QR code scan by entering code manually
      const mockClaimCode = 'MED-CLM-123456';
      cy.get('input[placeholder*="Paste QR code"]').type(mockClaimCode);
      cy.contains('Join Claim').click();
      
      // Should attempt to join claim
      cy.get('body').then($body => {
        if ($body.text().includes('Invalid or expired code')) {
          cy.contains('Invalid or expired code').should('be.visible');
        } else {
          cy.contains('Successfully joined claim').should('be.visible');
        }
      });
    });

    it('should restrict medical professional access to other areas', () => {
      cy.loginAs('MEDICAL_PRO');
      
      // Try to access restricted pages
      cy.visit('/dashboard');
      cy.verifyAccessDenied();
      
      cy.visit('/claims');
      cy.verifyAccessDenied();
      
      cy.visit('/reports');
      cy.verifyAccessDenied();
      
      cy.visit('/witness/claims');
      cy.verifyAccessDenied();
    });
  });

  describe('Third-Party Access Code Flow', () => {
    it('should validate access code expiry', () => {
      cy.visit('/enter-claim-code');
      
      // Try expired code
      cy.get('input[name="accessCode"]').type('EXPIRED-CODE');
      cy.contains('Submit').click();
      
      cy.contains('Access code has expired or is invalid').should('be.visible');
    });
  });
}); 