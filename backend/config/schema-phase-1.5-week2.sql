-- Add demo_bookings table for free demo class scheduling

CREATE TABLE IF NOT EXISTS demo_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  contact_mobile VARCHAR(15) NOT NULL,
  contact_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  -- Status: confirmed, cancelled, completed, no_show
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_demo_bookings_user_id ON demo_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_scheduled_at ON demo_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);

-- Add payment_installments and subscriptions tables if not already created
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
  -- Status: first_pending, first_paid, second_pending, fully_paid, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  razorpay_subscription_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Status: active, paused, cancelled, grace_period, expired
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

-- Indexes for installments
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON payment_installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON payment_installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_second_due_date ON payment_installments(second_due_date);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);

COMMENT ON TABLE demo_bookings IS 'Stores free demo class bookings before Professional plan purchase';
COMMENT ON TABLE payment_installments IS 'Manages two-part installment payments (₹1,299 + ₹1,200)';
COMMENT ON TABLE subscriptions IS 'Manages auto-renewing subscriptions with grace period';
