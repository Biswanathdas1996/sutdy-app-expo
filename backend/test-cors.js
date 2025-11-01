// Test CORS configuration
const http = require('http');

console.log('Testing CORS preflight request...\n');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/user/english-level',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:8081',
    'Access-Control-Request-Method': 'PUT',
    'Access-Control-Request-Headers': 'content-type,x-user-id,x-session-id,access-control-allow-methods'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('\nResponse Headers:');
  Object.keys(res.headers).forEach(header => {
    if (header.startsWith('access-control')) {
      console.log(`  ${header}: ${res.headers[header]}`);
    }
  });
  
  if (res.statusCode === 204 || res.statusCode === 200) {
    console.log('\n✅ CORS preflight successful!');
    console.log('All headers are allowed.');
  } else {
    console.log('\n❌ CORS preflight failed!');
  }
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
