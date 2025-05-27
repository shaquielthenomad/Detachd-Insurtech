# Detachd Platform - Comprehensive Test Suite

This directory contains a comprehensive Cypress test suite that covers all user flows and system functionality for the Detachd Insurtech Platform.

## 🎯 **Test Coverage**

### **Role-Based Tests (`01-role-based-routing.cy.ts`)**
- ✅ Super Admin access to all routes
- ✅ Insurer Admin restricted access  
- ✅ Policyholder standard user access
- ✅ Witness minimal access (claims only)
- ✅ Medical Professional QR scanner access
- ✅ Unauthenticated user redirects

### **Policyholder Workflow (`02-policyholder-workflow.cy.ts`)**
- ✅ Complete claim creation flow
- ✅ Document upload and validation
- ✅ Declaration and submission
- ✅ Claim management and viewing
- ✅ Certificate download
- ✅ Policy management
- ✅ Settings and profile updates

### **Admin Workflows (`03-admin-workflows.cy.ts`)**
- ✅ Super Admin dashboard functionality
- ✅ User management and approvals
- ✅ System settings configuration
- ✅ Audit log viewing
- ✅ Claims approval/rejection
- ✅ Report generation and export
- ✅ Analytics and monitoring

### **Witness & Medical Professional (`04-witness-medical-workflows.cy.ts`)**
- ✅ Witness statement submission
- ✅ Medical professional QR code scanning
- ✅ Claim joining via access codes
- ✅ Limited access verification
- ✅ Cross-user communication

### **Integration Tests (`05-integration-tests.cy.ts`)**
- ✅ Complete claim lifecycle (creation → approval → certificate)
- ✅ Multi-user collaboration workflows
- ✅ Error handling and recovery
- ✅ Cross-browser compatibility
- ✅ Performance and load testing

## 🚀 **Running Tests**

### **Prerequisites**
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### **Run All Tests**
```bash
# Run all tests headlessly
npm run test:e2e

# Open Cypress Test Runner (interactive)
npm run test:e2e:open
```

### **Run Specific Test Suites**
```bash
# Role-based routing tests
npm run test:role-based

# Policyholder workflow tests
npm run test:policyholder

# Admin workflow tests  
npm run test:admin

# Witness and medical professional tests
npm run test:witness-medical
```

### **Open Cypress GUI**
```bash
npm run cypress:open
```

## 🧪 **Test User Accounts**

The test suite uses these demo accounts:

```typescript
SUPER_ADMIN: { 
  email: 'admin@detachd.com', 
  password: 'admin123' 
}

INSURER_ADMIN: { 
  email: 'insurer@detachd.com', 
  password: 'insurer123' 
}

POLICYHOLDER: { 
  email: 'policyholder@detachd.com', 
  password: 'policy123' 
}

WITNESS: { 
  email: 'witness@detachd.com', 
  password: 'witness123' 
}

MEDICAL_PRO: { 
  email: 'doctor@detachd.com', 
  password: 'doctor123' 
}
```

## 🔧 **Custom Commands**

### **Authentication**
```typescript
cy.loginAs('POLICYHOLDER')        // Login as specific user type
cy.loginWithCredentials(email, password)  // Custom login
cy.logout()                       // Logout current user
```

### **Claims Management**
```typescript
cy.createTestClaim(claimData)     // Create test claim
cy.uploadTestDocument()           // Upload test files
cy.submitWitnessStatement(text)   // Submit witness statement
```

### **Admin Functions**
```typescript
cy.exportReport('csv')            // Export reports
cy.verifyAccessDenied()          // Check access restrictions
```

### **Role Verification**
```typescript
cy.verifyRole('super_admin')                    // Check user role
cy.verifyUserRedirectedToCorrectDashboard(type) // Check redirects
```

## 📁 **File Structure**

```
cypress/
├── e2e/                          # Test specifications
│   ├── 01-role-based-routing.cy.ts
│   ├── 02-policyholder-workflow.cy.ts  
│   ├── 03-admin-workflows.cy.ts
│   ├── 04-witness-medical-workflows.cy.ts
│   └── 05-integration-tests.cy.ts
├── fixtures/                     # Test data files
│   ├── test-image.jpg
│   ├── test-document.pdf
│   └── large-claims-dataset.json
├── support/                      # Custom commands & configuration
│   ├── commands.ts
│   └── e2e.ts
└── README.md                     # This file
```

## ✅ **Test Scenarios Covered**

### **Authentication & Authorization**
- [x] Role-based access control
- [x] Session management
- [x] Token expiry handling
- [x] Unauthorized access prevention

### **Claim Management**
- [x] Claim creation workflow
- [x] Document upload validation
- [x] Status updates and notifications
- [x] Certificate generation and download
- [x] Multi-user collaboration

### **Admin Functions**
- [x] User approval workflows
- [x] System configuration
- [x] Report generation (CSV/PDF)
- [x] Analytics and monitoring
- [x] Audit trail management

### **User Experience**
- [x] Responsive design testing
- [x] Form validation
- [x] Error handling and recovery
- [x] Performance benchmarks
- [x] Cross-browser compatibility

### **Integration Testing**
- [x] End-to-end claim lifecycle
- [x] Multi-user workflows
- [x] API error handling
- [x] File upload edge cases
- [x] System health monitoring

## 🎨 **Adding New Tests**

### **1. Create Test File**
```typescript
// cypress/e2e/06-new-feature.cy.ts
describe('New Feature Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should test new functionality', () => {
    cy.loginAs('POLICYHOLDER');
    // Your test logic here
  });
});
```

### **2. Add Test Data**
```typescript
// cypress/fixtures/new-test-data.json
{
  "testData": "value"
}
```

### **3. Create Custom Commands (if needed)**
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('customCommand', () => {
  // Custom command logic
});
```

### **4. Add npm Script**
```json
{
  "scripts": {
    "test:new-feature": "cypress run --spec 'cypress/e2e/06-new-feature.cy.ts'"
  }
}
```

## 🐛 **Debugging Tests**

### **Interactive Mode**
```bash
npm run cypress:open
```

### **Screenshots & Videos**
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

### **Debug Output**
```typescript
cy.debug()          // Pause execution
cy.log('message')   // Console logging
cy.pause()          // Interactive pause
```

## 📊 **Test Reports**

Tests generate:
- **Screenshots** on failure
- **Videos** of test runs
- **Detailed logs** in terminal
- **Performance metrics**

## 🔄 **CI/CD Integration**

Add to GitHub Actions:
```yaml
- name: Run E2E Tests
  run: |
    npm install
    npm run dev &
    npx wait-on http://localhost:5173
    npm run test:e2e
```

## 📋 **Best Practices**

1. **Test Independence**: Each test should be isolated
2. **Data Cleanup**: Clear state between tests
3. **Realistic Data**: Use representative test data
4. **Error Scenarios**: Test both success and failure paths
5. **Performance**: Monitor test execution time
6. **Maintenance**: Keep tests updated with code changes

## 🎯 **Coverage Goals**

- ✅ **Authentication**: 100% coverage
- ✅ **Core Workflows**: 95% coverage  
- ✅ **Admin Functions**: 90% coverage
- ✅ **Error Handling**: 85% coverage
- ✅ **Integration**: 80% coverage

---

## 🚀 **Quick Start**

```bash
# Clone and setup
git clone <repo>
cd detachd-insurtech-platform
npm install

# Start dev server
npm run dev

# Run all tests
npm run test:e2e

# Open test runner
npm run cypress:open
```

**Ready to test all user flows! 🎉** 