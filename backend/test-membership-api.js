const http = require('http');

const testMembershipRegistration = () => {
  const data = JSON.stringify({
    name: "Test User",
    age: "30",
    gender: "Male",
    country: "India",
    mobileNumber: "9876543210",
    whatsappNumber: "9876543210",
    englishSkills: ["B1"],
    highestQualification: "Graduate",
    speakingPartnerInterest: "Yes",
    aboutYou: "This is a test profile"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/membership/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('Testing membership registration with "name" field...\n');
  console.log('Request data:', JSON.parse(data));

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('\n=== Response ===');
      console.log('Status Code:', res.statusCode);
      console.log('Status Message:', res.statusMessage);
      try {
        const response = JSON.parse(body);
        console.log('Response Body:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('\n✅ SUCCESS: Membership registration works with "name" field!');
        } else {
          console.log('\n❌ FAILED:', response.message);
        }
      } catch (e) {
        console.log('Raw Response:', body);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.error('Make sure the backend server is running on port 3000');
    process.exit(1);
  });

  req.write(data);
  req.end();
};

// Wait a moment for server to be ready
setTimeout(testMembershipRegistration, 1000);
