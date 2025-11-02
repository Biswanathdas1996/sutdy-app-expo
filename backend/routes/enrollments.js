const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const db = require('../database');

// Middleware to verify session
const verifySession = async (req, res, next) => {
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  const sessionId = req.body.sessionId || req.headers['x-session-id'];

  if (!authToken && !sessionId) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token or session ID provided'
    });
  }

  let session;
  if (authToken) {
    session = await db.findSessionByToken(authToken);
  } else if (sessionId) {
    session = await db.findSessionById(sessionId);
  }

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session'
    });
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({
      success: false,
      message: 'Session expired'
    });
  }

  // Attach user ID to request
  req.userId = session.userId;
  next();
};

// Apply authentication middleware to all routes
router.use(verifySession);

/**
 * @route GET /api/enrollments/debug
 * @desc Debug endpoint to show current user info
 * @access Private
 */
router.get('/debug', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user info
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(userId)]);
    const user = userResult.rows[0];
    
    // Get enrollments
    const enrollmentsResult = await pool.query('SELECT * FROM enrollments WHERE user_id = $1', [parseInt(userId)]);
    
    res.json({
      success: true,
      debug: {
        authenticatedUserId: userId,
        userInfo: user ? {
          id: user.id,
          name: user.name,
          mobile: user.mobile
        } : null,
        enrollments: enrollmentsResult.rows,
        enrollmentCount: enrollmentsResult.rows.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/enrollments
 * @desc Enroll user in a plan
 * @access Private (requires authentication)
 */
router.post('/', async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId; // From auth middleware

    console.log('📝 Enrollment request:', { userId, planId });

    // Validate required fields
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
      });
    }

    // Check if user exists
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [parseInt(userId)]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Get plan details from plans table
    const planQuery = 'SELECT * FROM plans WHERE id = $1';
    const planResult = await pool.query(planQuery, [planId]);

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const plan = planResult.rows[0];

    // Calculate expiry date based on plan validity
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (plan.validity_months || 1));

    // Check if user already has an active enrollment for this plan
    const existingEnrollmentQuery = `
      SELECT * FROM enrollments 
      WHERE user_id = $1 AND plan_id = $2 AND status = 'active' AND expiry_date > NOW()
    `;
    const existingResult = await pool.query(existingEnrollmentQuery, [parseInt(userId), planId]);

    if (existingResult.rows.length > 0) {
      const existingEnrollment = existingResult.rows[0];
      return res.status(400).json({
        success: false,
        message: 'You already have an active enrollment for this plan',
        enrollment: {
          id: existingEnrollment.id,
          userId: existingEnrollment.user_id,
          planId: existingEnrollment.plan_id,
          expiryDate: existingEnrollment.expiry_date,
        },
      });
    }

    // Create enrollment record
    const enrollmentQuery = `
      INSERT INTO enrollments (
        user_id, plan_id, start_date, expiry_date, status, 
        ai_minutes_total, ai_minutes_used, created_at
      ) VALUES ($1, $2, $3, $4, 'active', $5, 0, NOW())
      RETURNING *
    `;

    const enrollmentResult = await pool.query(enrollmentQuery, [
      parseInt(userId),
      planId,
      startDate,
      expiryDate,
      plan.ai_minutes || 0,
    ]);

    const enrollment = enrollmentResult.rows[0];

    console.log('✅ User enrolled successfully:', enrollment);

    res.json({
      success: true,
      message: `Successfully enrolled in ${plan.name}`,
      enrollment: {
        id: enrollment.id,
        userId: enrollment.user_id,
        planId: enrollment.plan_id,
        planName: plan.name,
        planType: plan.plan_type,
        startDate: enrollment.start_date,
        expiryDate: enrollment.expiry_date,
        status: enrollment.status,
        aiMinutesTotal: enrollment.ai_minutes_total,
        aiMinutesUsed: enrollment.ai_minutes_used,
        aiMinutesRemaining: enrollment.ai_minutes_total - enrollment.ai_minutes_used,
        validityMonths: plan.validity_months,
        createdAt: enrollment.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in plan',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/enrollments
 * @desc Get all enrollments for the logged-in user
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;

    const query = `
      SELECT 
        e.*,
        p.name as plan_name,
        p.price as plan_price,
        p.plan_type,
        p.validity_months,
        p.ai_minutes as plan_ai_minutes,
        p.description as plan_description
      FROM enrollments e
      JOIN plans p ON e.plan_id = p.id
      WHERE e.user_id = $1
      ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, [parseInt(userId)]);
    const enrollments = result.rows;

    res.json({
      success: true,
      enrollments: enrollments.map(e => ({
        id: e.id,
        userId: e.user_id,
        planId: e.plan_id,
        planName: e.plan_name,
        planType: e.plan_type,
        planDescription: e.plan_description,
        startDate: e.start_date,
        expiryDate: e.expiry_date,
        status: e.status,
        aiMinutesTotal: e.ai_minutes_total,
        aiMinutesUsed: e.ai_minutes_used,
        aiMinutesRemaining: e.ai_minutes_total - e.ai_minutes_used,
        validityMonths: e.validity_months,
        isActive: e.status === 'active' && new Date(e.expiry_date) > new Date(),
        createdAt: e.created_at,
      })),
    });
  } catch (error) {
    console.error('❌ Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollments',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/enrollments/active
 * @desc Get active enrollment for the logged-in user
 * @access Private
 */
router.get('/active', async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log('🔍 GET /api/enrollments/active - User ID:', userId);

    const query = `
      SELECT 
        e.*,
        p.name as plan_name,
        p.price as plan_price,
        p.plan_type,
        p.validity_months,
        p.ai_minutes as plan_ai_minutes,
        p.description as plan_description
      FROM enrollments e
      JOIN plans p ON e.plan_id = p.id::text
      WHERE e.user_id = $1 AND e.status = 'active' AND e.expiry_date > NOW()
      ORDER BY e.expiry_date DESC
      LIMIT 1
    `;

    console.log('📋 Executing query for user:', userId);
    const result = await pool.query(query, [parseInt(userId)]);
    console.log('📊 Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('⚠️ No active enrollment found for user', userId);
      return res.json({
        success: true,
        enrollment: null,
        message: 'No active enrollment found',
      });
    }

    const enrollment = result.rows[0];
    console.log('✅ Active enrollment found:', {
      id: enrollment.id,
      planName: enrollment.plan_name,
      userId: enrollment.user_id
    });

    res.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        userId: enrollment.user_id,
        planId: enrollment.plan_id,
        planName: enrollment.plan_name,
        planType: enrollment.plan_type,
        planDescription: enrollment.plan_description,
        startDate: enrollment.start_date,
        expiryDate: enrollment.expiry_date,
        status: enrollment.status,
        aiMinutesTotal: enrollment.ai_minutes_total,
        aiMinutesUsed: enrollment.ai_minutes_used,
        aiMinutesRemaining: enrollment.ai_minutes_total - enrollment.ai_minutes_used,
        validityMonths: enrollment.validity_months,
        createdAt: enrollment.created_at,
      },
    });
  } catch (error) {
    console.error('❌ Get active enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active enrollment',
      error: error.message,
    });
  }
});

module.exports = router;
