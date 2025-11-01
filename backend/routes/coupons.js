const express = require('express');
const router = express.Router();
const db = require('../database');

// Validate coupon
router.post('/validate', (req, res) => {
  try {
    const { couponCode, planId, amount } = req.body;

    if (!couponCode || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and amount are required'
      });
    }

    const validation = db.validateCoupon(couponCode, amount);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        isValid: false
      });
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      isValid: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      finalAmount: validation.finalAmount
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
});

module.exports = router;
