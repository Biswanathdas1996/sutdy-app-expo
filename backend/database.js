const pool = require('./config/database');
const { v4: uuidv4 } = require('uuid');

class Database {
  // User methods
  async createUser(userData) {
    const query = `
      INSERT INTO users (mobile, whatsapp_number, name)
      VALUES ($1, $2, $3)
      RETURNING id, mobile, whatsapp_number, name, english_level, learning_goals, skills_focus, speaking_partner, created_at, updated_at
    `;
    const values = [
      userData.mobileNumber, 
      userData.whatsappNumber || userData.mobileNumber, // Use WhatsApp number or fallback to mobile
      userData.name
    ];
    
    try {
      const result = await pool.query(query, values);
      const user = result.rows[0];
      return {
        id: user.id.toString(),
        userId: user.id.toString(),
        mobileNumber: user.mobile,
        whatsappNumber: user.whatsapp_number,
        name: user.name,
        fullName: user.name,
        englishLevel: user.english_level,
        learningGoals: user.learning_goals || [],
        skillsFocus: user.skills_focus || [],
        needsSpeakingPartner: user.speaking_partner,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findUserByMobile(mobileNumber) {
    // Use WhatsApp number as the primary identifier for authentication
    const query = `
      SELECT * FROM users 
      WHERE whatsapp_number = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [mobileNumber]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id.toString(),
      userId: user.id.toString(),
      mobileNumber: user.mobile,
      whatsappNumber: user.whatsapp_number,
      name: user.name,
      englishLevel: user.english_level,
      learningGoals: user.learning_goals || [],
      skillsFocus: user.skills_focus || [],
      needsSpeakingPartner: user.speaking_partner,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async findUserById(userId) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [parseInt(userId)]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id.toString(),
      userId: user.id.toString(),
      mobileNumber: user.mobile,
      name: user.name,
      englishLevel: user.english_level,
      learningGoals: user.learning_goals || [],
      skillsFocus: user.skills_focus || [],
      needsSpeakingPartner: user.speaking_partner,
      profilePhoto: user.profile_photo,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async updateUser(userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.englishLevel !== undefined) {
      fields.push(`english_level = $${paramIndex++}`);
      values.push(updates.englishLevel);
    }
    if (updates.learningGoals !== undefined) {
      fields.push(`learning_goals = $${paramIndex++}`);
      values.push(updates.learningGoals);
    }
    if (updates.skillsFocus !== undefined) {
      fields.push(`skills_focus = $${paramIndex++}`);
      values.push(updates.skillsFocus);
    }
    if (updates.needsSpeakingPartner !== undefined) {
      fields.push(`speaking_partner = $${paramIndex++}`);
      values.push(updates.needsSpeakingPartner);
    }

    if (fields.length === 0) return this.findUserById(userId);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(userId));

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      return {
        id: user.id.toString(),
        userId: user.id.toString(),
        mobileNumber: user.mobile,
        name: user.name,
        englishLevel: user.english_level,
        learningGoals: user.learning_goals || [],
        skillsFocus: user.skills_focus || [],
        needsSpeakingPartner: user.speaking_partner,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Session methods
  async createSession(userId) {
    const token = uuidv4();
    const sessionId = uuidv4(); // Add unique session ID
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const query = `
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [parseInt(userId), token, expiresAt];

    try {
      const result = await pool.query(query, values);
      const session = result.rows[0];
      return {
        authToken: session.token,
        sessionId: session.id.toString(), // Use the database session ID
        userId: session.user_id.toString(),
        expiresAt: session.expires_at
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async findSessionByToken(token) {
    const query = `
      SELECT * FROM sessions 
      WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) return null;
    
    const session = result.rows[0];
    return {
      authToken: session.token,
      sessionId: session.id.toString(),
      userId: session.user_id.toString(),
      expiresAt: session.expires_at
    };
  }

  async findSessionById(sessionId) {
    const query = `
      SELECT * FROM sessions 
      WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(query, [parseInt(sessionId)]);
    
    if (result.rows.length === 0) return null;
    
    const session = result.rows[0];
    return {
      authToken: session.token,
      sessionId: session.id.toString(),
      userId: session.user_id.toString(),
      expiresAt: session.expires_at
    };
  }

  async deleteSession(token) {
    const query = 'DELETE FROM sessions WHERE token = $1';
    await pool.query(query, [token]);
  }

  // Plan methods
  async getAllPlans() {
    const query = 'SELECT * FROM plans ORDER BY price ASC';
    const result = await pool.query(query);
    
    return result.rows.map(plan => ({
      id: plan.id.toString(),
      name: plan.name,
      price: parseFloat(plan.price),
      originalPrice: plan.original_price ? parseFloat(plan.original_price) : null,
      duration: plan.duration,
      aiMinutes: plan.ai_minutes,
      validityMonths: plan.validity_months,
      features: plan.features,
      isPopular: plan.is_popular,
      planType: plan.plan_type,
      category: plan.category,
      description: plan.description,
      installmentOptions: plan.installment_options,
      demoClassUrl: plan.demo_class_url,
      subPlans: plan.sub_plans
    }));
  }

  async getPlansByType(planType) {
    const query = 'SELECT * FROM plans WHERE plan_type = $1 ORDER BY price ASC';
    const result = await pool.query(query, [planType]);
    
    return result.rows.map(plan => ({
      id: plan.id.toString(),
      name: plan.name,
      price: parseFloat(plan.price),
      originalPrice: plan.original_price ? parseFloat(plan.original_price) : null,
      duration: plan.duration,
      aiMinutes: plan.ai_minutes,
      validityMonths: plan.validity_months,
      features: plan.features,
      isPopular: plan.is_popular,
      planType: plan.plan_type,
      category: plan.category,
      description: plan.description,
      installmentOptions: plan.installment_options,
      demoClassUrl: plan.demo_class_url,
      subPlans: plan.sub_plans
    }));
  }

  async getPlanById(planId) {
    const query = 'SELECT * FROM plans WHERE id = $1';
    const result = await pool.query(query, [parseInt(planId)]);
    
    if (result.rows.length === 0) return null;
    
    const plan = result.rows[0];
    return {
      id: plan.id.toString(),
      name: plan.name,
      price: parseFloat(plan.price),
      originalPrice: plan.original_price ? parseFloat(plan.original_price) : null,
      duration: plan.duration,
      aiMinutes: plan.ai_minutes,
      validityMonths: plan.validity_months,
      features: plan.features,
      isPopular: plan.is_popular,
      planType: plan.plan_type,
      category: plan.category,
      description: plan.description,
      installmentOptions: plan.installment_options,
      demoClassUrl: plan.demo_class_url,
      subPlans: plan.sub_plans
    };
  }

  // Coupon methods
  async validateCoupon(code) {
    const query = `
      SELECT * FROM coupons 
      WHERE code = $1 AND is_active = TRUE
      AND (max_uses IS NULL OR used_count < max_uses)
    `;
    const result = await pool.query(query, [code]);
    
    if (result.rows.length === 0) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }

    const coupon = result.rows[0];
    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: parseFloat(coupon.discount_value)
    };
  }

  async incrementCouponUsage(code) {
    const query = `
      UPDATE coupons 
      SET used_count = used_count + 1
      WHERE code = $1
    `;
    await pool.query(query, [code]);
  }

  // Payment methods
  async createPayment(paymentData) {
    const query = `
      INSERT INTO payments (user_id, plan_id, amount, coupon_code, razorpay_order_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      parseInt(paymentData.userId),
      parseInt(paymentData.planId),
      paymentData.amount,
      paymentData.couponCode || null,
      paymentData.orderId,
      'pending'
    ];

    try {
      const result = await pool.query(query, values);
      const payment = result.rows[0];
      return {
        id: payment.id.toString(),
        userId: payment.user_id.toString(),
        planId: payment.plan_id.toString(),
        amount: parseFloat(payment.amount),
        couponCode: payment.coupon_code,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        status: payment.status,
        createdAt: payment.created_at
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId, status, razorpayPaymentId) {
    const query = `
      UPDATE payments 
      SET status = $1, razorpay_payment_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const values = [status, razorpayPaymentId, parseInt(paymentId)];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return null;
      
      const payment = result.rows[0];
      return {
        id: payment.id.toString(),
        userId: payment.user_id.toString(),
        planId: payment.plan_id.toString(),
        amount: parseFloat(payment.amount),
        couponCode: payment.coupon_code,
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        status: payment.status,
        createdAt: payment.created_at
      };
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [parseInt(paymentId)]);
    
    if (result.rows.length === 0) return null;
    
    const payment = result.rows[0];
    return {
      id: payment.id.toString(),
      userId: payment.user_id.toString(),
      planId: payment.plan_id.toString(),
      amount: parseFloat(payment.amount),
      couponCode: payment.coupon_code,
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      status: payment.status,
      createdAt: payment.created_at
    };
  }

  // Membership methods
  async createMembership(userId, planId, paymentId) {
    const plan = await this.getPlanById(planId);
    if (!plan) throw new Error('Plan not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const query = `
      INSERT INTO memberships (user_id, plan_id, payment_id, start_date, end_date, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING *
    `;
    const values = [
      parseInt(userId),
      parseInt(planId),
      parseInt(paymentId),
      startDate,
      endDate
    ];

    try {
      const result = await pool.query(query, values);
      const membership = result.rows[0];
      return {
        id: membership.id.toString(),
        userId: membership.user_id.toString(),
        planId: membership.plan_id.toString(),
        startDate: membership.start_date,
        endDate: membership.end_date,
        isActive: membership.is_active
      };
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  }

  async getUserMemberships(userId) {
    const query = `
      SELECT m.*, p.name as plan_name, p.price, p.duration
      FROM memberships m
      JOIN plans p ON m.plan_id = p.id
      WHERE m.user_id = $1
      ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query, [parseInt(userId)]);
    
    return result.rows.map(m => ({
      id: m.id.toString(),
      userId: m.user_id.toString(),
      planId: m.plan_id.toString(),
      planName: m.plan_name,
      startDate: m.start_date,
      endDate: m.end_date,
      isActive: m.is_active
    }));
  }

  // Membership registration methods (for form-based membership without payment)
  async findMembershipByMobile(mobileNumber) {
    // Query the membership_registrations table using WhatsApp number as primary identifier
    const query = `
      SELECT * FROM membership_registrations 
      WHERE whatsapp_number = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [mobileNumber]);
    
    if (result.rows.length === 0) return null;
    
    const membership = result.rows[0];
    return {
      id: membership.id.toString(),
      fullName: membership.full_name,
      mobileNumber: membership.mobile_number,
      whatsappNumber: membership.whatsapp_number,
      age: membership.age,
      gender: membership.gender,
      country: membership.country,
      englishSkills: membership.english_skills || [],
      highestQualification: membership.highest_qualification,
      speakingPartnerInterest: membership.speaking_partner_interest,
      aboutYou: membership.about_you,
      profilePhotoBase64: membership.profile_photo_base64
    };
  }

  async createMembershipRegistration(membershipData) {
    // This creates a user from membership form data
    const query = `
      INSERT INTO users (
        mobile, name, whatsapp_number, age, gender, country,
        english_skills, highest_qualification, speaking_partner_interest,
        about_you, profile_photo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      membershipData.mobileNumber,
      membershipData.fullName,
      membershipData.whatsappNumber,
      membershipData.age,
      membershipData.gender,
      membershipData.country,
      membershipData.englishSkills || [],
      membershipData.highestQualification,
      membershipData.speakingPartnerInterest,
      membershipData.aboutYou,
      membershipData.profilePhotoBase64 || null
    ];

    try {
      const result = await pool.query(query, values);
      const user = result.rows[0];
      return {
        id: user.id.toString(),
        fullName: user.name,
        mobileNumber: user.mobile,
        whatsappNumber: user.whatsapp_number,
        age: user.age,
        gender: user.gender,
        country: user.country,
        englishSkills: user.english_skills || [],
        highestQualification: user.highest_qualification,
        speakingPartnerInterest: user.speaking_partner_interest,
        aboutYou: user.about_you
      };
    } catch (error) {
      console.error('Error creating membership registration:', error);
      throw error;
    }
  }
}

// Export singleton instance
const db = new Database();
module.exports = db;
