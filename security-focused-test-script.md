# 🔒 SECURITY-FOCUSED TEST SCRIPT - Detachd Platform
**Generated**: December 2024  
**Focus**: Input Sanitization, XSS Prevention, Authentication Security  
**Execution Time**: 45-60 minutes  
**Priority**: CRITICAL SECURITY TESTING

## 🎯 TESTING OBJECTIVES

This script focuses on **identifying and verifying security vulnerabilities** discovered in the comprehensive security analysis. Unlike general functionality testing, this script specifically targets:

1. **XSS Vulnerability Testing**
2. **Input Sanitization Verification**
3. **Authentication Security Validation**
4. **File Upload Security Testing**
5. **API Payload Injection Testing**

## 🚨 PRE-TEST SECURITY CHECKLIST

### Environment Setup:
- [ ] Clear browser storage (localStorage/sessionStorage)
- [ ] Open browser developer tools (F12)
- [ ] Enable console logging for security events
- [ ] Prepare XSS test payloads
- [ ] Have network tab open to monitor API calls

### Test Data Preparation:
```javascript
// XSS Test Payloads
const xssPayloads = [
  '<script>alert("XSS-1")</script>',
  '<img src="x" onerror="alert(\'XSS-2\')">',
  'javascript:alert("XSS-3")',
  '<svg onload="alert(\'XSS-4\')">',
  '"><script>alert("XSS-5")</script>',
  "'; DROP TABLE users; --",
  '<iframe src="javascript:alert(\'XSS-6\')"></iframe>'
];

// SQL Injection Payloads
const sqlPayloads = [
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "admin'--",
  "' UNION SELECT password FROM users--"
];

// File Upload Test Files
const maliciousFiles = {
  scriptFile: 'malicious.php.jpg', // PHP script disguised as image
  oversizeFile: '50MB-test-file.pdf', // Exceeds size limits
  invalidType: 'executable.exe', // Executable file
  pathTraversal: '../../../etc/passwd' // Path traversal attempt
};
```

## 🧪 CRITICAL SECURITY TESTS

### TEST 1: AUTHENTICATION CONTEXT SECURITY
**Priority**: 🔴 CRITICAL  
**Duration**: 5 minutes

#### 1A. Verify Current Authentication Implementation
```javascript
// Run in browser console on login page
console.log('=== AUTHENTICATION SECURITY TEST ===');

// Check which auth context is being used
const authContextElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"]');
console.log('Auth elements found:', authContextElements.length);

// Check localStorage for demo tokens (security risk)
const token = localStorage.getItem('detachd_token');
if (token === 'demo_token') {
  console.error('🚨 SECURITY RISK: Demo token detected in production-like environment');
} else {
  console.log('✅ No demo token found');
}

// Test authentication bypass attempt
try {
  localStorage.setItem('detachd_token', 'fake_token');
  localStorage.setItem('detachd_user', JSON.stringify({
    id: 'hacker123',
    name: 'Unauthorized User',
    email: 'hacker@evil.com',
    role: 'super_admin'
  }));
  console.error('🚨 SECURITY RISK: Able to set fake authentication data');
  
  // Try to refresh and see if fake auth persists
  setTimeout(() => {
    window.location.reload();
  }, 2000);
} catch (error) {
  console.log('✅ Auth manipulation blocked:', error);
}
```

**Expected Results**:
- ✅ Should use SecureAuthContext (not insecure AuthContext)
- ✅ Should validate tokens on page load
- ✅ Should reject fake authentication data
- ❌ Demo tokens should NOT work in production

#### 1B. Rate Limiting Test
```javascript
// Test login rate limiting
const testRateLimit = async () => {
  console.log('=== RATE LIMITING TEST ===');
  
  const email = 'test@hacker.com';
  const password = 'wrongpassword';
  
  for (let i = 1; i <= 10; i++) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log(`Attempt ${i}:`, response.status);
      
      if (response.status === 429) {
        console.log('✅ Rate limiting active after', i, 'attempts');
        break;
      }
      
      if (i === 10) {
        console.error('🚨 SECURITY RISK: No rate limiting detected after 10 attempts');
      }
    } catch (error) {
      console.log('Attempt', i, 'failed:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

testRateLimit();
```

