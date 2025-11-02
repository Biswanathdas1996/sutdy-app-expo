const Razorpay = require('razorpay');
const pool = require('../config/database');

class SubscriptionService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create Razorpay subscription for auto-pay
   * Supports Freedom Plans (1-3 months)
   */
  async createSubscription(userId, planId, enableAutoPay = false) {
    
    
    try {
      // Get plan details
      const planResult = await pool.query(
        'SELECT * FROM plans WHERE id = $1',
        [planId]
      );

      if (planResult.rows.length === 0) {
        throw new Error('Plan not found');
      }

      const plan = planResult.rows[0];

      // Create Razorpay plan if auto-pay enabled
      let razorpayPlanId = null;
      let razorpaySubscriptionId = null;

      if (enableAutoPay) {
        // Create Razorpay plan (one-time per plan)
        const razorpayPlan = await this.razorpay.plans.create({
          period: 'monthly',
          interval: plan.validity_months || 1,
          item: {
            name: plan.name,
            amount: plan.price * 100, // Convert to paise
            currency: 'INR',
            description: plan.description
          }
        });

        razorpayPlanId = razorpayPlan.id;

        // Create subscription
        const razorpaySubscription = await this.razorpay.subscriptions.create({
          plan_id: razorpayPlanId,
          customer_notify: 1,
          total_count: 12, // Maximum renewals
          notes: {
            userId,
            planId,
            planName: plan.name
          }
        });

        razorpaySubscriptionId = razorpaySubscription.id;
      }

      // Create subscription record in database
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + (plan.validity_months || 1));

      const result = await pool.query(
        `INSERT INTO subscriptions 
        (user_id, plan_id, auto_pay_enabled, payment_method_id, next_billing_date, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [userId, planId, enableAutoPay, razorpaySubscriptionId, nextBillingDate, 'active']
      );

      return {
        subscription: result.rows[0],
        razorpaySubscriptionId,
        razorpayPlanId
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Enable auto-pay for existing subscription
   */
  async enableAutoPay(subscriptionId, userId, paymentMethodId) {
    
    
    try {
      // Get subscription
      const subResult = await pool.query(
        `SELECT s.*, p.name, p.price, p.validity_months 
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.id = $1 AND s.user_id = $2`,
        [subscriptionId, userId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const subscription = subResult.rows[0];

      // Create Razorpay subscription if not exists
      if (!subscription.payment_method_id) {
        const razorpayPlan = await this.razorpay.plans.create({
          period: 'monthly',
          interval: subscription.validity_months || 1,
          item: {
            name: subscription.name,
            amount: subscription.price * 100,
            currency: 'INR'
          }
        });

        const razorpaySubscription = await this.razorpay.subscriptions.create({
          plan_id: razorpayPlan.id,
          customer_notify: 1,
          total_count: 12,
          notes: {
            userId,
            planId: subscription.plan_id,
            subscriptionId
          }
        });

        paymentMethodId = razorpaySubscription.id;
      }

      // Update subscription
      await pool.query(
        `UPDATE subscriptions 
        SET auto_pay_enabled = true, payment_method_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [paymentMethodId, subscriptionId]
      );

      return {
        success: true,
        message: 'Auto-pay enabled successfully',
        subscriptionId,
        paymentMethodId
      };
    } catch (error) {
      console.error('Error enabling auto-pay:', error);
      throw error;
    }
  }

  /**
   * Disable auto-pay (pause subscription)
   */
  async disableAutoPay(subscriptionId, userId) {
    
    
    try {
      // Get subscription
      const subResult = await pool.query(
        'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
        [subscriptionId, userId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const subscription = subResult.rows[0];

      // Pause Razorpay subscription
      if (subscription.payment_method_id) {
        await this.razorpay.subscriptions.cancel(subscription.payment_method_id);
      }

      // Update database
      await pool.query(
        `UPDATE subscriptions 
        SET auto_pay_enabled = false, status = 'paused', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [subscriptionId]
      );

      return {
        success: true,
        message: 'Auto-pay disabled successfully'
      };
    } catch (error) {
      console.error('Error disabling auto-pay:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, userId) {
    
    
    try {
      const subResult = await pool.query(
        'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
        [subscriptionId, userId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      const subscription = subResult.rows[0];

      // Cancel Razorpay subscription
      if (subscription.payment_method_id) {
        await this.razorpay.subscriptions.cancel(subscription.payment_method_id, {
          cancel_at_cycle_end: 0 // Cancel immediately
        });
      }

      // Update database
      await pool.query(
        `UPDATE subscriptions 
        SET status = 'cancelled', auto_pay_enabled = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [subscriptionId]
      );

      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Process subscription renewal
   */
  async processRenewal(subscriptionId, razorpayPaymentId) {
    
    
    try {
      // Get subscription
      const subResult = await pool.query(
        `SELECT s.*, p.price, p.validity_months 
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.id = $1 AND s.status = 'active'`,
        [subscriptionId]
      );

      if (subResult.rows.length === 0) {
        throw new Error('Active subscription not found');
      }

      const subscription = subResult.rows[0];

      // Create payment record
      await pool.query(
        `INSERT INTO payments 
        (user_id, plan_id, amount, status, razorpay_payment_id, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          subscription.user_id,
          subscription.plan_id,
          subscription.price,
          'completed',
          razorpayPaymentId,
          'subscription'
        ]
      );

      // Update next billing date
      const nextBillingDate = new Date(subscription.next_billing_date);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + (subscription.validity_months || 1));

      await pool.query(
        `UPDATE subscriptions 
        SET next_billing_date = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
        [nextBillingDate, subscriptionId]
      );

      return {
        success: true,
        message: 'Subscription renewed successfully',
        nextBillingDate
      };
    } catch (error) {
      console.error('Error processing renewal:', error);
      throw error;
    }
  }

  /**
   * Handle failed renewal (grace period)
   */
  async handleFailedRenewal(subscriptionId) {
    
    
    try {
      // Set 7-day grace period
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      await pool.query(
        `UPDATE subscriptions 
        SET status = 'grace_period', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [subscriptionId]
      );

      // Schedule retry attempts (3 times over 7 days)
      // TODO: Implement retry scheduling

      return {
        success: true,
        message: 'Grace period activated',
        gracePeriodEnd
      };
    } catch (error) {
      console.error('Error handling failed renewal:', error);
      throw error;
    }
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId) {
    
    
    try {
      const result = await pool.query(
        `SELECT 
          s.*,
          p.name as plan_name,
          p.price,
          p.validity_months,
          p.ai_minutes
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw error;
    }
  }

  /**
   * Check for upcoming renewals (for notifications)
   */
  async getUpcomingRenewals(daysAhead = 3) {
    
    
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      const result = await pool.query(
        `SELECT 
          s.*,
          u.mobile,
          u.name as user_name,
          p.name as plan_name,
          p.price
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN plans p ON s.plan_id = p.id
        WHERE s.status = 'active' 
          AND s.auto_pay_enabled = true
          AND s.next_billing_date <= $1
          AND s.next_billing_date >= CURRENT_DATE`,
        [targetDate]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting upcoming renewals:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;
