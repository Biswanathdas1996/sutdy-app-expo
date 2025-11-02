const express = require('express');
const router = express.Router();
const SubscriptionService = require('../services/subscriptionService');

const subscriptionService = new SubscriptionService();

/**
 * Create new subscription
 * POST /api/subscriptions/create
 */
router.post('/create', async (req, res) => {
  try {
    const { userId, planId, enableAutoPay } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Plan ID are required'
      });
    }

    const result = await subscriptionService.createSubscription(
      userId,
      planId,
      enableAutoPay || false
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

/**
 * Enable auto-pay for subscription
 * POST /api/subscriptions/:id/enable-autopay
 */
router.post('/:id/enable-autopay', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, paymentMethodId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await subscriptionService.enableAutoPay(
      id,
      userId,
      paymentMethodId
    );

    res.json(result);
  } catch (error) {
    console.error('Error enabling auto-pay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable auto-pay',
      error: error.message
    });
  }
});

/**
 * Disable auto-pay (pause subscription)
 * POST /api/subscriptions/:id/disable-autopay
 */
router.post('/:id/disable-autopay', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await subscriptionService.disableAutoPay(id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error disabling auto-pay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable auto-pay',
      error: error.message
    });
  }
});

/**
 * Cancel subscription
 * POST /api/subscriptions/:id/cancel
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await subscriptionService.cancelSubscription(id, userId);

    res.json(result);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

/**
 * Get user subscriptions
 * GET /api/subscriptions/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await subscriptionService.getUserSubscriptions(userId);

    res.json({
      success: true,
      data: {
        subscriptions,
        count: subscriptions.length
      }
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
      error: error.message
    });
  }
});

/**
 * Webhook for Razorpay subscription events
 * POST /api/subscriptions/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Subscription webhook received:', event);

    switch (event) {
      case 'subscription.charged':
        // Subscription successfully charged
        await subscriptionService.processRenewal(
          payload.subscription.entity.id,
          payload.payment.entity.id
        );
        break;

      case 'subscription.payment_failed':
        // Payment failed, activate grace period
        await subscriptionService.handleFailedRenewal(
          payload.subscription.entity.id
        );
        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        console.log('Subscription cancelled:', payload.subscription.entity.id);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

/**
 * Get upcoming renewals (for admin/notifications)
 * GET /api/subscriptions/upcoming/:days
 */
router.get('/upcoming/:days', async (req, res) => {
  try {
    const { days } = req.params;
    const daysAhead = parseInt(days) || 3;

    const renewals = await subscriptionService.getUpcomingRenewals(daysAhead);

    res.json({
      success: true,
      data: {
        renewals,
        count: renewals.length,
        daysAhead
      }
    });
  } catch (error) {
    console.error('Error getting upcoming renewals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming renewals',
      error: error.message
    });
  }
});

module.exports = router;