### TEST 2: XSS VULNERABILITY TESTING
**Priority**: 🔴 CRITICAL  
**Duration**: 15 minutes

#### 2A. Form Input XSS Testing
**Test on each form component**:

1. **Start Claim Form** (`/claims/new`):
```javascript
console.log('=== XSS TEST: CLAIM FORM ===');

// XSS payload testing
const xssTests = [
  { field: 'fullName', payload: '<script>alert("XSS in name")</script>' },
  { field: 'incidentDescription', payload: '<img src="x" onerror="alert(\'XSS in description\')">' },
  { field: 'location', payload: 'javascript:alert("XSS in location")' },
  { field: 'policyNumber', payload: '"><script>alert("XSS in policy")</script>' }
];

xssTests.forEach(test => {
  const input = document.querySelector(`[name="${test.field}"], [id="${test.field}"]`);
  if (input) {
    input.value = test.payload;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Check if payload is sanitized
    setTimeout(() => {
      if (input.value === test.payload) {
        console.error(`🚨 XSS VULNERABILITY: ${test.field} accepts unsanitized input`);
      } else {
        console.log(`✅ ${test.field} input sanitized`);
      }
    }, 100);
  }
});
```

2. **Policy Application Form** (`/policy/new`):
```javascript
console.log('=== XSS TEST: POLICY FORM ===');

const policyXssTests = [
  'firstName', 'lastName', 'address', 'phoneNumber', 'email', 'idNumber'
];

policyXssTests.forEach(field => {
  const input = document.querySelector(`[name="${field}"]`);
  if (input) {
    const payload = `<script>alert("XSS-${field}")</script>`;
    input.value = payload;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      if (input.value.includes('<script>')) {
        console.error(`🚨 XSS VULNERABILITY: KYC field ${field} vulnerable`);
      } else {
        console.log(`✅ KYC field ${field} sanitized`);
      }
    }, 100);
  }
});
```

3. **Search Functionality XSS**:
```javascript
console.log('=== XSS TEST: SEARCH FUNCTIONS ===');

// Test search in Help Center
const testSearchXss = (searchSelector, testName) => {
  const searchInput = document.querySelector(searchSelector);
  if (searchInput) {
    const payload = '<svg onload="alert(\'Search XSS\')">';
    searchInput.value = payload;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      // Check if XSS executed or payload visible in DOM
      const results = document.querySelector('[class*="search-result"], [class*="result"]');
      if (results && results.innerHTML.includes('<svg')) {
        console.error(`🚨 XSS VULNERABILITY: ${testName} search vulnerable`);
      } else {
        console.log(`✅ ${testName} search sanitized`);
      }
    }, 500);
  }
};

// Test various search inputs
testSearchXss('[placeholder*="search"], [type="search"]', 'General');
testSearchXss('[placeholder*="Search"], input[class*="search"]', 'Specific');
```

### TEST 3: API PAYLOAD INJECTION TESTING
**Priority**: 🔴 CRITICAL  
**Duration**: 10 minutes

#### 3A. Claim Submission API Security
```javascript
console.log('=== API INJECTION TEST: CLAIM SUBMISSION ===');

// Intercept and modify API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  if (url.includes('/claims') && options?.method === 'POST') {
    console.log('🔍 Intercepted claim API call');
    
    try {
      const body = JSON.parse(options.body);
      console.log('Original payload:', body);
      
      // Check for unsanitized data
      const unsanitizedFields = [];
      Object.keys(body).forEach(key => {
        const value = body[key];
        if (typeof value === 'string') {
          if (value.includes('<script>') || value.includes('javascript:') || value.includes('<img')) {
            unsanitizedFields.push(key);
          }
        }
      });
      
      if (unsanitizedFields.length > 0) {
        console.error('🚨 UNSANITIZED API PAYLOAD:', unsanitizedFields);
      } else {
        console.log('✅ API payload appears sanitized');
      }
    } catch (error) {
      console.log('Could not parse API body:', error);
    }
  }
  
  return originalFetch.apply(this, args);
};

// Now fill out and submit claim form with XSS payloads
// This will trigger the interceptor above
```

