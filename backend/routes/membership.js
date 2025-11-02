const express = require('express');
const router = express.Router();
const db = require('../database');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Ensure membership_registrations table exists
async function ensureMembershipTable() {
  try {
    const sqlPath = path.join(__dirname, '..', 'config', 'schema-membership-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Membership registrations table ready');
  } catch (error) {
    console.error('Error creating membership table:', error);
  }
}

// Initialize table on module load
ensureMembershipTable();

// Register membership
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      fullName,
      name,
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

    // Use name or fullName (accept both for compatibility)
    const memberName = name || fullName;

    // Validate required fields
    if (!memberName || !mobileNumber) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Name and mobile number are required',
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['mobileNumber'], message: 'Mobile number is required' }
        ]
      });
    }

    // Check if membership already exists
    const existingCheck = await client.query(
      'SELECT * FROM membership_registrations WHERE mobile_number = $1',
      [mobileNumber]
    );
    
    if (existingCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Membership already exists for this mobile number'
      });
    }

    // 1. Insert into membership_registrations table
    const membershipResult = await client.query(
      `INSERT INTO membership_registrations (
        full_name, mobile_number, whatsapp_number, age, gender, country,
        english_skills, highest_qualification, speaking_partner_interest,
        about_you, profile_photo_base64, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        memberName,
        mobileNumber,
        whatsappNumber || mobileNumber,
        age,
        gender,
        country,
        englishSkills || [],
        highestQualification,
        speakingPartnerInterest,
        aboutYou,
        profilePhotoBase64,
        'approved'
      ]
    );

    const membership = membershipResult.rows[0];
    console.log('✅ Membership registration created:', membership.id);

    // 2. Create/Update user in users table (for login)
    const userResult = await client.query(
      `INSERT INTO users (
        mobile, name, whatsapp_number, age, gender, country,
        english_skills, highest_qualification, speaking_partner_interest,
        about_you, profile_photo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (mobile) DO UPDATE SET
        name = EXCLUDED.name,
        whatsapp_number = EXCLUDED.whatsapp_number,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        mobileNumber,
        memberName,
        whatsappNumber || mobileNumber,
        age,
        gender,
        country,
        englishSkills || [],
        highestQualification,
        speakingPartnerInterest,
        aboutYou,
        profilePhotoBase64
      ]
    );

    const user = userResult.rows[0];
    console.log('✅ User created/updated for login:', user.id);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Membership registration successful',
      membership: {
        id: membership.id,
        userId: user.id,
        fullName: membership.full_name,
        mobileNumber: membership.mobile_number
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Membership registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Membership registration failed',
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
