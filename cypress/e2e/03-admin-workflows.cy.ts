describe('Admin Workflows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Super Admin Dashboard', () => {
    it('should display super admin dashboard with system overview', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Verify dashboard elements
      cy.contains('Super Admin Dashboard').should('be.visible');
      cy.contains('System Overview').should('be.visible');
      
      // Check for key metrics
      cy.contains('Total Users').should('be.visible');
      cy.contains('Pending Approvals').should('be.visible');
      cy.contains('Active Claims').should('be.visible');
      cy.contains('System Health').should('be.visible');
    });

    it('should allow user management and approvals', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Navigate to pending approvals section
      cy.contains('Pending Approvals').click();
      
      // Should show pending users (if any)
      cy.get('body').then($body => {
        if ($body.text().includes('No pending approvals')) {
          cy.contains('No pending approvals').should('be.visible');
        } else {
          // Test approval functionality
          cy.get('[data-testid="approve-user"]').first().click();
          cy.contains('User approved successfully').should('be.visible');
        }
      });
    });

    it('should allow system settings management', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Navigate to settings section
      cy.contains('System Settings').click();
      
      // Should show system settings
      cy.contains('Settings').should('be.visible');
      
      // Test updating a setting
      cy.get('input[data-testid="setting-value"]').first().then($input => {
        const originalValue = $input.val();
        cy.wrap($input).clear().type('test-value');
        cy.contains('Save').click();
        cy.contains('Setting updated').should('be.visible');
      });
    });

    it('should display audit logs', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Navigate to audit section
      cy.contains('Audit Log').click();
      
      // Should show audit entries
      cy.contains('Audit Log').should('be.visible');
      
      // Check for log entries (may be empty in test environment)
      cy.get('body').then($body => {
        if ($body.text().includes('No audit entries')) {
          cy.contains('No audit entries').should('be.visible');
        } else {
          cy.get('[data-testid="audit-entry"]').should('exist');
        }
      });
    });
  });

  describe('Insurer Admin Dashboard', () => {
    it('should display insurer admin dashboard', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.url().should('include', '/dashboard');
      
      // Verify insurer admin has access to their features
      cy.contains('Dashboard').should('be.visible');
    });

    it('should allow access to reports section', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/reports');
      
      cy.contains('Reports').should('be.visible');
      cy.contains('Export').should('be.visible');
    });

    it('should allow report export functionality', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/reports');
      
      // Test CSV export
      cy.get('[data-testid="export-csv"]').click();
      
      // Verify export started (download should begin)
      cy.contains('Exporting').should('be.visible');
      
      // Test PDF export
      cy.get('[data-testid="export-pdf"]').click();
      cy.contains('Exporting').should('be.visible');
    });

    it('should allow analytics access', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/analytics');
      
      cy.contains('Analytics').should('be.visible');
      
      // Should show analytics charts/data
      cy.get('[data-testid="analytics-chart"]').should('exist');
    });

    it('should allow team management', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/team');
      
      cy.contains('Team Directory').should('be.visible');
      
      // Should show team members
      cy.get('body').then($body => {
        if ($body.text().includes('No team members')) {
          cy.contains('No team members').should('be.visible');
        } else {
          cy.get('[data-testid="team-member"]').should('exist');
        }
      });
    });
  });

  describe('Claims Management (Admin)', () => {
    it('should allow super admin to view all claims', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/claims');
      
      // Super admin should see all claims, not just their own
      cy.contains('All Claims').should('be.visible');
      
      // Should show claim management options
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims')) {
          cy.get('[data-testid="claim-item"]').should('exist');
          
          // Should show admin actions
          cy.contains('Approve').should('be.visible');
          cy.contains('Reject').should('be.visible');
        }
      });
    });

    it('should allow claim approval/rejection', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/claims');
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims')) {
          // Click on first claim
          cy.get('[data-testid="claim-item"]').first().click();
          
          // Should show claim details with admin actions
          cy.contains('Approve Claim').should('be.visible');
          cy.contains('Reject Claim').should('be.visible');
          
          // Test approval
          cy.contains('Approve Claim').click();
          cy.contains('Claim approved').should('be.visible');
        }
      });
    });

    it('should allow insurer admin to manage assigned claims', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/claims');
      
      // Insurer admin should see claims relevant to their organization
      cy.contains('Claims').should('be.visible');
      
      cy.get('body').then($body => {
        if (!$body.text().includes('No claims')) {
          cy.get('[data-testid="claim-item"]').should('exist');
        }
      });
    });
  });

  describe('User Management', () => {
    it('should allow super admin to view all users', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Navigate to users section
      cy.contains('Users').click();
      
      cy.contains('User Management').should('be.visible');
      
      // Should show user list
      cy.get('[data-testid="user-item"]').should('exist');
      
      // Should show user details
      cy.contains('policyholder@detachd.com').should('be.visible');
      cy.contains('admin@detachd.com').should('be.visible');
    });

    it('should allow user status management', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      cy.contains('Users').click();
      
      // Test user actions
      cy.get('[data-testid="user-actions"]').first().click();
      
      // Should show user management options
      cy.contains('Edit User').should('be.visible');
      cy.contains('Deactivate').should('be.visible');
    });
  });

  describe('System Health & Monitoring', () => {
    it('should display system health status', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Check system health indicators
      cy.contains('System Health').should('be.visible');
      
      // Should show health status (HEALTHY, WARNING, CRITICAL)
      cy.get('[data-testid="health-status"]').should('contain.oneOf', ['HEALTHY', 'WARNING', 'CRITICAL']);
    });

    it('should show system statistics', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/admin');
      
      // Verify key statistics are displayed
      cy.get('[data-testid="total-users"]').should('exist');
      cy.get('[data-testid="active-claims"]').should('exist');
      cy.get('[data-testid="fraud-detected"]').should('exist');
    });
  });

  describe('Report Generation & Export', () => {
    it('should generate and export CSV reports', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/reports');
      
      // Configure report filters
      cy.get('select[name="status"]').select('approved');
      cy.get('input[name="dateFrom"]').type('2024-01-01');
      cy.get('input[name="dateTo"]').type('2024-12-31');
      
      // Export CSV
      cy.get('[data-testid="export-csv"]').click();
      
      // Verify export process
      cy.contains('Generating report').should('be.visible');
      cy.contains('Download ready').should('be.visible');
    });

    it('should generate and export PDF reports', () => {
      cy.loginAs('INSURER_ADMIN');
      cy.visit('/reports');
      
      // Export PDF
      cy.get('[data-testid="export-pdf"]').click();
      
      // Verify PDF generation
      cy.contains('Generating PDF').should('be.visible');
      cy.contains('Download ready').should('be.visible');
    });

    it('should allow scheduled report creation', () => {
      cy.loginAs('SUPER_ADMIN');
      cy.visit('/reports/schedule');
      
      cy.contains('Schedule Reports').should('be.visible');
      
      // Create scheduled report
      cy.get('select[name="frequency"]').select('weekly');
      cy.get('select[name="format"]').select('pdf');
      cy.get('input[name="recipients"]').type('admin@company.com');
      
      cy.contains('Schedule Report').click();
      cy.contains('Report scheduled').should('be.visible');
    });
  });
}); 