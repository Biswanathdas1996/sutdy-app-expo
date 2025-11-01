const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  fullName: 'Test User Profile',
  mobileNumber: `+919999${Math.floor(Math.random() * 100000)}`,
  otp: '123456'
};

async function testCompleteFlow() {
  console.log('🚀 Testing Complete User Profile Update Flow\n');

  try {
    // Step 1: Register new user
    console.log('📝 Step 1: Registering new user...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);

    if (!registerData.success) {
      throw new Error('Registration failed');
    }

    const { authToken, sessionId, userId } = registerData;
    console.log('✅ Registration successful');
    console.log(`   Auth Token: ${authToken.substring(0, 20)}...`);
    console.log(`   Session ID: ${sessionId.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}\n`);

    // Step 2: Update English Level (using authToken in header)
    console.log('📝 Step 2: Updating English level...');
    const englishLevelResponse = await fetch(`${BASE_URL}/api/user/english-level`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        englishLevel: 'proficient'
      })
    });

    const englishLevelData = await englishLevelResponse.json();
    console.log('English level response:', englishLevelData);

    if (!englishLevelData.success) {
      console.log('❌ English level update failed:', englishLevelData.message);
      return;
    }

    console.log('✅ English level updated successfully\n');

    // Step 3: Update Learning Goals
    console.log('📝 Step 3: Updating learning goals...');
    const learningGoalsResponse = await fetch(`${BASE_URL}/api/user/learning-goals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        learningGoals: ['career_advancement', 'travel']
      })
    });

    const learningGoalsData = await learningGoalsResponse.json();
    console.log('Learning goals response:', learningGoalsData);

    if (!learningGoalsData.success) {
      console.log('❌ Learning goals update failed:', learningGoalsData.message);
      return;
    }

    console.log('✅ Learning goals updated successfully\n');

    // Step 4: Update Skills Focus
    console.log('📝 Step 4: Updating skills focus...');
    const skillsResponse = await fetch(`${BASE_URL}/api/user/skills-focus`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        skillsFocus: ['speaking', 'listening']
      })
    });

    const skillsData = await skillsResponse.json();
    console.log('Skills focus response:', skillsData);

    if (!skillsData.success) {
      console.log('❌ Skills focus update failed:', skillsData.message);
      return;
    }

    console.log('✅ Skills focus updated successfully\n');

    // Step 5: Update Speaking Partner Preference
    console.log('📝 Step 5: Updating speaking partner preference...');
    const partnerResponse = await fetch(`${BASE_URL}/api/user/speaking-partner`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        needsSpeakingPartner: true
      })
    });

    const partnerData = await partnerResponse.json();
    console.log('Speaking partner response:', partnerData);

    if (!partnerData.success) {
      console.log('❌ Speaking partner update failed:', partnerData.message);
      return;
    }

    console.log('✅ Speaking partner preference updated successfully\n');

    // Step 6: Get User Profile
    console.log('📝 Step 6: Getting user profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const profileData = await profileResponse.json();
    console.log('User profile:', JSON.stringify(profileData, null, 2));

    if (!profileData.success) {
      console.log('❌ Get profile failed:', profileData.message);
      return;
    }

    console.log('✅ User profile retrieved successfully\n');

    // Summary
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Registration: SUCCESS');
    console.log('✅ English Level Update: SUCCESS');
    console.log('✅ Learning Goals Update: SUCCESS');
    console.log('✅ Skills Focus Update: SUCCESS');
    console.log('✅ Speaking Partner Update: SUCCESS');
    console.log('✅ Get Profile: SUCCESS');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testCompleteFlow();
