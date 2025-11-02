const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all plans (with optional filtering by type)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let plans;
    if (type) {
      plans = await db.getPlansByType(type);
    } else {
      plans = await db.getAllPlans();
    }

    // Group plans by type for easier frontend consumption
    const groupedPlans = plans.reduce((acc, plan) => {
      const planType = plan.planType || 'basic';
      if (!acc[planType]) {
        acc[planType] = [];
      }
      acc[planType].push(plan);
      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Plans retrieved successfully',
      plans: plans,
      groupedPlans: groupedPlans,
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
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await db.getPlanById(planId);

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
