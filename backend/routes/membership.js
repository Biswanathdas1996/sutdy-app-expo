const express = require('express');
const router = express.Router();
const db = require('../database');

// Register membership
router.post('/register', (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      whatsappNumber,
      age,
      gender,
      country,
      englishSkills,
      highestQualification,
      speakingPartnerInterest,
      aboutYou,
      profilePhotoBase64
    } = req.body;

    // Validate required fields
    if (!fullName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required',
        errors: [
          { path: ['fullName'], message: 'Full name is required' },
          { path: ['mobileNumber'], message: 'Mobile number is required' }
        ]
      });
    }

    // Check if membership already exists
    const existingMembership = db.findMembershipByMobile(mobileNumber);
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Membership already exists for this mobile number'
      });
    }

    // Create membership
    const membership = db.createMembership({
      fullName,
      mobileNumber,
      whatsappNumber,
      age,
      gender,
      country,
      englishSkills,
      highestQualification,
      speakingPartnerInterest,
      aboutYou,
      profilePhotoBase64
    });

    res.json({
      success: true,
      message: 'Membership registration successful',
      membership: {
        id: membership.id,
        fullName: membership.fullName,
        mobileNumber: membership.mobileNumber
      }
    });
  } catch (error) {
    console.error('Membership registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Membership registration failed',
      error: error.message
    });
  }
});

module.exports = router;
