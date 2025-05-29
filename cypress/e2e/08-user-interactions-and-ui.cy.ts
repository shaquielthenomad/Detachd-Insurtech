describe('User Interactions and UI Components - Comprehensive Testing', () => {

  describe('Form Interactions and Validation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should validate required fields in claim form', () => {
      cy.visit('/claims/new');
      cy.contains('Submit').click();
      cy.contains('This field is required').should('be.visible');
      cy.get('textarea[name="description"]').should('have.class', 'error');
    });

    it('should validate email format in contact forms', () => {
      cy.visit('/help/contact');
      cy.get('input[name="email"]').type('invalid-email');
      cy.contains('Submit').click();
      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('should validate file uploads', () => {
      cy.visit('/claims/new/upload-documents');
      cy.get('input[type="file"]').attachFile('invalid-file.txt');
      cy.contains('Invalid file type').should('be.visible');
    });

    it('should show character count in text areas', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Test description');
      cy.contains('16/500 characters').should('be.visible');
    });

    it('should auto-save form data', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Auto-saved content');
      cy.wait(2000);
      cy.contains('Draft saved').should('be.visible');
    });

    it('should handle form submission loading states', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Test claim');
      cy.contains('Submit').click();
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.contains('Submitting...').should('be.visible');
    });
  });

  describe('Modal and Dialog Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should open and close confirmation modal', () => {
      cy.visit('/settings/delete-account');
      cy.contains('Delete Account').click();
      cy.get('[data-testid="confirmation-modal"]').should('be.visible');
      cy.contains('Are you sure?').should('be.visible');
      
      cy.get('[data-testid="modal-close"]').click();
      cy.get('[data-testid="confirmation-modal"]').should('not.exist');
    });

    it('should close modal with ESC key', () => {
      cy.visit('/claims');
      cy.contains('View Details').first().click();
      cy.get('[data-testid="claim-details-modal"]').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="claim-details-modal"]').should('not.exist');
    });

    it('should prevent modal close when form has unsaved changes', () => {
      cy.visit('/profile');
      cy.contains('Edit Profile').click();
      cy.get('[data-testid="edit-profile-modal"]').should('be.visible');
      cy.get('input[name="firstName"]').clear().type('Changed Name');
      cy.get('[data-testid="modal-close"]').click();
      cy.contains('You have unsaved changes').should('be.visible');
    });

    it('should handle modal backdrop clicks', () => {
      cy.visit('/claims');
      cy.contains('Filters').click();
      cy.get('[data-testid="filter-modal"]').should('be.visible');
      cy.get('[data-testid="modal-backdrop"]').click({ force: true });
      cy.get('[data-testid="filter-modal"]').should('not.exist');
    });
  });

  describe('Interactive Components', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should interact with dropdown menus', () => {
      cy.visit('/claims/new');
      cy.get('[data-testid="claim-type-dropdown"]').click();
      cy.contains('Auto Insurance').click();
      cy.get('[data-testid="claim-type-dropdown"]').should('contain', 'Auto Insurance');
    });

    it('should use multi-select components', () => {
      cy.visit('/settings/notifications');
      cy.get('[data-testid="notification-types"]').click();
      cy.contains('Email').click();
      cy.contains('SMS').click();
      cy.get('[data-testid="selected-items"]').should('contain', 'Email, SMS');
    });

    it('should interact with date pickers', () => {
      cy.visit('/claims/new');
      cy.get('[data-testid="incident-date"]').click();
      cy.get('[data-testid="date-picker"]').should('be.visible');
      cy.contains('15').click();
      cy.get('[data-testid="incident-date"]').should('not.be.empty');
    });

    it('should use file upload with drag and drop', () => {
      cy.visit('/claims/new/upload-documents');
      cy.get('[data-testid="file-drop-zone"]').selectFile('cypress/fixtures/test-document.pdf', {
        action: 'drag-drop'
      });
      cy.contains('test-document.pdf').should('be.visible');
      cy.get('[data-testid="upload-progress"]').should('be.visible');
    });

    it('should interact with tabs component', () => {
      cy.visit('/claims/claim-123');
      cy.get('[data-testid="tab-timeline"]').click();
      cy.get('[data-testid="timeline-content"]').should('be.visible');
      cy.get('[data-testid="tab-documents"]').click();
      cy.get('[data-testid="documents-content"]').should('be.visible');
    });

    it('should use accordion components', () => {
      cy.visit('/help');
      cy.get('[data-testid="faq-accordion"]').first().click();
      cy.get('[data-testid="faq-content"]').first().should('be.visible');
      cy.get('[data-testid="faq-accordion"]').first().click();
      cy.get('[data-testid="faq-content"]').first().should('not.be.visible');
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'insurer_admin');
        win.localStorage.setItem('userId', 'admin-123');
      });
    });

    it('should perform real-time search', () => {
      cy.visit('/team');
      cy.get('[data-testid="search-input"]').type('John');
      cy.get('[data-testid="search-results"]').should('contain', 'John');
      cy.get('[data-testid="search-input"]').clear().type('Manager');
      cy.get('[data-testid="search-results"]').should('contain', 'Manager');
    });

    it('should apply multiple filters', () => {
      cy.visit('/reports');
      cy.get('[data-testid="date-filter"]').select('Last 30 days');
      cy.get('[data-testid="status-filter"]').select('Approved');
      cy.get('[data-testid="type-filter"]').select('Claims');
      cy.contains('Apply Filters').click();
      cy.get('[data-testid="results-count"]').should('contain', 'results found');
    });

    it('should clear all filters', () => {
      cy.visit('/claims');
      cy.get('[data-testid="status-filter"]').select('Pending');
      cy.get('[data-testid="type-filter"]').select('Auto');
      cy.contains('Clear All Filters').click();
      cy.get('[data-testid="status-filter"]').should('have.value', '');
      cy.get('[data-testid="type-filter"]').should('have.value', '');
    });

    it('should save search preferences', () => {
      cy.visit('/claims');
      cy.get('[data-testid="search-input"]').type('accident');
      cy.get('[data-testid="save-search"]').click();
      cy.contains('Search saved').should('be.visible');
      cy.visit('/dashboard');
      cy.visit('/claims');
      cy.get('[data-testid="saved-searches"]').should('contain', 'accident');
    });
  });

  describe('Data Table Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'insurer_admin');
        win.localStorage.setItem('userId', 'admin-123');
      });
    });

    it('should sort table columns', () => {
      cy.visit('/team');
      cy.get('[data-testid="sort-name"]').click();
      cy.get('[data-testid="sort-indicator"]').should('have.class', 'ascending');
      cy.get('[data-testid="sort-name"]').click();
      cy.get('[data-testid="sort-indicator"]').should('have.class', 'descending');
    });

    it('should select multiple table rows', () => {
      cy.visit('/reports');
      cy.get('[data-testid="select-all"]').click();
      cy.get('[data-testid="row-checkbox"]').should('be.checked');
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
    });

    it('should paginate through table data', () => {
      cy.visit('/claims');
      cy.get('[data-testid="pagination-next"]').click();
      cy.url().should('include', 'page=2');
      cy.get('[data-testid="page-info"]').should('contain', 'Page 2');
    });

    it('should change page size', () => {
      cy.visit('/team');
      cy.get('[data-testid="page-size-select"]').select('50');
      cy.get('[data-testid="table-rows"]').should('have.length.greaterThan', 25);
    });

    it('should export table data', () => {
      cy.visit('/reports');
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-dropdown"]').should('be.visible');
      cy.contains('Export as CSV').click();
      cy.readFile('cypress/downloads/reports.csv').should('exist');
    });
  });

  describe('Notification and Toast Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should show success toast after form submission', () => {
      cy.visit('/profile');
      cy.get('input[name="firstName"]').clear().type('Updated Name');
      cy.contains('Save Changes').click();
      cy.get('[data-testid="toast-success"]').should('be.visible');
      cy.contains('Profile updated successfully').should('be.visible');
    });

    it('should auto-dismiss toast notifications', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Test');
      cy.contains('Save Draft').click();
      cy.get('[data-testid="toast-info"]').should('be.visible');
      cy.wait(5000);
      cy.get('[data-testid="toast-info"]').should('not.exist');
    });

    it('should manually dismiss toast notifications', () => {
      cy.visit('/settings');
      cy.contains('Test Connection').click();
      cy.get('[data-testid="toast-warning"]').should('be.visible');
      cy.get('[data-testid="toast-close"]').click();
      cy.get('[data-testid="toast-warning"]').should('not.exist');
    });

    it('should show in-app notifications', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="notifications-bell"]').click();
      cy.get('[data-testid="notification-panel"]').should('be.visible');
      cy.get('[data-testid="notification-item"]').should('have.length.greaterThan', 0);
    });

    it('should mark notifications as read', () => {
      cy.visit('/notifications');
      cy.get('[data-testid="unread-notification"]').first().click();
      cy.get('[data-testid="mark-as-read"]').click();
      cy.get('[data-testid="unread-notification"]').should('have.length.lessThan', 5);
    });
  });

  describe('Drag and Drop Interactions', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'insurer_admin');
        win.localStorage.setItem('userId', 'admin-123');
      });
    });

    it('should reorder dashboard widgets', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="widget-claims"]')
        .trigger('mousedown', { which: 1 })
        .trigger('dragstart')
        .trigger('drag');
      
      cy.get('[data-testid="widget-analytics"]')
        .trigger('dragover')
        .trigger('drop');
      
      cy.get('[data-testid="widget-container"]').first()
        .should('contain', 'Claims Overview');
    });

    it('should drag files to upload area', () => {
      cy.visit('/claims/new/upload-documents');
      cy.get('[data-testid="file-drop-zone"]')
        .selectFile('cypress/fixtures/test-image.jpg', {
          action: 'drag-drop'
        });
      cy.contains('test-image.jpg').should('be.visible');
    });

    it('should reorder task priorities', () => {
      cy.visit('/tasks');
      cy.get('[data-testid="task-item"]').first()
        .drag('[data-testid="high-priority-zone"]');
      cy.get('[data-testid="high-priority-zone"]')
        .should('contain', 'Task moved to high priority');
    });
  });

  describe('Keyboard Navigation and Shortcuts', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should use keyboard shortcuts for navigation', () => {
      cy.visit('/dashboard');
      cy.get('body').type('{ctrl}k');
      cy.get('[data-testid="command-palette"]').should('be.visible');
      cy.get('[data-testid="search-commands"]').type('claims');
      cy.contains('View Claims').click();
      cy.url().should('include', '/claims');
    });

    it('should navigate forms with tab key', () => {
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').focus().tab();
      cy.focused().should('have.attr', 'name', 'incidentDate');
      cy.focused().tab();
      cy.focused().should('have.attr', 'name', 'claimType');
    });

    it('should submit forms with Enter key', () => {
      cy.visit('/help/contact');
      cy.get('textarea[name="message"]').type('Test message{enter}');
      cy.url().should('include', '/help/contact/sent');
    });

    it('should use arrow keys in dropdown menus', () => {
      cy.visit('/claims/new');
      cy.get('[data-testid="claim-type-dropdown"]').click().type('{downarrow}{downarrow}{enter}');
      cy.get('[data-testid="claim-type-dropdown"]').should('contain', 'Property');
    });
  });

  describe('Responsive Design Interactions', () => {
    it('should work on mobile devices', () => {
      cy.viewport(375, 667);
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
      });
      
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
      
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
      });
      
      cy.visit('/claims');
      cy.get('[data-testid="responsive-table"]').should('be.visible');
      cy.get('[data-testid="mobile-cards"]').should('not.exist');
    });

    it('should handle touch gestures', () => {
      cy.viewport(375, 667);
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
      });
      
      cy.visit('/claims/claim-123');
      cy.get('[data-testid="claim-images"]').first()
        .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
        .trigger('touchend');
      cy.get('[data-testid="image-viewer"]').should('be.visible');
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/api/claims', { forceNetworkError: true });
      cy.visit('/claims/new');
      cy.get('textarea[name="description"]').type('Test claim');
      cy.contains('Submit').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Network error');
      cy.contains('Retry').should('be.visible');
    });

    it('should show validation errors clearly', () => {
      cy.visit('/profile');
      cy.get('input[name="email"]').clear();
      cy.contains('Save').click();
      cy.get('[data-testid="field-error"]').should('contain', 'Email is required');
      cy.get('input[name="email"]').should('have.class', 'error');
    });

    it('should recover from session timeout', () => {
      cy.intercept('GET', '/api/user', { statusCode: 401 });
      cy.visit('/dashboard');
      cy.get('[data-testid="session-expired-modal"]').should('be.visible');
      cy.contains('Login Again').click();
      cy.url().should('include', '/login');
    });

    it('should handle server errors with retry', () => {
      cy.intercept('GET', '/api/claims', { statusCode: 500, times: 1 });
      cy.intercept('GET', '/api/claims', { fixture: 'claims.json' });
      cy.visit('/claims');
      cy.get('[data-testid="error-banner"]').should('be.visible');
      cy.contains('Retry').click();
      cy.get('[data-testid="claims-list"]').should('be.visible');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('userRole', 'policyholder');
        win.localStorage.setItem('userId', 'user-123');
      });
    });

    it('should show loading states during data fetch', () => {
      cy.intercept('GET', '/api/claims', { delay: 2000, fixture: 'claims.json' });
      cy.visit('/claims');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      cy.get('[data-testid="claims-list"]').should('be.visible');
    });

    it('should show progress during file upload', () => {
      cy.visit('/claims/new/upload-documents');
      cy.get('input[type="file"]').selectFile('cypress/fixtures/large-file.pdf');
      cy.get('[data-testid="upload-progress"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('have.attr', 'value');
    });

    it('should lazy load images in galleries', () => {
      cy.visit('/claims/claim-123');
      cy.get('[data-testid="image-gallery"]').scrollIntoView();
      cy.get('[data-testid="lazy-image"]').should('be.visible');
      cy.get('img[src*="placeholder"]').should('not.exist');
    });

    it('should optimize search results loading', () => {
      cy.visit('/claims');
      cy.get('[data-testid="search-input"]').type('auto accident');
      cy.get('[data-testid="search-spinner"]').should('be.visible');
      cy.wait(500);
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-spinner"]').should('not.exist');
    });
  });
}); 