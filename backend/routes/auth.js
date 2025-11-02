const express = require('express');
const router = express.Router();
const db = require('../database');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('🔵 Register endpoint hit:', req.body);
    
    const { fullName, mobileNumber } = req.body;

    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required'
      });
    }

    console.log('🔵 Checking if user exists...');
    // Check if user already exists
    let user = await db.findUserByMobile(mobileNumber);
    let isNewUser = false;

    if (!user) {
      console.log('🔵 Creating new user...');
      // Create new user
      user = await db.createUser({
        fullName,
        userName: fullName,
        name: fullName,
        mobileNumber
      });
      isNewUser = true;
      console.log('🔵 User created:', user);
    }

    console.log('🔵 Creating session for user:', user.userId);
    // Create session
    const session = await db.createSession(user.userId);
    
    console.log('Session created:', session); // DEBUG

    res.json({
      success: true,
      message: isNewUser ? 'Registration successful' : 'User already exists, logged in',
      authToken: session.authToken,
      sessionId: session.sessionId,
      userId: user.userId,
      userName: user.userName,
      isNewUser
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { fullName, mobileNumber } = req.body;

    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required'
      });
    }

    // Find user
    let user = await db.findUserByMobile(mobileNumber);
    let isNewUser = false;

    if (!user) {
      // Create new user if not exists
      user = await db.createUser({
        fullName,
        userName: fullName,
        name: fullName,
        mobileNumber
      });
      isNewUser = true;
    }

    // Create session
    const session = await db.createSession(user.userId);

    res.json({
      success: true,
      message: 'Login successful',
      authToken: session.authToken,
      sessionId: session.sessionId,
      userId: user.userId,
      userName: user.userName,
      isNewUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Membership login with OTP
router.post('/membership-login', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    console.log('🔵 Membership login attempt with WhatsApp number:', mobileNumber);

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp number and OTP are required'
      });
    }

    // For demo purposes, accept any 4-digit OTP
    // In production, validate against sent OTP
    if (otp.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Find membership by WhatsApp number
    console.log('🔍 Looking for membership with WhatsApp number:', mobileNumber);
    const membership = await db.findMembershipByMobile(mobileNumber);

    if (!membership) {
      console.log('❌ No membership found for WhatsApp number:', mobileNumber);
      console.log('💡 User should complete membership registration first');
      return res.status(404).json({
        success: false,
        message: 'No membership found for this WhatsApp number. Please complete membership registration first.'
      });
    }

    console.log('✅ Membership found:', membership.id);

    // Find or create user using WhatsApp number
    let user = await db.findUserByMobile(mobileNumber);
    if (!user) {
      console.log('🔵 Creating new user from membership data');
      user = await db.createUser({
        fullName: membership.fullName,
        userName: membership.fullName,
        name: membership.fullName,
        mobileNumber: membership.mobileNumber,
        whatsappNumber: membership.whatsappNumber,
        age: membership.age,
        gender: membership.gender,
        country: membership.country,
        englishSkills: membership.englishSkills,
        highestQualification: membership.highestQualification,
        speakingPartnerInterest: membership.speakingPartnerInterest,
        aboutYou: membership.aboutYou,
        profilePhotoBase64: membership.profilePhotoBase64
      });
      console.log('✅ User created:', user.userId);
    } else {
      console.log('✅ Existing user found:', user.userId);
    }

    // Create session
    const session = await db.createSession(user.userId);
    console.log('✅ Session created:', session.sessionId);

    res.json({
      success: true,
      message: 'Login successful',
      authToken: session.authToken,
      sessionId: session.sessionId,
      isNewUser: false,
      user: {
        id: user.userId,
        name: membership.fullName,
        mobileNumber: membership.mobileNumber,
        whatsappNumber: membership.whatsappNumber,
        age: membership.age,
        gender: membership.gender,
        country: membership.country,
        englishSkills: membership.englishSkills,
        highestQualification: membership.highestQualification,
        speakingPartnerInterest: membership.speakingPartnerInterest,
        aboutYou: membership.aboutYou,
        profilePhotoBase64: membership.profilePhotoBase64
      }
    });
  } catch (error) {
    console.error('❌ Membership login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
