/**
 * Detachd Insurtech Platform - Automated Test Companion Script
 * 
 * Run this script in the browser console to automate basic testing procedures.
 * This script complements the manual testing script for efficient QA.
 * 
 * Usage:
 * 1. Open browser developer tools (F12)
 * 2. Navigate to Console tab
 * 3. Copy and paste this entire script
 * 4. Run individual test functions as needed
 */

// Test Configuration
const TEST_CONFIG = {
  baseUrl: window.location.origin,
  demoAccounts: [
    { email: 'admin@detachd.com', password: 'admin123', role: 'Super Admin' },
    { email: 'insurer@detachd.com', password: 'insurer123', role: 'Insurer Party' },
    { email: 'policyholder@detachd.com', password: 'policy123', role: 'Policyholder' },
    { email: 'witness@detachd.com', password: 'witness123', role: 'Witness' },
    { email: 'doctor@detachd.com', password: 'doctor123', role: 'Medical Professional' }
  ],
  testRoutes: [
    '/', '/login', '/enter-claim-code', '/onboarding/role', '/about', '/terms', '/privacy', '/contact'
  ],
  protectedRoutes: [
    '/dashboard', '/claims', '/my-policy', '/profile', '/settings', '/help', '/analytics', '/reports', '/team'
  ],
  placeholderRoutes: [
    '/reset-password/test', '/two-factor-auth', '/verify-account/test', '/accessibility',
    '/compliance', '/dispute-resolution', '/tasks/information-requests', '/tasks/flagged-items',
    '/reports/schedule', '/reports/export', '/notifications/suspicious-activity',
    '/team/edit/test', '/team/roles', '/settings/update-password', '/settings/delete-account'
  ]
};

