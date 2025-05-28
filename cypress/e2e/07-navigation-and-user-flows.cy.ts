describe('Navigation and User Flows - Advanced Testing', () => {
  
  describe('Complete User Onboarding Flows', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should complete policyholder onboarding flow', () => {
      cy.visit('/onboarding/role');
      cy.contains('Policyholder').click();
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/insurance-code');
      
      // Navigate through insurance code page
      cy.get('input[type="text"]').first().type('INS123456');
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/verification-status');
    });

    it('should complete witness onboarding flow', () => {
      cy.visit('/onboarding/role');
      cy.contains('Witness').click();
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/witness-claim-code');
      
      cy.get('input[type="text"]').first().type('WIT789012');
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/verification-status');
    });

    it('should complete third party onboarding flow', () => {
      cy.visit('/onboarding/role');
      cy.contains('Third Party').click();
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/third-party-info');
      
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john.doe@example.com');
      cy.contains('Continue').click();
    });

    it('should complete insurer party onboarding flow', () => {
      cy.visit('/onboarding/role');
      cy.contains('Insurer Party').click();
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/insurer-department');
      
      cy.contains('Claims Department').click();
      cy.contains('Continue').click();
      cy.url().should('include', '/onboarding/verification-status');
    });
  });

  describe('Complete Claim Submission Flows', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should complete full claim submission process', () => {
      cy.visit('/claims/new');
      
      // Fill claim form
      cy.get('input[name="incidentDate"]').type('2024-01-15');
      cy.get('textarea[name="description"]').type('Car accident on Main Street');
      cy.get('select[name="claimType"]').select('Auto');
      cy.contains('Continue').click();
      
      // Upload documents
      cy.url().should('include', '/claims/new/upload-documents');
      cy.get('input[type="file"]').attachFile('test-document.pdf');
      cy.contains('Continue').click();
      
      // Declaration
      cy.url().should('include', '/claims/new/declaration');
      cy.get('input[type="checkbox"]').check();
      cy.contains('Submit Claim').click();
      
      // Success page
      cy.url().should('include', '/claims/new/success');
      cy.contains('Your claim has been submitted').should('be.visible');
    });

    it('should navigate from claim success to dashboard', () => {
      cy.visit('/claims/new/success');
      cy.contains('Go to Dashboard').click();
      cy.url().should('include', '/dashboard');
    });

    it('should navigate from claim success to claims list', () => {
      cy.visit('/claims/new/success');
      cy.contains('View My Claims').click();
      cy.url().should('include', '/claims');
    });
  });

  describe('Sidebar Navigation Tests', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should navigate through all sidebar links for policyholder', () => {
      cy.visit('/dashboard');
      
      // Dashboard
      cy.contains('Dashboard').click();
      cy.url().should('include', '/dashboard');
      
      // Claims
      cy.contains('Claims').click();
      cy.url().should('include', '/claims');
      
      // My Policy
      cy.contains('My Policy').click();
      cy.url().should('include', '/my-policy');
      
      // Profile
      cy.contains('Profile').click();
      cy.url().should('include', '/profile');
      
      // Settings
      cy.contains('Settings').click();
      cy.url().should('include', '/settings');
      
      // Help
      cy.contains('Help').click();
      cy.url().should('include', '/help');
    });

    it('should navigate through admin sidebar for insurer admin', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('userRole', 'insurer_admin');
      });
      cy.visit('/dashboard');
      
      cy.contains('Reports').click();
      cy.url().should('include', '/reports');
      
      cy.contains('Analytics').click();
      cy.url().should('include', '/analytics');
      
      cy.contains('Team').click();
      cy.url().should('include', '/team');
    });
  });

  describe('Breadcrumb Navigation Tests', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should show and navigate using breadcrumbs in claims section', () => {
      cy.visit('/claims/claim-123');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Claims');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Claim Details');
      
      cy.get('[data-testid="breadcrumb"]').contains('Claims').click();
      cy.url().should('include', '/claims');
    });

    it('should show breadcrumbs in settings subsections', () => {
      cy.visit('/settings/update-password');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Settings');
      cy.get('[data-testid="breadcrumb"]').should('contain', 'Update Password');
    });
  });

  describe('Header Navigation Tests', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should navigate using header logo', () => {
      cy.visit('/claims');
      cy.get('[data-testid="app-logo"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should access notifications from header', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="notifications-icon"]').click();
      cy.url().should('include', '/notifications');
    });

    it('should access profile dropdown from header', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="profile-dropdown"]').click();
      cy.contains('Profile').click();
      cy.url().should('include', '/profile');
    });

    it('should logout from profile dropdown', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="profile-dropdown"]').click();
      cy.contains('Logout').click();
      cy.url().should('include', '/logout-success');
    });
  });

  describe('Search and Filter Navigation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should search claims and navigate to results', () => {
      cy.visit('/claims');
      cy.get('[data-testid="search-input"]').type('auto accident');
      cy.get('[data-testid="search-button"]').click();
      cy.url().should('include', 'search=auto%20accident');
    });

    it('should filter claims by status', () => {
      cy.visit('/claims');
      cy.get('[data-testid="status-filter"]').select('Pending');
      cy.url().should('include', 'status=pending');
    });

    it('should navigate to claim details from search results', () => {
      cy.visit('/claims?search=auto');
      cy.get('[data-testid="claim-item"]').first().click();
      cy.url().should('match', /\/claims\/claim-[a-zA-Z0-9]+/);
    });
  });

  describe('Mobile Navigation Tests', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE viewport
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should open and close mobile menu', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
      
      cy.get('[data-testid="mobile-menu-close"]').click();
      cy.get('[data-testid="mobile-sidebar"]').should('not.be.visible');
    });

    it('should navigate using mobile menu', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-sidebar"]').contains('Claims').click();
      cy.url().should('include', '/claims');
    });
  });

  describe('Error Page Navigation', () => {
    it('should navigate from 404 to home', () => {
      cy.visit('/non-existent-route');
      cy.url().should('include', '/');
    });

    it('should handle unauthorized access gracefully', () => {
      cy.visit('/reports'); // Admin only route
      cy.url().should('include', '/login');
    });
  });

  describe('Form Navigation and State Persistence', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should persist form data when navigating back', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Test description');
      cy.go('back');
      cy.go('forward');
      cy.get('textarea[name="description"]').should('have.value', 'Test description');
    });

    it('should warn before leaving unsaved form', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Unsaved data');
      cy.contains('Dashboard').click();
      cy.on('window:confirm', () => true);
    });
  });

  describe('Deep Link Navigation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should handle direct navigation to claim details', () => {
      cy.visit('/claims/claim-123');
      cy.url().should('include', '/claims/claim-123');
      cy.contains('Claim Details').should('be.visible');
    });

    it('should handle direct navigation to policy details', () => {
      cy.visit('/my-policy/policy-456');
      cy.url().should('include', '/my-policy/policy-456');
      cy.contains('Policy Details').should('be.visible');
    });

    it('should handle direct navigation to settings subsection', () => {
      cy.visit('/settings/update-password');
      cy.url().should('include', '/settings/update-password');
      cy.contains('Update Password').should('be.visible');
    });
  });

  describe('Tab Navigation and Keyboard Accessibility', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should navigate using tab key through navigation menu', () => {
      cy.visit('/dashboard');
      cy.get('body').tab();
      cy.focused().should('contain', 'Dashboard');
      cy.focused().tab();
      cy.focused().should('contain', 'Claims');
    });

    it('should activate navigation links with Enter key', () => {
      cy.visit('/dashboard');
      cy.contains('Claims').focus().type('{enter}');
      cy.url().should('include', '/claims');
    });
  });

  describe('Multi-step Form Navigation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should navigate through claim submission steps', () => {
      cy.visit('/claims/new');
      
      // Step 1
      cy.contains('Step 1').should('be.visible');
      cy.get('textarea[name="description"]').type('Test claim');
      cy.contains('Next').click();
      
      // Step 2
      cy.contains('Step 2').should('be.visible');
      cy.url().should('include', '/claims/new/upload-documents');
      cy.contains('Back').click();
      
      // Back to Step 1
      cy.contains('Step 1').should('be.visible');
      cy.url().should('include', '/claims/new');
    });
  });

  describe('URL Parameter Handling', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'insurer_admin');
        win.localStorage.setItem('userId', 'admin-123');
      });
    });

    it('should handle query parameters in reports', () => {
      cy.visit('/reports?date=2024-01-01&type=claims');
      cy.url().should('include', 'date=2024-01-01');
      cy.url().should('include', 'type=claims');
    });

    it('should preserve query parameters during navigation', () => {
      cy.visit('/reports?filter=pending');
      cy.contains('Export').click();
      cy.url().should('include', '/reports/export');
      cy.url().should('include', 'filter=pending');
    });
  });

  describe('External Link Handling', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should handle external help links', () => {
      cy.visit('/help');
      cy.get('a[href*="external"]').should('have.attr', 'target', '_blank');
    });

    it('should handle social media links in footer', () => {
      cy.visit('/about');
      cy.get('a[href*="twitter"]').should('have.attr', 'target', '_blank');
      cy.get('a[href*="facebook"]').should('have.attr', 'target', '_blank');
    });
  });
}); 