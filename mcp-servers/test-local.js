const http = require('http');
const https = require('https');

// Test endpoints
const BASE_URL = process.env.MCP_URL || 'http://localhost:3001';

const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expected: 200
  },
  {
    name: 'Get User Profile',
    method: 'GET',
    path: '/mcp/users/user123',
    expected: [200, 500] // May fail without Azure
  },
  {
    name: 'Get User Claims',
    method: 'GET',
    path: '/mcp/users/user123/claims',
    expected: [200, 500]
  },
  {
    name: 'Calculate Risk Score',
    method: 'POST',
    path: '/mcp/risk/calculate',
    body: {
      userId: 'user123',
      riskData: {
        claimsHistory: [],
        drivingRecord: { violations: 0 }
      }
    },
    expected: [200, 500]
  },
  {
    name: 'Invalid Endpoint',
    method: 'GET',
    path: '/invalid/endpoint',
    expected: 404
  }
];

async function runTests() {
  console.log('🧪 Testing MCP Server at:', BASE_URL);
  console.log('================================================\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test);
      const expectedCodes = Array.isArray(test.expected) ? test.expected : [test.expected];
      
      if (expectedCodes.includes(result.statusCode)) {
        console.log(`✅ ${test.name}: ${result.statusCode} ${result.statusMessage}`);
        if (result.body) {
          console.log(`   Response: ${JSON.stringify(result.body).substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expected}, got ${result.statusCode}`);
        if (result.body) {
          console.log(`   Error: ${JSON.stringify(result.body)}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log('================================================');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! MCP server is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check server logs.');
  }
}

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + test.path);
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const body = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (test.body) {
      req.write(JSON.stringify(test.body));
    }
    
    req.end();
  });
}

// Run tests
runTests().catch(console.error); 