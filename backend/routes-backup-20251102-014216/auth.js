const express = require('express');
const router = express.Router();
const db = require('../database');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { fullName, mobileNumber } = req.body;

    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required'
      });
    }

    // Check if user already exists
    let user = await db.findUserByMobile(mobileNumber);
    let isNewUser = false;

    if (!user) {
      // Create new user
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
      message: isNewUser ? 'Registration successful' : 'User already exists, logged in',
      authToken: session.authToken,
      sessionId: session.sessionId,
      userId: user.userId,
      userName: user.userName,
      isNewUser
    });
  } catch (error) {
    console.error('Registration error:', error);
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

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
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

    // Find membership by mobile
    const membership = await db.findMembershipByMobile(mobileNumber);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No membership found for this mobile number'
      });
    }

    // Find or create user
    let user = await db.findUserByMobile(mobileNumber);
    if (!user) {
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
    }

    // Create session
    const session = await db.createSession(user.userId);

    res.json({
      success: true,
      message: 'Login successful',
      authToken: session.authToken,
      sessionId: session.sessionId,
      isNewUser: false,
      user: {
        id: user.userId,
        name: user.fullName,
        mobileNumber: user.mobileNumber,
        whatsappNumber: user.whatsappNumber,
        age: user.age,
        gender: user.gender,
        country: user.country,
        englishSkills: user.englishSkills,
        highestQualification: user.highestQualification,
        speakingPartnerInterest: user.speakingPartnerInterest,
        aboutYou: user.aboutYou,
        profilePhotoBase64: user.profilePhotoBase64
      }
    });
  } catch (error) {
    console.error('Membership login error:', error);
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