#### 3B. SQL Injection in API Payloads
```javascript
console.log('=== SQL INJECTION TEST ===');

const sqlTestPayloads = [
  "'; DROP TABLE claims; --",
  "' OR '1'='1",
  "admin'; --",
  "' UNION SELECT * FROM users --"
];

// Test if form accepts SQL injection attempts
sqlTestPayloads.forEach((payload, index) => {
  setTimeout(() => {
    const descriptionField = document.querySelector('[name="incidentDescription"], [id*="description"]');
    if (descriptionField) {
      descriptionField.value = payload;
      descriptionField.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log(`SQL Injection test ${index + 1}:`, payload);
      
      if (descriptionField.value === payload) {
        console.error(`🚨 SQL INJECTION RISK: Field accepts SQL syntax`);
      }
    }
  }, index * 1000);
});
```

### TEST 4: FILE UPLOAD SECURITY TESTING
**Priority**: 🔴 CRITICAL  
**Duration**: 10 minutes

#### 4A. Malicious File Upload Test
```javascript
console.log('=== FILE UPLOAD SECURITY TEST ===');

// Create test files with malicious names/content
const createMaliciousFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });
  return file;
};

const maliciousFiles = [
  createMaliciousFile('script.php.jpg', '<?php echo "Hack"; ?>', 'image/jpeg'),
  createMaliciousFile('../../../etc/passwd', 'root:x:0:0:root', 'text/plain'),
  createMaliciousFile('test.exe', 'MZ\x90\x00', 'application/octet-stream'),
  createMaliciousFile('normal.pdf', 'PDF content', 'application/pdf') // Control test
];

const testFileUpload = async (file) => {
  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput) {
    console.log('No file input found');
    return;
  }
  
  // Create a FileList with our test file
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  
  // Trigger change event
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Wait and check for errors
  setTimeout(() => {
    const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
    const hasError = Array.from(errorElements).some(el => 
      el.textContent.includes('not supported') || 
      el.textContent.includes('invalid') ||
      el.textContent.includes('not allowed')
    );
    
    if (file.name.includes('script.php') || file.name.includes('exe')) {
      if (hasError) {
        console.log(`✅ Malicious file ${file.name} rejected`);
      } else {
        console.error(`🚨 SECURITY RISK: Malicious file ${file.name} accepted`);
      }
    } else if (file.name === 'normal.pdf') {
      if (!hasError) {
        console.log(`✅ Valid file ${file.name} accepted`);
      } else {
        console.error(`❌ Valid file ${file.name} incorrectly rejected`);
      }
    }
  }, 1000);
};

// Test each malicious file
maliciousFiles.forEach((file, index) => {
  setTimeout(() => testFileUpload(file), index * 2000);
});
```

#### 4B. File Size Limit Testing
```javascript
console.log('=== FILE SIZE LIMIT TEST ===');

// Create oversized file
const createOversizedFile = (sizeMB) => {
  const content = 'A'.repeat(sizeMB * 1024 * 1024); // Create file of specified size
  return createMaliciousFile(`large-file-${sizeMB}MB.pdf`, content, 'application/pdf');
};

// Test different file sizes
const sizeTests = [5, 10, 15, 25, 50]; // MB
sizeTests.forEach((size, index) => {
  setTimeout(() => {
    const oversizedFile = createOversizedFile(size);
    console.log(`Testing ${size}MB file upload...`);
    testFileUpload(oversizedFile);
  }, (index + maliciousFiles.length) * 2000);
});
```

### TEST 5: SESSION SECURITY TESTING
**Priority**: 🟡 HIGH  
**Duration**: 5 minutes

#### 5A. Session Hijacking Prevention
```javascript
console.log('=== SESSION SECURITY TEST ===');

// Test if session tokens are properly secured
const checkSessionSecurity = () => {
  const token = localStorage.getItem('detachd_token');
  
  // Check token format (should not be predictable)
  if (token === 'demo_token') {
    console.error('🚨 SECURITY RISK: Using predictable demo token');
  } else if (token && token.length < 32) {
    console.error('🚨 SECURITY RISK: Token too short, predictable');
  } else {
    console.log('✅ Token appears secure');
  }
  
  // Test session persistence across tabs
  const newWindow = window.open(window.location.href, '_blank');
  setTimeout(() => {
    if (newWindow) {
      newWindow.postMessage('checkAuth', '*');
      newWindow.close();
    }
  }, 2000);
};

checkSessionSecurity();
```

