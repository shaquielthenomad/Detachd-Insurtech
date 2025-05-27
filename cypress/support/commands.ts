/// <reference types="cypress" />
import 'cypress-file-upload';

// Demo accounts for testing
export const DEMO_ACCOUNTS = {
  SUPER_ADMIN: { email: 'admin@detachd.com', password: 'admin123', role: 'super_admin' },
  INSURER_ADMIN: { email: 'insurer@detachd.com', password: 'insurer123', role: 'insurer_admin' },
  POLICYHOLDER: { email: 'policyholder@detachd.com', password: 'policy123', role: 'policyholder' },
  WITNESS: { email: 'witness@detachd.com', password: 'witness123', role: 'witness' },
  MEDICAL_PRO: { email: 'doctor@detachd.com', password: 'doctor123', role: 'medical_professional' }
};

// Custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(userType: keyof typeof DEMO_ACCOUNTS): Chainable<void>
      loginWithCredentials(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      verifyRole(expectedRole: string): Chainable<void>
      verifyUserRedirectedToCorrectDashboard(userType: keyof typeof DEMO_ACCOUNTS): Chainable<void>
      createTestClaim(claimData?: any): Chainable<void>
      uploadTestDocument(): Chainable<void>
      verifyAccessDenied(): Chainable<void>
      submitWitnessStatement(statement: string): Chainable<void>
      exportReport(format: 'csv' | 'pdf'): Chainable<void>
    }
  }
}

// Login as a specific user type
Cypress.Commands.add('loginAs', (userType: keyof typeof DEMO_ACCOUNTS) => {
  const account = DEMO_ACCOUNTS[userType];
  cy.visit('/login');
  cy.get('input[type="email"]').type(account.email);
  cy.get('input[type="password"]').type(account.password);
  cy.get('button[type="submit"]').click();
  cy.wait(2000); // Wait for redirect
});

// Login with custom credentials
Cypress.Commands.add('loginWithCredentials', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait(2000);
});

// Logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/logout-success');
});

// Verify user role (check if role is displayed somewhere in UI)
Cypress.Commands.add('verifyRole', (expectedRole: string) => {
  // This assumes role is displayed in user profile or header
  cy.get('[data-testid="user-role"]').should('contain', expectedRole);
});

// Verify user is redirected to correct dashboard based on role
Cypress.Commands.add('verifyUserRedirectedToCorrectDashboard', (userType: keyof typeof DEMO_ACCOUNTS) => {
  const roleToRoute = {
    SUPER_ADMIN: '/dashboard',
    INSURER_ADMIN: '/dashboard',
    POLICYHOLDER: '/dashboard',
    WITNESS: '/witness/claims',
    MEDICAL_PRO: '/medical/join-claim'
  };
  
  cy.url().should('include', roleToRoute[userType]);
});

// Create a test claim (for policyholders)
Cypress.Commands.add('createTestClaim', (claimData = {}) => {
  const defaultClaimData = {
    claimType: 'Auto Accident',
    dateOfLoss: '2024-01-15',
    location: 'Cape Town, South Africa',
    description: 'Test claim for automated testing',
    estimatedAmount: '25000',
    ...claimData
  };

  cy.visit('/claims/new');
  cy.get('select[name="claimType"]').select(defaultClaimData.claimType);
  cy.get('input[name="dateOfLoss"]').type(defaultClaimData.dateOfLoss);
  cy.get('input[name="location"]').type(defaultClaimData.location);
  cy.get('textarea[name="incidentDescription"]').type(defaultClaimData.description);
  cy.get('input[name="estimatedAmount"]').type(defaultClaimData.estimatedAmount);
  cy.get('button[type="submit"]').click();
});

// Upload a test document
Cypress.Commands.add('uploadTestDocument', () => {
  const fileName = 'test-document.pdf';
  cy.fixture(fileName, 'base64').then(fileContent => {
    cy.get('input[type="file"]').attachFile({
      fileContent,
      fileName,
      mimeType: 'application/pdf',
      encoding: 'base64'
    });
  });
});

// Verify access denied page is shown
Cypress.Commands.add('verifyAccessDenied', () => {
  cy.contains('Access Denied').should('be.visible');
  cy.contains('You don\'t have permission').should('be.visible');
});

// Submit witness statement
Cypress.Commands.add('submitWitnessStatement', (statement: string) => {
  cy.get('textarea[placeholder*="witnessed"]').type(statement);
  cy.contains('Submit Statement').click();
  cy.contains('Statement submitted successfully').should('be.visible');
});

// Export report (for admin users)
Cypress.Commands.add('exportReport', (format: 'csv' | 'pdf') => {
  cy.visit('/reports');
  cy.get(`[data-testid="export-${format}"]`).click();
  // Verify download starts (file should download)
  cy.readFile(`cypress/downloads/claims-report.${format}`, { timeout: 10000 }).should('exist');
}); 