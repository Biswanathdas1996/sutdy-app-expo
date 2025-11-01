-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  english_level VARCHAR(50),
  learning_goals TEXT[],
  skills_focus TEXT[],
  speaking_partner VARCHAR(10),
  whatsapp_number VARCHAR(15),
  age VARCHAR(10),
  gender VARCHAR(20),
  country VARCHAR(100),
  english_skills TEXT[],
  highest_qualification VARCHAR(255),
  speaking_partner_interest VARCHAR(10),
  about_you TEXT,
  profile_photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  features TEXT[] NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(50),
  razorpay_payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans (using ON CONFLICT to avoid duplicates)
INSERT INTO plans (name, price, duration, features, is_popular) VALUES
  ('Basic', 499.00, 1, ARRAY['1-month access', 'Basic lessons', 'Community support', 'Progress tracking'], FALSE),
  ('Pro', 1299.00, 3, ARRAY['3-month access', 'Advanced lessons', 'Priority support', 'Speaking practice', 'Personalized feedback'], TRUE),
  ('Premium', 2299.00, 6, ARRAY['6-month access', 'All lessons', '24/7 support', 'Weekly 1-on-1 sessions', 'Certificate of completion', 'Lifetime resources'], FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert default coupons
INSERT INTO coupons (code, discount_type, discount_value, is_active) VALUES
  ('WELCOME50', 'percentage', 50.00, TRUE),
  ('SAVE100', 'fixed', 100.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
