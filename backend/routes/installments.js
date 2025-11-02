const express = require('express');
const router = express.Router();
const InstallmentService = require('../services/installmentService');

const installmentService = new InstallmentService();

/**
 * Create installment payment order (first installment)
 * POST /api/installments/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Plan ID are required'
      });
    }

    // For Professional plan: First installment is ₹1,299
    const firstInstallmentAmount = 1299;

    const order = await installmentService.createFirstInstallmentOrder(
      userId,
      planId,
      firstInstallmentAmount
    );

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount / 100, // Convert from paise
        currency: order.currency,
        installmentDetails: {
          number: 1,
          total: 2,
          firstAmount: 1299,
          secondAmount: 1200,
          secondDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
  } catch (error) {
    console.error('Error creating installment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create installment order',
      error: error.message
    });
  }
});

/**
 * Verify and process first installment payment
 * POST /api/installments/verify-first
 */
router.post('/verify-first', async (req, res) => {
  try {
    const { userId, planId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!userId || !planId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    const result = await installmentService.processFirstInstallment({
      userId,
      planId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    res.json(result);
  } catch (error) {
    console.error('Error verifying first installment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

/**
 * Get pending installments for user
 * GET /api/installments/pending/:userId
 */
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const pendingInstallments = await installmentService.getPendingInstallments(userId);

    res.json({
      success: true,
      data: {
        installments: pendingInstallments,
        count: pendingInstallments.length
      }
    });
  } catch (error) {
    console.error('Error getting pending installments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending installments',
      error: error.message
    });
  }
});

/**
 * Create order for second installment payment
 * POST /api/installments/create-second-order
 */
router.post('/create-second-order', async (req, res) => {
  try {
    const { installmentId, userId } = req.body;

    if (!installmentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Installment ID and User ID are required'
      });
    }

    const { order, installment } = await installmentService.createSecondInstallmentOrder(
      installmentId,
      userId
    );

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        installmentDetails: {
          number: 2,
          total: 2,
          dueDate: installment.due_date
        }
      }
    });
  } catch (error) {
    console.error('Error creating second installment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create second installment order',
      error: error.message
    });
  }
});

/**
 * Verify and process second installment payment
 * POST /api/installments/verify-second
 */
router.post('/verify-second', async (req, res) => {
  try {
    const { installmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!installmentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    const result = await installmentService.processSecondInstallment({
      installmentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    res.json(result);
  } catch (error) {
    console.error('Error verifying second installment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

/**
 * Get installment payment history
 * GET /api/installments/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await installmentService.getInstallmentHistory(userId);

    res.json({
      success: true,
      data: {
        payments: history,
        count: history.length
      }
    });
  } catch (error) {
    console.error('Error getting installment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get installment history',
      error: error.message
    });
  }
});

module.exports = router;
