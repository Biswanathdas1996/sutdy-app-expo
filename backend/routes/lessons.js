/**
 * Lesson System Routes
 * Handles daily lessons based on student's English level
 * Req: 8_1_B - Today's Lesson System
 * Admin publishes 3 sets of 180 lessons each (A1-A2, B1-B2, C1-C2)
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// =====================================================
// GET TODAY'S LESSON FOR USER
// Returns the lesson assigned for today based on user's level
// =====================================================
router.get('/today/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's English level
    const userQuery = 'SELECT english_level FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [parseInt(userId)]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userLevel = userResult.rows[0].english_level;
    if (!userLevel) {
      return res.status(400).json({
        success: false,
        message: 'User has not selected English level yet'
      });
    }

    // Map user level to lesson level format
    const levelMap = {
      'Beginner': 'A1-A2',
      'Elementary': 'A1-A2',
      'Intermediate': 'B1-B2',
      'Upper Intermediate': 'B1-B2',
      'Advanced': 'C1-C2',
      'Proficient': 'C1-C2'
    };

    const lessonLevel = levelMap[userLevel] || 'A1-A2';
    const today = new Date().toISOString().split('T')[0];

    // Check if today's lesson is already assigned
    let assignmentQuery = `
      SELECT 
        dla.id as assignment_id,
        dla.viewed,
        l.*
      FROM daily_lesson_assignments dla
      JOIN lessons l ON dla.lesson_id = l.id
      WHERE dla.user_id = $1 AND dla.assigned_date = $2
    `;
    
    let result = await pool.query(assignmentQuery, [parseInt(userId), today]);

    // If no assignment for today, create one
    if (result.rows.length === 0) {
      // Get the next lesson for this user's level
      const nextLessonQuery = `
        SELECT l.*
        FROM lessons l
        LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id AND ulp.user_id = $1
        WHERE l.level = $2 AND (ulp.id IS NULL OR ulp.completed = false)
        ORDER BY l.lesson_number ASC
        LIMIT 1
      `;
      
      const nextLessonResult = await pool.query(nextLessonQuery, [parseInt(userId), lessonLevel]);

      if (nextLessonResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No more lessons available for your level'
        });
      }

      const lesson = nextLessonResult.rows[0];

      // Assign the lesson for today
      await pool.query(
        'INSERT INTO daily_lesson_assignments (user_id, lesson_id, assigned_date) VALUES ($1, $2, $3)',
        [parseInt(userId), lesson.id, today]
      );

      // Re-fetch with assignment data
      result = await pool.query(assignmentQuery, [parseInt(userId), today]);
    }

    const lessonData = result.rows[0];

    res.json({
      success: true,
      data: {
        assignmentId: lessonData.assignment_id,
        viewed: lessonData.viewed,
        lesson: {
          id: lessonData.id,
          level: lessonData.level,
          lessonNumber: lessonData.lesson_number,
          title: lessonData.title,
          content: lessonData.content,
          exercises: lessonData.exercises,
          mediaUrl: lessonData.media_url
        }
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s lesson',
      error: error.message
    });
  }
});

// =====================================================
// MARK LESSON AS VIEWED
// Updates the viewed status of today's lesson
// =====================================================
router.put('/mark-viewed/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const query = `
      UPDATE daily_lesson_assignments
      SET viewed = true
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [parseInt(assignmentId)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Lesson marked as viewed'
    });
  } catch (error) {
    console.error('Error marking lesson as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as viewed',
      error: error.message
    });
  }
});

// =====================================================
// COMPLETE LESSON
// Marks a lesson as completed and optionally records a score
// =====================================================
router.post('/complete', async (req, res) => {
  try {
    const { userId, lessonId, score } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, lessonId'
      });
    }

    const completionDate = new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completion_date, score)
      VALUES ($1, $2, true, $3, $4)
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        completed = true,
        completion_date = $3,
        score = COALESCE($4, user_lesson_progress.score),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      parseInt(userId),
      parseInt(lessonId),
      completionDate,
      score || null
    ]);

    res.json({
      success: true,
      message: 'Lesson completed successfully',
      data: {
        userId: result.rows[0].user_id.toString(),
        lessonId: result.rows[0].lesson_id.toString(),
        completed: result.rows[0].completed,
        completionDate: result.rows[0].completion_date,
        score: result.rows[0].score
      }
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
});

// =====================================================
// GET USER LESSON PROGRESS
// Returns user's overall progress for their level
// =====================================================
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's level
    const userQuery = 'SELECT english_level FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [parseInt(userId)]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userLevel = userResult.rows[0].english_level;
    const levelMap = {
      'Beginner': 'A1-A2',
      'Elementary': 'A1-A2',
      'Intermediate': 'B1-B2',
      'Upper Intermediate': 'B1-B2',
      'Advanced': 'C1-C2',
      'Proficient': 'C1-C2'
    };
    const lessonLevel = levelMap[userLevel] || 'A1-A2';

    // Get progress statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT ulp.lesson_id) as completed_lessons,
        COALESCE(AVG(ulp.score), 0) as average_score
      FROM lessons l
      LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id 
        AND ulp.user_id = $1 
        AND ulp.completed = true
      WHERE l.level = $2
    `;

    const statsResult = await pool.query(statsQuery, [parseInt(userId), lessonLevel]);
    const stats = statsResult.rows[0];

    // Get recent completed lessons
    const recentQuery = `
      SELECT 
        l.id,
        l.lesson_number,
        l.title,
        ulp.completion_date,
        ulp.score
      FROM user_lesson_progress ulp
      JOIN lessons l ON ulp.lesson_id = l.id
      WHERE ulp.user_id = $1 AND ulp.completed = true AND l.level = $2
      ORDER BY ulp.completion_date DESC
      LIMIT 10
    `;

    const recentResult = await pool.query(recentQuery, [parseInt(userId), lessonLevel]);

    res.json({
      success: true,
      data: {
        level: lessonLevel,
        totalLessons: parseInt(stats.total_lessons),
        completedLessons: parseInt(stats.completed_lessons),
        averageScore: parseFloat(stats.average_score).toFixed(2),
        progressPercentage: stats.total_lessons > 0 
          ? ((stats.completed_lessons / stats.total_lessons) * 100).toFixed(2)
          : 0,
        recentLessons: recentResult.rows.map(lesson => ({
          id: lesson.id,
          lessonNumber: lesson.lesson_number,
          title: lesson.title,
          completionDate: lesson.completion_date,
          score: lesson.score
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson progress',
      error: error.message
    });
  }
});

// =====================================================
// ADMIN: CREATE LESSON
// Admin endpoint to create new lessons
// =====================================================
router.post('/admin/create', async (req, res) => {
  try {
    const { level, lessonNumber, title, content, exercises, mediaUrl, adminKey } = req.body;

    // Validate admin key
    const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin key'
      });
    }

    // Validate required fields
    if (!level || !lessonNumber || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: level, lessonNumber, title, content'
      });
    }

    // Validate level
    if (!['A1-A2', 'B1-B2', 'C1-C2'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be A1-A2, B1-B2, or C1-C2'
      });
    }

    const query = `
      INSERT INTO lessons (level, lesson_number, title, content, exercises, media_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (level, lesson_number) DO UPDATE SET
        title = $3,
        content = $4,
        exercises = $5,
        media_url = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      level,
      lessonNumber,
      title,
      content,
      exercises ? JSON.stringify(exercises) : null,
      mediaUrl || null
    ]);

    res.json({
      success: true,
      message: 'Lesson created/updated successfully',
      data: {
        id: result.rows[0].id,
        level: result.rows[0].level,
        lessonNumber: result.rows[0].lesson_number,
        title: result.rows[0].title
      }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error.message
    });
  }
});

// =====================================================
// ADMIN: BULK CREATE LESSONS
// Admin endpoint to create multiple lessons at once
// =====================================================
router.post('/admin/bulk-create', async (req, res) => {
  try {
    const { lessons, adminKey } = req.body;

    // Validate admin key
    const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin key'
      });
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lessons must be a non-empty array'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const createdLessons = [];

      for (const lesson of lessons) {
        const { level, lessonNumber, title, content, exercises, mediaUrl } = lesson;

        const query = `
          INSERT INTO lessons (level, lesson_number, title, content, exercises, media_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (level, lesson_number) DO UPDATE SET
            title = $3,
            content = $4,
            exercises = $5,
            media_url = $6,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id, level, lesson_number, title
        `;

        const result = await client.query(query, [
          level,
          lessonNumber,
          title,
          content,
          exercises ? JSON.stringify(exercises) : null,
          mediaUrl || null
        ]);

        createdLessons.push(result.rows[0]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `${createdLessons.length} lessons created/updated successfully`,
        data: createdLessons
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk creating lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create lessons',
      error: error.message
    });
  }
});

// =====================================================
// ADMIN: GET ALL LESSONS
// Returns all lessons with optional filtering
// =====================================================
router.get('/admin/all', async (req, res) => {
  try {
    const { level, adminKey } = req.query;

    // Validate admin key
    const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin key'
      });
    }

    let query = 'SELECT * FROM lessons';
    let params = [];

    if (level) {
      query += ' WHERE level = $1';
      params.push(level);
    }

    query += ' ORDER BY level ASC, lesson_number ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(lesson => ({
        id: lesson.id,
        level: lesson.level,
        lessonNumber: lesson.lesson_number,
        title: lesson.title,
        content: lesson.content,
        exercises: lesson.exercises,
        mediaUrl: lesson.media_url,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons',
      error: error.message
    });
  }
});

module.exports = router;
