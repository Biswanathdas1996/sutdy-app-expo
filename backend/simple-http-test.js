const http = require('http');

const data = JSON.stringify({
  fullName: 'Simple Test User',
  mobileNumber: '+919999888877'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Making request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Request body:', data);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseBody);
    try {
      const jsonResponse = JSON.parse(responseBody);
      console.log('Parsed response:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(data);
req.end();
