describe('Role-Based Routing & Access Control', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Super Admin Access', () => {
    it('should redirect super admin to dashboard after login', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.verifyUserRedirectedToCorrectDashboard('SUPER_ADMIN');
    });

    it('should allow super admin access to all routes', () => {
      cy.loginAs('SUPER_ADMIN');
      
      // Test admin-only routes
      cy.visit('/admin');
      cy.url().should('include', '/admin');
      
      cy.visit('/reports');
      cy.url().should('include', '/reports');
      
      cy.visit('/analytics');
      cy.url().should('include', '/analytics');
      
      cy.visit('/team');
      cy.url().should('include', '/team');
    });
  });

  describe('Insurer Admin Access', () => {
    it('should redirect insurer admin to dashboard after login', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.verifyUserRedirectedToCorrectDashboard('INSURER_ADMIN');
    });

    it('should allow insurer admin access to reports and analytics', () => {
      cy.loginAs('INSURER_ADMIN');
      
      cy.visit('/reports');
      cy.url().should('include', '/reports');
      
      cy.visit('/analytics');
      cy.url().should('include', '/analytics');
      
      cy.visit('/team');
      cy.url().should('include', '/team');
    });

    it('should deny insurer admin access to super admin routes', () => {
      cy.loginAs('INSURER_ADMIN');
      
      cy.visit('/admin');
      cy.verifyAccessDenied();
    });
  });

  describe('Policyholder Access', () => {
    it('should redirect policyholder to dashboard after login', () => {
      cy.loginAs('POLICYHOLDER');
      cy.verifyUserRedirectedToCorrectDashboard('POLICYHOLDER');
    });

    it('should allow policyholder access to claims and policies', () => {
      cy.loginAs('POLICYHOLDER');
      
      cy.visit('/claims');
      cy.url().should('include', '/claims');
      
      cy.visit('/my-policy');
      cy.url().should('include', '/my-policy');
      
      cy.visit('/settings');
      cy.url().should('include', '/settings');
    });

    it('should deny policyholder access to admin routes', () => {
      cy.loginAs('POLICYHOLDER');
      
      cy.visit('/reports');
      cy.verifyAccessDenied();
      
      cy.visit('/analytics');
      cy.verifyAccessDenied();
      
      cy.visit('/team');
      cy.verifyAccessDenied();
      
      cy.visit('/admin');
      cy.verifyAccessDenied();
    });
  });

  describe('Witness Access', () => {
    it('should redirect witness to claims page after login', () => {
      cy.loginAs('WITNESS');
      cy.verifyUserRedirectedToCorrectDashboard('WITNESS');
    });

    it('should only allow witness access to their claims page', () => {
      cy.loginAs('WITNESS');
      
      cy.visit('/witness/claims');
      cy.url().should('include', '/witness/claims');
    });

    it('should deny witness access to all other routes', () => {
      cy.loginAs('WITNESS');
      
      cy.visit('/dashboard');
      cy.verifyAccessDenied();
      
      cy.visit('/reports');
      cy.verifyAccessDenied();
      
      cy.visit('/analytics');
      cy.verifyAccessDenied();
      
      cy.visit('/team');
      cy.verifyAccessDenied();
      
      cy.visit('/claims');
      cy.verifyAccessDenied();
    });
  });

  describe('Medical Professional Access', () => {
    it('should redirect medical professional to QR join page after login', () => {
      cy.loginAs('MEDICAL_PRO');
      cy.verifyUserRedirectedToCorrectDashboard('MEDICAL_PRO');
    });

    it('should only allow medical professional access to join claim page', () => {
      cy.loginAs('MEDICAL_PRO');
      
      cy.visit('/medical/join-claim');
      cy.url().should('include', '/medical/join-claim');
    });

    it('should deny medical professional access to other routes', () => {
      cy.loginAs('MEDICAL_PRO');
      
      cy.visit('/dashboard');
      cy.verifyAccessDenied();
      
      cy.visit('/reports');
      cy.verifyAccessDenied();
      
      cy.visit('/claims');
      cy.verifyAccessDenied();
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.visit('/claims');
      cy.url().should('include', '/login');
      
      cy.visit('/reports');
      cy.url().should('include', '/login');
    });

    it('should allow access to public routes', () => {
      cy.visit('/');
      cy.url().should('not.include', '/login');
      
      cy.visit('/about');
      cy.url().should('include', '/about');
      
      cy.visit('/contact');
      cy.url().should('include', '/contact');
    });
  });
}); 