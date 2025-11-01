// Test script for API endpoints
const BASE_URL = 'http://localhost:3000';

let authToken = '';
let sessionId = '';
let userId = '';

async function testEndpoint(name, method, endpoint, body = null, headers = {}) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${name}`);
  console.log(`${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
      console.log('Request Body:', JSON.stringify(body, null, 2));
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 Starting API Tests...\n');
  console.log('Make sure the server is running on port 3000!\n');

  // Test 1: Health Check
  await testEndpoint('Health Check', 'GET', '/api/health');

  // Test 2: Register User
  const registerResult = await testEndpoint(
    'Register User',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      mobileNumber: '9876543210'
    }
  );

  if (registerResult.success) {
    authToken = registerResult.data.authToken;
    sessionId = registerResult.data.sessionId;
    userId = registerResult.data.userId;
    console.log(`\n✅ Saved tokens for subsequent tests`);
    console.log(`AuthToken: ${authToken.substring(0, 20)}...`);
    console.log(`SessionId: ${sessionId}`);
  }

  // Test 3: Login User
  await testEndpoint(
    'Login User',
    'POST',
    '/api/auth/login',
    {
      fullName: 'Test User',
      mobileNumber: '9876543210'
    }
  );

  // Test 4: Update English Level
  if (sessionId) {
    await testEndpoint(
      'Update English Level',
      'PUT',
      '/api/user/english-level',
      {
        sessionId,
        englishLevel: 'intermediate'
      },
      { Authorization: `Bearer ${authToken}` }
    );
  }

  // Test 5: Update Learning Goals
  if (sessionId) {
    await testEndpoint(
      'Update Learning Goals',
      'PUT',
      '/api/user/learning-goals',
      {
        sessionId,
        learningGoals: ['career_advancement', 'travel', 'practice']
      },
      { Authorization: `Bearer ${authToken}` }
    );
  }

  // Test 6: Update Skills Focus
  if (sessionId) {
    await testEndpoint(
      'Update Skills Focus',
      'PUT',
      '/api/user/skills-focus',
      {
        sessionId,
        skillsFocus: ['speaking', 'listening', 'pronunciation']
      },
      { Authorization: `Bearer ${authToken}` }
    );
  }

  // Test 7: Update Speaking Partner
  if (sessionId) {
    await testEndpoint(
      'Update Speaking Partner',
      'PUT',
      '/api/user/speaking-partner',
      {
        sessionId,
        needsSpeakingPartner: true
      },
      { Authorization: `Bearer ${authToken}` }
    );
  }

  // Test 8: Get User Profile
  if (authToken) {
    await testEndpoint(
      'Get User Profile',
      'GET',
      '/api/user/profile-with-memberships',
      null,
      { Authorization: `Bearer ${authToken}` }
    );
  }

  // Test 9: Get Plans
  await testEndpoint('Get All Plans', 'GET', '/api/plans');

  // Test 10: Validate Coupon
  await testEndpoint(
    'Validate Coupon - WELCOME50',
    'POST',
    '/api/coupons/validate',
    {
      couponCode: 'WELCOME50',
      planId: 'plan_1',
      amount: 499
    }
  );

  // Test 11: Validate Another Coupon
  await testEndpoint(
    'Validate Coupon - SAVE100',
    'POST',
    '/api/coupons/validate',
    {
      couponCode: 'SAVE100',
      planId: 'plan_2',
      amount: 1299
    }
  );

  // Test 12: Process Payment
  const paymentResult = await testEndpoint(
    'Process Payment',
    'POST',
    '/api/payments/process',
    {
      planId: 'plan_1',
      amount: 499,
      couponCode: 'WELCOME50',
      paymentMethod: 'razorpay'
    }
  );

  let paymentId = '';
  if (paymentResult.success) {
    paymentId = paymentResult.data.paymentId;
  }

  // Test 13: Get Payment Status
  if (paymentId) {
    // Wait for 2 seconds to let payment status update
    console.log('\n⏳ Waiting 2 seconds for payment to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testEndpoint(
      'Get Payment Status',
      'GET',
      `/api/payments/${paymentId}/status`
    );
  }

  // Test 14: Register Membership
  await testEndpoint(
    'Register Membership',
    'POST',
    '/api/membership/register',
    {
      fullName: 'Membership User',
      mobileNumber: '8888888888',
      whatsappNumber: '8888888888',
      age: '28',
      gender: 'Male',
      country: 'India',
      englishSkills: ['speaking', 'listening'],
      highestQualification: "Bachelor's Degree",
      speakingPartnerInterest: 'Yes',
      aboutYou: 'I want to improve my English for career growth'
    }
  );

  // Test 15: Membership Login
  await testEndpoint(
    'Membership Login with OTP',
    'POST',
    '/api/auth/membership-login',
    {
      mobileNumber: '8888888888',
      otp: '1234'
    }
  );

  console.log(`\n${'='.repeat(50)}`);
  console.log('\n✅ All tests completed!\n');
  console.log('Check the results above to verify all endpoints are working.\n');
}

// Run tests
runTests().catch(console.error);
