# Razorpay Integration - Backend API Requirements

This document outlines the backend API endpoints needed to support Razorpay payment integration in the mobile app.

## Required Backend Endpoints

### 1. Create Razorpay Order
**Endpoint:** `POST /api/payments/razorpay/create-order`

**Description:** Creates a Razorpay order before payment processing

**Request Body:**
```json
{
  "planId": "string",
  "amount": "number (in paise)",
  "currency": "INR",
  "couponCode": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_xyz",
  "planId": "plan123"
}
```

### 2. Verify Razorpay Payment
**Endpoint:** `POST /api/payments/razorpay/verify`

**Description:** Verifies the payment signature and processes the successful payment

**Request Body:**
```json
{
  "razorpay_payment_id": "pay_xyz123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_hash",
  "planId": "plan123"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "paymentId": "pay_xyz123",
  "status": "completed",
  "message": "Payment verified successfully"
}
```

## Backend Implementation Notes

### 1. Razorpay Setup
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
```

### 2. Create Order Handler
```javascript
app.post('/api/payments/razorpay/create-order', async (req, res) => {
  try {
    const { planId, amount, currency = 'INR', couponCode } = req.body;
    
    // Apply coupon if provided
    const finalAmount = couponCode ? applyDiscount(amount, couponCode) : amount;
    
    const options = {
      amount: finalAmount, // amount in paise
      currency: currency,
      receipt: `receipt_${planId}_${Date.now()}`,
      notes: {
        planId: planId,
        couponCode: couponCode || ''
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      planId: planId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 3. Verify Payment Handler
```javascript
const crypto = require('crypto');

app.post('/api/payments/razorpay/verify', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified, process the order
      // 1. Update user subscription
      // 2. Send confirmation email
      // 3. Log the transaction
      
      await processSuccessfulPayment({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        planId: planId,
        userId: req.user.id // From auth middleware
      });

      res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        status: 'completed',
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 4. Environment Variables Required
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### 5. Database Schema Updates
Add a payments table to store transaction details:

```sql
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255) NOT NULL,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_order_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  coupon_code VARCHAR(100),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);
```

## Frontend Integration Complete

The frontend React Native app is now configured with:

1. ✅ Razorpay SDK installed (`react-native-razorpay`)
2. ✅ Type definitions created for TypeScript support
3. ✅ `RazorpayService` class for payment processing
4. ✅ Updated `CheckoutComponent` with Razorpay integration
5. ✅ Platform-specific handling (web fallback to simulation)
6. ✅ Error handling and user feedback
7. ✅ Payment methods display in UI
8. ✅ Security information and SSL badge

## Testing Instructions

### 1. Test Mode
- The app is configured with test Razorpay key
- Use test card: 4111 1111 1111 1111
- Any future expiry date and CVV work in test mode

### 2. Web Testing
- On web platform, payment will show simulation option
- Useful for development and testing

### 3. Mobile Testing
- On mobile devices, real Razorpay checkout will open
- Supports all payment methods (cards, UPI, wallets, etc.)

## Security Considerations

1. **Never expose** your Razorpay secret key in the frontend
2. **Always verify** payments on the backend
3. **Use HTTPS** for all payment-related APIs
4. **Log all transactions** for audit purposes
5. **Implement rate limiting** on payment endpoints

## Next Steps

1. Implement the backend endpoints listed above
2. Update the Razorpay key in `RazorpayService.ts` with your actual test/live key
3. Test the complete flow on both mobile and web platforms
4. Add webhook handling for payment status updates
5. Implement refund functionality if needed
