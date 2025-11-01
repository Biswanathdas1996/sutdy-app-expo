const express = require('express');
const router = express.Router();
const db = require('../database');

// Process payment
router.post('/process', (req, res) => {
  try {
    const { planId, amount, couponCode, paymentMethod } = req.body;

    if (!planId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID, amount, and payment method are required'
      });
    }

    // Validate plan exists
    const plan = db.getPlanById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Apply coupon if provided
    let finalAmount = amount;
    let discountAmount = 0;

    if (couponCode) {
      const validation = db.validateCoupon(couponCode, amount);
      if (validation.isValid) {
        discountAmount = validation.discountAmount;
        finalAmount = validation.finalAmount;
      }
    }

    // Create payment
    const payment = db.createPayment({
      planId,
      amount: finalAmount,
      originalAmount: amount,
      discountAmount,
      couponCode,
      paymentMethod
    });

    // Simulate successful payment
    // In production, integrate with actual payment gateway
    setTimeout(() => {
      db.updatePaymentStatus(payment.paymentId, 'completed');
    }, 2000);

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      status: payment.status,
      amount: finalAmount,
      currency: payment.currency,
      paymentUrl: `https://payment-gateway.example.com/pay/${payment.paymentId}`
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// Get payment status
router.get('/:paymentId/status', (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = db.findPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status retrieved successfully',
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

module.exports = router;
