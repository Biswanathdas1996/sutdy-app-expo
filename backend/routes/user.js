const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to verify session
const verifySession = (req, res, next) => {
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
    session = db.findSessionByToken(authToken);
  } else if (sessionId) {
    session = db.findSessionById(sessionId);
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

  req.session = session;
  req.userId = session.userId;
  next();
};

// Update English level
router.put('/english-level', verifySession, (req, res) => {
  try {
    const { englishLevel } = req.body;

    if (!englishLevel) {
      return res.status(400).json({
        success: false,
        message: 'English level is required'
      });
    }

    const user = db.updateUser(req.userId, { englishLevel });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'English level updated successfully',
      sessionId: req.session.sessionId,
      englishLevel: user.englishLevel
    });
  } catch (error) {
    console.error('Update English level error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update English level',
      error: error.message
    });
  }
});

// Update learning goals
router.put('/learning-goals', verifySession, (req, res) => {
  try {
    const { learningGoals } = req.body;

    if (!learningGoals || !Array.isArray(learningGoals)) {
      return res.status(400).json({
        success: false,
        message: 'Learning goals must be an array'
      });
    }

    const user = db.updateUser(req.userId, { learningGoals });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Learning goals updated successfully',
      sessionId: req.session.sessionId,
      learningGoals: user.learningGoals
    });
  } catch (error) {
    console.error('Update learning goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning goals',
      error: error.message
    });
  }
});

// Update skills focus
router.put('/skills-focus', verifySession, (req, res) => {
  try {
    const { skillsFocus } = req.body;

    if (!skillsFocus || !Array.isArray(skillsFocus)) {
      return res.status(400).json({
        success: false,
        message: 'Skills focus must be an array'
      });
    }

    const user = db.updateUser(req.userId, { skillsFocus });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Skills focus updated successfully',
      sessionId: req.session.sessionId,
      skillsFocus: user.skillsFocus
    });
  } catch (error) {
    console.error('Update skills focus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skills focus',
      error: error.message
    });
  }
});

// Update speaking partner preference
router.put('/speaking-partner', verifySession, (req, res) => {
  try {
    const { needsSpeakingPartner } = req.body;

    if (typeof needsSpeakingPartner !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'needsSpeakingPartner must be a boolean'
      });
    }

    const user = db.updateUser(req.userId, { needsSpeakingPartner });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Speaking partner preference updated successfully',
      sessionId: req.session.sessionId,
      needsSpeakingPartner: user.needsSpeakingPartner
    });
  } catch (error) {
    console.error('Update speaking partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update speaking partner preference',
      error: error.message
    });
  }
});

// Get user profile with memberships
router.get('/profile-with-memberships', verifySession, (req, res) => {
  try {
    const user = db.findUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user.userId,
        userName: user.userName,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        englishLevel: user.englishLevel,
        learningGoals: user.learningGoals,
        skillsFocus: user.skillsFocus,
        needsSpeakingPartner: user.needsSpeakingPartner,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      memberships: []
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

module.exports = router;
