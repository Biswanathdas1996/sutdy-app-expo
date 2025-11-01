const express = require('express');
const router = express.Router();
const db = require('../database');

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
        valid: false
      });
    }

    const validation = await db.validateCoupon(code);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message || 'Invalid coupon',
        valid: false
      });
    }

    // Calculate discount if amount is provided
    let discountAmount = 0;
    let finalAmount = amount ? parseFloat(amount) : 0;
    
    if (amount) {
      if (validation.discountType === 'percentage') {
        discountAmount = (finalAmount * validation.discountValue) / 100;
      } else {
        discountAmount = validation.discountValue;
      }
      finalAmount = Math.max(0, finalAmount - discountAmount);
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      valid: true,
      code: validation.code,
      discountType: validation.discountType,
      discountValue: validation.discountValue,
      discountAmount,
      finalAmount
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
