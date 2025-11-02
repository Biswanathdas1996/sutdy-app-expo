const pool = require('./config/database');

async function migrateWeek2() {
  try {
    console.log('🚀 Starting Phase 1.5 Week 2 migration...\n');

    // Drop existing payment_installments and subscriptions tables (old schema)
    console.log('🗑️  Dropping old payment_installments and subscriptions tables...');
    await pool.query('DROP TABLE IF EXISTS payment_installments CASCADE;');
    await pool.query('DROP TABLE IF EXISTS subscriptions CASCADE;');
    console.log('✅ Old tables dropped\n');

    // Create demo_bookings table
    console.log('📋 Creating demo_bookings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demo_bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP NOT NULL,
        contact_mobile VARCHAR(15) NOT NULL,
        contact_email VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ demo_bookings table created\n');

    // Create indexes for demo_bookings
    console.log('🔍 Creating demo_bookings indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_demo_bookings_user_id ON demo_bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_demo_bookings_scheduled_at ON demo_bookings(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
    `);
    console.log('✅ Indexes created\n');

    // Create payment_installments table
    console.log('💰 Creating payment_installments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_installments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES plans(id),
        total_amount NUMERIC(10, 2) NOT NULL,
        first_installment_amount NUMERIC(10, 2) NOT NULL,
        second_installment_amount NUMERIC(10, 2) NOT NULL,
        first_payment_id VARCHAR(255),
        first_razorpay_order_id VARCHAR(255),
        first_payment_status VARCHAR(20) DEFAULT 'pending',
        first_paid_at TIMESTAMP,
        second_payment_id VARCHAR(255),
        second_razorpay_order_id VARCHAR(255),
        second_payment_status VARCHAR(20) DEFAULT 'pending',
        second_due_date TIMESTAMP,
        second_paid_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'first_pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ payment_installments table created\n');

    // Create indexes for installments
    console.log('🔍 Creating installments indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_installments_user_id ON payment_installments(user_id);
      CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status);
      CREATE INDEX IF NOT EXISTS idx_installments_second_due_date ON payment_installments(second_due_date);
    `);
    console.log('✅ Indexes created\n');

    // Create subscriptions table
    console.log('🔄 Creating subscriptions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES plans(id),
        razorpay_subscription_id VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        auto_pay_enabled BOOLEAN DEFAULT false,
        payment_method_id VARCHAR(255),
        start_date TIMESTAMP NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        next_billing_date TIMESTAMP,
        grace_period_end TIMESTAMP,
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ subscriptions table created\n');

    // Create indexes for subscriptions
    console.log('🔍 Creating subscriptions indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
    `);
    console.log('✅ Indexes created\n');

    console.log('🎉 Phase 1.5 Week 2 migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - demo_bookings table (free demo class scheduling)');
    console.log('   - payment_installments table (₹1,299 + ₹1,200 two-part payments)');
    console.log('   - subscriptions table (auto-renewing with grace period)');
    console.log('   - All indexes created for optimal performance\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateWeek2();
