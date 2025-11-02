/**
 * Badge System Routes
 * Handles badge points, progress tracking, and badge unlocking
 * Req: 8_1_A - Badge Icon & Badge Progress System
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// =====================================================
// GET USER BADGE PROGRESS
// Returns user's total points and current badge
// =====================================================
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get or create user badge progress
    let progressQuery = `
      SELECT 
        ubp.user_id,
        ubp.total_points,
        ubp.current_badge_id,
        b.name as badge_name,
        b.icon as badge_icon,
        b.description as badge_description,
        b.points_required
      FROM user_badge_progress ubp
      LEFT JOIN badges b ON ubp.current_badge_id = b.id
      WHERE ubp.user_id = $1
    `;
    
    let result = await pool.query(progressQuery, [parseInt(userId)]);
    
    // If user doesn't have progress record, create one
    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO user_badge_progress (user_id, total_points, current_badge_id) VALUES ($1, 0, (SELECT id FROM badges WHERE points_required = 0 LIMIT 1))',
        [parseInt(userId)]
      );
      result = await pool.query(progressQuery, [parseInt(userId)]);
    }

    const progress = result.rows[0];

    res.json({
      success: true,
      data: {
        userId: progress.user_id.toString(),
        totalPoints: progress.total_points,
        currentBadge: {
          id: progress.current_badge_id,
          name: progress.badge_name,
          icon: progress.badge_icon,
          description: progress.badge_description,
          pointsRequired: progress.points_required
        }
      }
    });
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badge progress',
      error: error.message
    });
  }
});

// =====================================================
// GET ALL BADGES WITH USER UNLOCK STATUS
// Returns all badges (earned + locked)
// =====================================================
router.get('/all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        b.id,
        b.name,
        b.icon,
        b.description,
        b.points_required,
        ub.unlocked_at,
        CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as is_unlocked
      FROM badges b
      LEFT JOIN user_badges_unlocked ub ON b.id = ub.badge_id AND ub.user_id = $1
      ORDER BY b.points_required ASC
    `;

    const result = await pool.query(query, [parseInt(userId)]);

    res.json({
      success: true,
      data: result.rows.map(badge => ({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        pointsRequired: badge.points_required,
        isUnlocked: badge.is_unlocked,
        unlockedAt: badge.unlocked_at
      }))
    });
  } catch (error) {
    console.error('Error fetching all badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error.message
    });
  }
});

// =====================================================
// ADD BADGE POINTS
// Adds points for daily activity (must be validated by admin key)
// =====================================================
router.post('/points/add', async (req, res) => {
  try {
    const { userId, points, activityType, adminKey } = req.body;

    // Validate admin key
    const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123'; // Set in .env file
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin key'
      });
    }

    // Validate required fields
    if (!userId || !points || !activityType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, points, activityType, adminKey'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if points already logged for today
    const checkQuery = `
      SELECT id FROM badge_points_log
      WHERE user_id = $1 AND activity_date = $2 AND activity_type = $3
    `;
    const existing = await pool.query(checkQuery, [parseInt(userId), today, activityType]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Points already logged for this activity today'
      });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Log the points
      await client.query(
        `INSERT INTO badge_points_log (user_id, points_earned, activity_type, activity_date, admin_key_validated)
         VALUES ($1, $2, $3, $4, true)`,
        [parseInt(userId), points, activityType, today]
      );

      // Update total points
      await client.query(
        `INSERT INTO user_badge_progress (user_id, total_points)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET 
           total_points = user_badge_progress.total_points + $2,
           updated_at = CURRENT_TIMESTAMP`,
        [parseInt(userId), points]
      );

      // Get updated progress
      const progressResult = await client.query(
        'SELECT total_points FROM user_badge_progress WHERE user_id = $1',
        [parseInt(userId)]
      );
      const totalPoints = progressResult.rows[0].total_points;

      // Check for badge unlock
      const badgeResult = await client.query(
        `SELECT id, name, icon, description, points_required
         FROM badges
         WHERE points_required <= $1
         ORDER BY points_required DESC
         LIMIT 1`,
        [totalPoints]
      );

      if (badgeResult.rows.length > 0) {
        const newBadge = badgeResult.rows[0];

        // Update current badge
        await client.query(
          'UPDATE user_badge_progress SET current_badge_id = $1 WHERE user_id = $2',
          [newBadge.id, parseInt(userId)]
        );

        // Record badge unlock if not already unlocked
        await client.query(
          `INSERT INTO user_badges_unlocked (user_id, badge_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [parseInt(userId), newBadge.id]
        );

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Points added successfully',
          data: {
            pointsAdded: points,
            totalPoints,
            currentBadge: {
              id: newBadge.id,
              name: newBadge.name,
              icon: newBadge.icon,
              description: newBadge.description,
              pointsRequired: newBadge.points_required
            }
          }
        });
      } else {
        await client.query('COMMIT');
        res.json({
          success: true,
          message: 'Points added successfully',
          data: {
            pointsAdded: points,
            totalPoints
          }
        });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding badge points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add badge points',
      error: error.message
    });
  }
});

// =====================================================
// GET POINTS HISTORY
// Returns user's points earning history
// =====================================================
router.get('/points/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT 
        id,
        points_earned,
        activity_type,
        activity_date,
        admin_key_validated,
        created_at
      FROM badge_points_log
      WHERE user_id = $1
      ORDER BY activity_date DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [parseInt(userId), parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows.map(log => ({
        id: log.id,
        pointsEarned: log.points_earned,
        activityType: log.activity_type,
        activityDate: log.activity_date,
        validated: log.admin_key_validated,
        createdAt: log.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching points history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points history',
      error: error.message
    });
  }
});

// =====================================================
// GET BADGE LEADERBOARD
// Returns top users by badge points
// =====================================================
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const query = `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        ubp.total_points,
        b.name as badge_name,
        b.icon as badge_icon
      FROM user_badge_progress ubp
      JOIN users u ON ubp.user_id = u.id
      LEFT JOIN badges b ON ubp.current_badge_id = b.id
      ORDER BY ubp.total_points DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows.map((user, index) => ({
        rank: index + 1,
        userId: user.id.toString(),
        name: user.name,
        profilePhoto: user.profile_photo,
        totalPoints: user.total_points,
        badgeName: user.badge_name,
        badgeIcon: user.badge_icon
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