// Utility Functions
const TestUtils = {
  log: (message, type = 'info') => {
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336'
    };
    console.log(`%c[TEST] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
  },

  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  getCurrentRoute: () => window.location.hash.replace('#', '') || '/',

  navigateTo: (route) => {
    if (route.startsWith('#')) {
      window.location.hash = route;
    } else {
      window.location.hash = '#' + route;
    }
    return TestUtils.wait(1000); // Wait for navigation
  },

  findElement: (selector) => document.querySelector(selector),

  findElements: (selector) => document.querySelectorAll(selector),

  clickElement: async (selector) => {
    const element = TestUtils.findElement(selector);
    if (element) {
      element.click();
      await TestUtils.wait(500);
      return true;
    }
    return false;
  },

  fillInput: (selector, value) => {
    const input = TestUtils.findElement(selector);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  },

  checkPageLoad: () => {
    return document.readyState === 'complete' && 
           !TestUtils.findElement('[data-testid="loading"]') &&
           !document.body.textContent.includes('Loading...');
  },

  measurePageLoad: async (route) => {
    const startTime = performance.now();
    await TestUtils.navigateTo(route);
    
    // Wait for page to fully load
    let attempts = 0;
    while (!TestUtils.checkPageLoad() && attempts < 30) {
      await TestUtils.wait(100);
      attempts++;
    }
    
    const endTime = performance.now();
    return (endTime - startTime) / 1000; // Return in seconds
  }
};

// Test Suites
const TestSuites = {
  
  // Test 1: Route Accessibility
  async testRouteAccessibility() {
    TestUtils.log('Starting Route Accessibility Test', 'info');
    const results = [];

    for (const route of TEST_CONFIG.testRoutes) {
      try {
        const loadTime = await TestUtils.measurePageLoad(route);
        const pageLoaded = TestUtils.checkPageLoad();
        const hasErrors = !!TestUtils.findElement('.error, [data-testid="error"]');
        
        results.push({
          route,
          accessible: pageLoaded && !hasErrors,
          loadTime: loadTime.toFixed(2) + 's',
          status: pageLoaded ? (hasErrors ? 'ERROR' : 'PASS') : 'FAIL'
        });

        TestUtils.log(`Route ${route}: ${pageLoaded ? (hasErrors ? 'ERROR' : 'PASS') : 'FAIL'} (${loadTime.toFixed(2)}s)`, 
                     pageLoaded ? (hasErrors ? 'error' : 'success') : 'error');
      } catch (error) {
        results.push({
          route,
          accessible: false,
          loadTime: 'N/A',
          status: 'FAIL',
          error: error.message
        });
        TestUtils.log(`Route ${route}: FAIL - ${error.message}`, 'error');
      }
    }

    return results;
  },

  // Test 2: Authentication Flow
  async testAuthentication() {
    TestUtils.log('Starting Authentication Test', 'info');
    const results = [];

    // Navigate to login page
    await TestUtils.navigateTo('/login');
    
    for (const account of TEST_CONFIG.demoAccounts) {
      try {
        TestUtils.log(`Testing login for ${account.role}`, 'info');
        
        // Fill login form
        const emailFilled = TestUtils.fillInput('input[name="email"], input[type="email"]', account.email);
        const passwordFilled = TestUtils.fillInput('input[name="password"], input[type="password"]', account.password);
        
        if (!emailFilled || !passwordFilled) {
          throw new Error('Could not find login form inputs');
        }

        // Submit form
        const submitClicked = await TestUtils.clickElement('button[type="submit"], .login-button, button:contains("Login")');
        
        if (!submitClicked) {
          throw new Error('Could not find submit button');
        }

        // Wait for navigation
        await TestUtils.wait(2000);
        
        // Check if redirected to dashboard
        const currentRoute = TestUtils.getCurrentRoute();
        const loginSuccessful = currentRoute.includes('dashboard') || 
                              TestUtils.findElement('[data-testid="dashboard"]') ||
                              document.body.textContent.includes('Dashboard');

        results.push({
          account: account.role,
          email: account.email,
          loginSuccessful,
          redirectRoute: currentRoute,
          status: loginSuccessful ? 'PASS' : 'FAIL'
        });

        TestUtils.log(`${account.role} login: ${loginSuccessful ? 'PASS' : 'FAIL'}`, 
                     loginSuccessful ? 'success' : 'error');

        // Logout if successful
        if (loginSuccessful) {
          await TestUtils.clickElement('.logout-button, [data-testid="logout"]');
          await TestUtils.wait(1000);
        }

        // Return to login page for next test
        await TestUtils.navigateTo('/login');
        
      } catch (error) {
        results.push({
          account: account.role,
          email: account.email,
          loginSuccessful: false,
          status: 'FAIL',
          error: error.message
        });
        TestUtils.log(`${account.role} login: FAIL - ${error.message}`, 'error');
      }
    }

    return results;
  },

  // Test 3: Placeholder Pages
  async testPlaceholderPages() {
    TestUtils.log('Starting Placeholder Pages Test', 'info');
    const results = [];

    for (const route of TEST_CONFIG.placeholderRoutes) {
      try {
        await TestUtils.navigateTo(route);
        await TestUtils.wait(1000);

        const hasPlaceholder = TestUtils.findElement('.placeholder') ||
                              document.body.textContent.includes('Feature In Development') ||
                              document.body.textContent.includes('Under Development') ||
                              document.body.textContent.includes('Coming Soon');

        const pageLoaded = TestUtils.checkPageLoad();

        results.push({
          route,
          isPlaceholder: hasPlaceholder,
          pageLoaded,
          status: pageLoaded && hasPlaceholder ? 'PASS' : 'FAIL'
        });

        TestUtils.log(`Placeholder ${route}: ${pageLoaded && hasPlaceholder ? 'PASS' : 'FAIL'}`, 
                     pageLoaded && hasPlaceholder ? 'success' : 'warning');

      } catch (error) {
        results.push({
          route,
          isPlaceholder: false,
          pageLoaded: false,
          status: 'FAIL',
          error: error.message
        });
        TestUtils.log(`Placeholder ${route}: FAIL - ${error.message}`, 'error');
      }
    }

    return results;
  },

  // Test 4: Form Validation
  async testFormValidation() {
    TestUtils.log('Starting Form Validation Test', 'info');
    const results = [];

    // Test login form validation
    await TestUtils.navigateTo('/login');
    
    try {
      // Try submitting empty form
      await TestUtils.clickElement('button[type="submit"]');
      await TestUtils.wait(500);

      const hasValidationErrors = TestUtils.findElement('.error, .invalid, [data-testid="error"]') ||
                                 document.body.textContent.includes('required') ||
                                 document.body.textContent.includes('Please enter');

      results.push({
        form: 'Login Form',
        test: 'Empty submission',
        hasValidation: hasValidationErrors,
        status: hasValidationErrors ? 'PASS' : 'FAIL'
      });

      // Test invalid email format
      TestUtils.fillInput('input[name="email"], input[type="email"]', 'invalid-email');
      await TestUtils.clickElement('button[type="submit"]');
      await TestUtils.wait(500);

      const hasEmailValidation = TestUtils.findElement('.error, .invalid') ||
                                document.body.textContent.includes('valid email') ||
                                document.body.textContent.includes('invalid');

      results.push({
        form: 'Login Form',
        test: 'Invalid email format',
        hasValidation: hasEmailValidation,
        status: hasEmailValidation ? 'PASS' : 'FAIL'
      });

    } catch (error) {
      results.push({
        form: 'Login Form',
        test: 'Validation test',
        hasValidation: false,
        status: 'FAIL',
        error: error.message
      });
    }

    return results;
  },

  // Test 5: Responsive Design Check
  async testResponsiveDesign() {
    TestUtils.log('Starting Responsive Design Test', 'info');
    const results = [];
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ];

    const originalSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    for (const viewport of viewports) {
      try {
        // Resize window (note: this might not work in all browsers)
        window.resizeTo(viewport.width, viewport.height);
        await TestUtils.wait(500);

        // Navigate to dashboard (assuming user is logged in)
        await TestUtils.navigateTo('/dashboard');
        await TestUtils.wait(1000);

        // Check for mobile menu, responsive layout, etc.
        const hasMobileMenu = TestUtils.findElement('.mobile-menu, .hamburger, [data-testid="mobile-menu"]');
        const hasOverflow = window.innerWidth < document.documentElement.scrollWidth;
        const elementsVisible = TestUtils.findElements('button, input, a').length > 0;

        results.push({
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          hasMobileMenu: viewport.width < 768 ? hasMobileMenu : true,
          noHorizontalScroll: !hasOverflow,
          elementsVisible,
          status: (!hasOverflow && elementsVisible) ? 'PASS' : 'FAIL'
        });

        TestUtils.log(`${viewport.name} (${viewport.width}x${viewport.height}): ${(!hasOverflow && elementsVisible) ? 'PASS' : 'FAIL'}`,
                     (!hasOverflow && elementsVisible) ? 'success' : 'warning');

      } catch (error) {
        results.push({
          viewport: viewport.name,
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // Restore original window size
    window.resizeTo(originalSize.width, originalSize.height);

    return results;
  },

  // Test 6: Performance Check
  async testPerformance() {
    TestUtils.log('Starting Performance Test', 'info');
    const results = [];
    const testRoutes = ['/dashboard', '/claims', '/my-policy', '/settings'];

    for (const route of testRoutes) {
      try {
        const loadTime = await TestUtils.measurePageLoad(route);
        const performanceEntries = performance.getEntriesByType('navigation')[0];
        
        results.push({
          route,
          loadTime: loadTime.toFixed(2) + 's',
          domContentLoaded: performanceEntries ? (performanceEntries.domContentLoadedEventEnd - performanceEntries.navigationStart).toFixed(2) + 'ms' : 'N/A',
          status: loadTime < 3 ? 'PASS' : 'SLOW'
        });

        TestUtils.log(`${route} load time: ${loadTime.toFixed(2)}s - ${loadTime < 3 ? 'PASS' : 'SLOW'}`,
                     loadTime < 3 ? 'success' : 'warning');

      } catch (error) {
        results.push({
          route,
          loadTime: 'ERROR',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    return results;
  }
};

// Main Test Runner
const TestRunner = {
  async runAllTests() {
    TestUtils.log('Starting Comprehensive Test Suite', 'info');
    console.log('🧪 DETACHD PLATFORM AUTOMATED TESTING');
    console.log('=====================================');

    const testResults = {};

    try {
      testResults.routeAccessibility = await TestSuites.testRouteAccessibility();
      testResults.authentication = await TestSuites.testAuthentication();
      testResults.placeholderPages = await TestSuites.testPlaceholderPages();
      testResults.formValidation = await TestSuites.testFormValidation();
      testResults.responsiveDesign = await TestSuites.testResponsiveDesign();
      testResults.performance = await TestSuites.testPerformance();

      // Generate summary
      TestRunner.generateTestReport(testResults);

    } catch (error) {
      TestUtils.log(`Test suite failed: ${error.message}`, 'error');
    }

    return testResults;
  },

  generateTestReport(results) {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');

    Object.keys(results).forEach(testName => {
      const testResults = results[testName];
      const passed = testResults.filter(r => r.status === 'PASS').length;
      const failed = testResults.filter(r => r.status === 'FAIL').length;
      const total = testResults.length;

      console.log(`\n${testName.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${passed}/${total}`);
      console.log(`  ❌ Failed: ${failed}/${total}`);
      console.log(`  📊 Success Rate: ${((passed/total)*100).toFixed(1)}%`);

      if (failed > 0) {
        console.log('  ⚠️  Failed Tests:');
        testResults.filter(r => r.status === 'FAIL').forEach(failedTest => {
          console.log(`    - ${failedTest.route || failedTest.account || failedTest.form || failedTest.viewport || 'Unknown'}: ${failedTest.error || 'Failed'}`);
        });
      }
    });

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('===================');
    
    // Generate recommendations based on results
    if (results.routeAccessibility.some(r => r.status === 'FAIL')) {
      console.log('• Fix route accessibility issues - some pages are not loading properly');
    }
    
    if (results.authentication.some(r => r.status === 'FAIL')) {
      console.log('• Review authentication flow - some demo accounts are not working');
    }
    
    if (results.performance.some(r => r.status === 'SLOW')) {
      console.log('• Optimize page load times - some pages are loading slowly');
    }
    
    if (results.formValidation.some(r => r.status === 'FAIL')) {
      console.log('• Implement proper form validation');
    }

    console.log('\n💾 Save these results and compare with manual testing checklist!');
  }
};

// Export functions for individual testing
window.DetachdTestSuite = {
  TestUtils,
  TestSuites,
  TestRunner,
  
  // Quick test functions
  quickRouteTest: () => TestSuites.testRouteAccessibility(),
  quickAuthTest: () => TestSuites.testAuthentication(),
  quickPlaceholderTest: () => TestSuites.testPlaceholderPages(),
  quickPerfTest: () => TestSuites.testPerformance(),
  
  runAll: () => TestRunner.runAllTests()
};

// Auto-run message
console.log('🚀 Detachd Test Suite Loaded!');
console.log('Available commands:');
console.log('  DetachdTestSuite.runAll() - Run complete test suite');
console.log('  DetachdTestSuite.quickRouteTest() - Test route accessibility');
console.log('  DetachdTestSuite.quickAuthTest() - Test authentication');
console.log('  DetachdTestSuite.quickPlaceholderTest() - Test placeholder pages');
console.log('  DetachdTestSuite.quickPerfTest() - Test performance');
console.log('\nExample: DetachdTestSuite.runAll().then(results => console.table(results.routeAccessibility))'); 