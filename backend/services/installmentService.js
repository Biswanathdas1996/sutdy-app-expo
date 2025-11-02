const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/database');

class InstallmentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create installment payment plan for Professional plan
   * First payment: ₹1,299 (immediate)
   * Second payment: ₹1,200 (after 30 days)
   */
  async createInstallmentPlan(userId, planId, totalAmount) {
    try {
      const installments = [
        {
          amount: 1299,
          dueDate: new Date(), // Immediate payment
          installmentNumber: 1,
          status: 'pending'
        },
        {
          amount: 1200,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
          installmentNumber: 2,
          status: 'pending'
        }
      ];

      // Verify total matches
      const calculatedTotal = installments.reduce((sum, inst) => sum + inst.amount, 0);
      if (calculatedTotal !== totalAmount) {
        throw new Error(`Installment total (₹${calculatedTotal}) doesn't match plan total (₹${totalAmount})`);
      }

      return installments;
    } catch (error) {
      console.error('Error creating installment plan:', error);
      throw error;
    }
  }

  /**
   * Create Razorpay payment order for first installment
   */
  async createFirstInstallmentOrder(userId, planId, installmentAmount) {
    try {
      const order = await this.razorpay.orders.create({
        amount: installmentAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: `inst_1_${userId}_${planId}_${Date.now()}`,
        notes: {
          userId,
          planId,
          installmentNumber: 1,
          installmentType: 'first',
          totalInstallments: 2
        }
      });

      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Process first installment payment
   */
  async processFirstInstallment(paymentData) {
    const { userId, planId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    try {
      // Verify payment signature
      const isValid = this.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Create payment record
      const paymentId = await this.db.createPayment({
        userId,
        planId,
        amount: 1299,
        status: 'completed',
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod: 'installment'
      });

      // Create installment records
      await this.createInstallmentRecords(paymentId, userId, planId);

      // Mark first installment as paid
      await this.markInstallmentPaid(paymentId, 1, razorpayPaymentId);

      // Schedule reminder for second installment
      await this.scheduleSecondInstallmentReminder(userId, paymentId);

      return {
        success: true,
        paymentId,
        message: 'First installment processed successfully',
        nextInstallment: {
          amount: 1200,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      };
    } catch (error) {
      console.error('Error processing first installment:', error);
      throw error;
    }
  }

  /**
   * Create installment records in database
   */
  async createInstallmentRecords(paymentId, userId, planId) {
    
    
    try {
      // First installment (already paid)
      await pool.query(
        `INSERT INTO payment_installments 
        (payment_id, installment_number, amount, due_date, status) 
        VALUES ($1, $2, $3, $4, $5)`,
        [paymentId, 1, 1299, new Date(), 'pending']
      );

      // Second installment (due in 30 days)
      await pool.query(
        `INSERT INTO payment_installments 
        (payment_id, installment_number, amount, due_date, status) 
        VALUES ($1, $2, $3, $4, $5)`,
        [paymentId, 2, 1200, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'pending']
      );

      return true;
    } catch (error) {
      console.error('Error creating installment records:', error);
      throw error;
    }
  }

  /**
   * Mark installment as paid
   */
  async markInstallmentPaid(paymentId, installmentNumber, razorpayPaymentId) {
    
    
    try {
      await pool.query(
        `UPDATE payment_installments 
        SET status = $1, paid_at = $2, razorpay_payment_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE payment_id = $4 AND installment_number = $5`,
        ['paid', new Date(), razorpayPaymentId, paymentId, installmentNumber]
      );

      return true;
    } catch (error) {
      console.error('Error marking installment paid:', error);
      throw error;
    }
  }

  /**
   * Get pending installments for a user
   */
  async getPendingInstallments(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          pi.id,
          pi.payment_id,
          pi.installment_number,
          pi.amount,
          pi.due_date,
          pi.status,
          p.plan_id,
          pl.name as plan_name
        FROM payment_installments pi
        JOIN payments p ON pi.payment_id = p.id
        JOIN plans pl ON p.plan_id = pl.id
        WHERE p.user_id = $1 
          AND pi.status = 'pending'
        ORDER BY pi.due_date ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting pending installments:', error);
      throw error;
    }
  }

  /**
   * Create payment order for second installment
   */
  async createSecondInstallmentOrder(installmentId, userId) {
    try {
      // Get installment details
      const result = await pool.query(
        `SELECT pi.*, p.plan_id 
        FROM payment_installments pi
        JOIN payments p ON pi.payment_id = p.id
        WHERE pi.id = $1 AND p.user_id = $2 AND pi.installment_number = 2`,
        [installmentId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Installment not found');
      }

      const installment = result.rows[0];

      // Create Razorpay order
      const order = await this.razorpay.orders.create({
        amount: installment.amount * 100,
        currency: 'INR',
        receipt: `inst_2_${userId}_${installment.plan_id}_${Date.now()}`,
        notes: {
          userId,
          planId: installment.plan_id,
          installmentNumber: 2,
          installmentId: installment.id,
          installmentType: 'second'
        }
      });

      return {
        order,
        installment
      };
    } catch (error) {
      console.error('Error creating second installment order:', error);
      throw error;
    }
  }

  /**
   * Process second installment payment
   */
  async processSecondInstallment(paymentData) {
    const { installmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    try {
      // Verify signature
      const isValid = this.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      
      
      // Update installment status
      await pool.query(
        `UPDATE payment_installments 
        SET status = $1, paid_at = $2, razorpay_payment_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4`,
        ['paid', new Date(), razorpayPaymentId, installmentId]
      );

      // Check if all installments are paid
      const paymentResult = await pool.query(
        `SELECT payment_id FROM payment_installments WHERE id = $1`,
        [installmentId]
      );

      const paymentId = paymentResult.rows[0].payment_id;

      const allInstallments = await pool.query(
        `SELECT COUNT(*) as total, 
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid
        FROM payment_installments
        WHERE payment_id = $1`,
        [paymentId]
      );

      const { total, paid } = allInstallments.rows[0];
      const allPaid = parseInt(total) === parseInt(paid);

      // Update payment status if all installments paid
      if (allPaid) {
        await pool.query(
          `UPDATE payments 
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2`,
          ['completed', paymentId]
        );
      }

      return {
        success: true,
        message: 'Second installment processed successfully',
        allInstallmentsPaid: allPaid
      };
    } catch (error) {
      console.error('Error processing second installment:', error);
      throw error;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Schedule reminder for second installment
   */
  async scheduleSecondInstallmentReminder(userId, paymentId) {
    // TODO: Implement notification scheduling
    // This would integrate with your notification service
    console.log(`Reminder scheduled for user ${userId}, payment ${paymentId}`);
    return true;
  }

  /**
   * Get installment payment history
   */
  async getInstallmentHistory(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          p.id as payment_id,
          pl.name as plan_name,
          p.amount as total_amount,
          p.created_at,
          json_agg(
            json_build_object(
              'installmentNumber', pi.installment_number,
              'amount', pi.amount,
              'dueDate', pi.due_date,
              'status', pi.status,
              'paidAt', pi.paid_at
            ) ORDER BY pi.installment_number
          ) as installments
        FROM payments p
        JOIN plans pl ON p.plan_id = pl.id
        JOIN payment_installments pi ON p.id = pi.payment_id
        WHERE p.user_id = $1 AND p.payment_method = 'installment'
        GROUP BY p.id, pl.name, p.amount, p.created_at
        ORDER BY p.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting installment history:', error);
      throw error;
    }
  }
}

module.exports = InstallmentService;
