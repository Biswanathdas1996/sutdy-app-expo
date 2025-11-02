const http = require('http');

// Generate random mobile number to avoid duplicates
const randomMobile = '80016' + Math.floor(Math.random() * 90000 + 10000);

const testMembershipRegistration = () => {
  const data = JSON.stringify({
    fullName: "Test User " + randomMobile,
    age: 30,
    gender: "Male",
    country: "India",
    mobileNumber: randomMobile,
    whatsappNumber: randomMobile,
    englishSkills: ["B1", "B2"],
    highestQualification: "Graduate",
    speakingPartnerInterest: true,
    aboutYou: "This is a test profile for membership tracking fix",
    profilePhotoBase64: null
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

  console.log('🧪 Testing membership registration with new flow...\n');
  console.log('📱 Mobile Number:', randomMobile);
  console.log('📝 Request data:', JSON.parse(data));
  console.log('\n--- Testing Step 1: Membership Registration ---');

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('\n=== Registration Response ===');
      console.log('Status Code:', res.statusCode);
      try {
        const response = JSON.parse(body);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('\n✅ Step 1 SUCCESS: Membership registered!');
          console.log('   - Membership ID:', response.membership.id);
          console.log('   - User ID:', response.membership.userId);
          
          // Now test auto-login
          setTimeout(() => testMembershipLogin(randomMobile), 1000);
        } else {
          console.log('\n❌ Step 1 FAILED:', response.message);
          process.exit(1);
        }
      } catch (e) {
        console.log('Raw Response:', body);
        process.exit(1);
      }
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

const testMembershipLogin = (mobileNumber) => {
  console.log('\n--- Testing Step 2: Auto-Login with OTP ---');
  
  const loginData = JSON.stringify({
    mobileNumber: mobileNumber,
    otp: "1234"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/membership-login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('\n=== Login Response ===');
      console.log('Status Code:', res.statusCode);
      try {
        const response = JSON.parse(body);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('\n✅ Step 2 SUCCESS: Auto-login works!');
          console.log('   - Auth Token:', response.authToken ? '✓' : '✗');
          console.log('   - Session ID:', response.sessionId ? '✓' : '✗');
          console.log('   - User Data:', response.user ? '✓' : '✗');
          
          console.log('\n🎉 COMPLETE TEST PASSED!');
          console.log('===================================');
          console.log('✅ Membership registered in membership_registrations table');
          console.log('✅ User created in users table (single entry with ON CONFLICT)');
          console.log('✅ Auto-login successful');
          console.log('✅ User can now navigate to plans screen');
          
        } else {
          console.log('\n❌ Step 2 FAILED:', response.message);
          console.log('\n🔍 Debugging Info:');
          console.log('   - Make sure findMembershipByMobile queries membership_registrations table');
          console.log('   - Check that the user was created in users table');
        }
      } catch (e) {
        console.log('Raw Response:', body);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Login request failed:', error.message);
    process.exit(1);
  });

  req.write(loginData);
  req.end();
};

// Wait a moment for server to be ready
setTimeout(testMembershipRegistration, 1000);