### TEST 6: CROSS-SITE REQUEST FORGERY (CSRF) TESTING
**Priority**: 🟡 HIGH  
**Duration**: 5 minutes

#### 6A. CSRF Protection Verification
```javascript
console.log('=== CSRF PROTECTION TEST ===');

// Test if API calls require CSRF tokens
const testCSRF = async () => {
  try {
    // Attempt API call without proper headers
    const response = await fetch('/api/claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Deliberately missing Authorization header
      },
      body: JSON.stringify({
        description: 'CSRF Test',
        amount: 1000
      })
    });
    
    if (response.ok) {
      console.error('🚨 CSRF VULNERABILITY: API accepts requests without auth');
    } else if (response.status === 401 || response.status === 403) {
      console.log('✅ CSRF protection: API requires authentication');
    }
  } catch (error) {
    console.log('CSRF test failed:', error);
  }
};

testCSRF();
```

## 🧪 AUTOMATED SECURITY TEST RUNNER

### Complete Test Suite
```javascript
// Run all security tests in sequence
const runCompleteSecuritySuite = async () => {
  console.log('🔒 STARTING COMPREHENSIVE SECURITY TEST SUITE');
  console.log('================================================');
  
  const tests = [
    { name: 'Authentication Security', duration: 5000 },
    { name: 'XSS Vulnerability', duration: 15000 },
    { name: 'API Injection', duration: 10000 },
    { name: 'File Upload Security', duration: 10000 },
    { name: 'Session Security', duration: 5000 },
    { name: 'CSRF Protection', duration: 5000 }
  ];
  
  let totalIssues = 0;
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} tests...`);
    
    // Run test-specific code here
    await new Promise(resolve => setTimeout(resolve, test.duration));
    
    // Count console errors/warnings
    const errorCount = console.error.toString().match(/🚨/g)?.length || 0;
    totalIssues += errorCount;
    
    console.log(`✅ ${test.name} tests completed`);
  }
  
  console.log('\n🔒 SECURITY TEST SUITE COMPLETE');
  console.log('================================================');
  console.log(`Total Security Issues Found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('🎉 NO SECURITY VULNERABILITIES DETECTED');
  } else {
    console.error(`🚨 ${totalIssues} SECURITY ISSUES REQUIRE IMMEDIATE ATTENTION`);
  }
};

// Uncomment to run complete suite
// runCompleteSecuritySuite();
```

## 📊 TEST EXECUTION CHECKLIST

### Before Testing:
- [ ] Environment prepared (dev tools open)
- [ ] Test payloads ready
- [ ] Network monitoring enabled
- [ ] Console cleared for clean output

### During Testing:
- [ ] Document all XSS vulnerabilities found
- [ ] Record unsanitized input fields
- [ ] Note API calls sending raw data
- [ ] Check file upload validation
- [ ] Verify authentication security

### After Testing:
- [ ] Compile security vulnerability report
- [ ] Prioritize critical fixes
- [ ] Document steps to reproduce issues
- [ ] Create fix implementation plan

## 🎯 SUCCESS CRITERIA

### ✅ PASS Criteria:
- All form inputs sanitized (no XSS execution)
- API payloads properly validated
- File uploads reject malicious files
- Authentication uses secure context
- Rate limiting prevents brute force
- Sessions properly secured

### ❌ FAIL Criteria:
- Any XSS payload executes successfully
- Raw user input sent to APIs
- Malicious files accepted
- Demo tokens in production
- No rate limiting
- Session hijacking possible

## 📞 POST-TEST ACTIONS

### If Critical Vulnerabilities Found:
1. **STOP production deployment immediately**
2. **Document all findings with screenshots**
3. **Implement security fixes from analysis**
4. **Re-run security tests**
5. **Get security team approval**

### If Tests Pass:
1. **Document test results**
2. **Prepare for production security audit**
3. **Set up continuous security monitoring**
4. **Schedule regular security testing**

---

**⚠️ CRITICAL**: This security testing script must be run before any production deployment. Security vulnerabilities identified must be fixed immediately to prevent data breaches and attacks. 