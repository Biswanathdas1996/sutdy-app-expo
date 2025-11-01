const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all plans
router.get('/', (req, res) => {
  try {
    const plans = db.getAllPlans();

    res.json({
      success: true,
      message: 'Plans retrieved successfully',
      plans: plans,
      totalPlans: plans.length,
      testMetadata: {
        method: 'GET',
        endpoint: '/api/plans',
        payload: null,
        responseTime: Date.now(),
        timestamp: new Date().toISOString(),
        statusCode: 200,
        statusText: 'OK'
      }
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve plans',
      error: error.message
    });
  }
});

// Get plan by ID
router.get('/:planId', (req, res) => {
  try {
    const { planId } = req.params;
    const plan = db.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan retrieved successfully',
      plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve plan',
      error: error.message
    });
  }
});

module.exports = router;
