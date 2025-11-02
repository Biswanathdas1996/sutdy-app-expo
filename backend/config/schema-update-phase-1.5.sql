-- Phase 1.5: Add support for plan variants, installments, and sub-plans
-- Date: November 2, 2025

-- Extend plans table for new features
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'subscription';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS sub_plans JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS installment_options JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS demo_class_url TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS ai_minutes INTEGER;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS validity_months INTEGER;

-- Create payment_installments table
CREATE TABLE IF NOT EXISTS payment_installments (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
  paid_at TIMESTAMP,
  razorpay_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table for auto-pay
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  auto_pay_enabled BOOLEAN DEFAULT FALSE,
  payment_method_id TEXT,
  next_billing_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_installments_payment_id ON payment_installments(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_category ON plans(category);
CREATE INDEX IF NOT EXISTS idx_plans_plan_type ON plans(plan_type);

-- Insert Freedom Plan variants
INSERT INTO plans (
  name, price, original_price, duration, ai_minutes, validity_months,
  features, is_popular, plan_type, category, description
) VALUES
  -- Freedom Plan - Basic
  (
    'Freedom Basic',
    399.00,
    499.00,
    30,
    100,
    1,
    ARRAY[
      '🎯 100 minutes of English conversation with an AI Tutor',
      '👥 Unlimited access to English conversation partners',
      '📚 Daily bite-sized lessons customised to your level (A1–C2) with badge system'
    ],
    FALSE,
    'freedom',
    'subscription',
    'Basic plan for starting your English learning journey'
  ),
  -- Freedom Plan - Growth
  (
    'Freedom Growth',
    599.00,
    799.00,
    60,
    200,
    2,
    ARRAY[
      '🎯 200 minutes of English conversation with an AI Tutor',
      '👥 Unlimited access to English conversation partners',
      '📚 Daily bite-sized lessons customised to your level (A1–C2) with badge system'
    ],
    TRUE,
    'freedom',
    'subscription',
    'Growth plan for consistent learning progress'
  ),
  -- Freedom Plan - Intensive
  (
    'Freedom Intensive',
    799.00,
    999.00,
    90,
    300,
    3,
    ARRAY[
      '🎯 300 minutes of English conversation with an AI Tutor',
      '👥 Unlimited access to English conversation partners',
      '📚 Daily bite-sized lessons customised to your level (A1–C2) with badge system',
      '📖 Methodical Spoken English book included',
      '💼 Complete Interview Skills course',
      '🌟 Soft Skills & Personality Development course',
      '📝 CEFR-based English speaking test',
      '🎓 Certificate mentioning your CEFR level',
      '♾️ Lifetime membership on the SpeakEdge App'
    ],
    FALSE,
    'freedom',
    'subscription',
    'Intensive plan for rapid skill development'
  )
ON CONFLICT (name) DO NOTHING;

-- Insert Professional English-Speaking Plan
INSERT INTO plans (
  name, price, original_price, duration, ai_minutes, validity_months,
  features, is_popular, plan_type, category, description,
  installment_options
) VALUES
  (
    'Professional English',
    1899.00,
    2499.00,
    90,
    600,
    3,
    ARRAY[
      '🏢 Practice English tailored to your profession',
      '🗣️ 600 minutes of AI conversation across 60 real-life topics',
      '⏳ Course Duration: 3 months',
      '👥 Unlimited access to English conversation partners',
      '📚 Daily bite-sized lessons customised to your level (A1–C2) with a badge system',
      '📖 Methodical Spoken English book included',
      '💼 Complete Interview Skills course',
      '🌟 Soft Skills & Personality Development course',
      '📝 CEFR-based English speaking test',
      '🎓 Certificate mentioning your CEFR level',
      '♾️ Lifetime membership on the SpeakEdge App'
    ],
    TRUE,
    'professional',
    'subscription',
    'Professional English for career advancement',
    '{"options": [{"type": "one_time", "amount": 1899}, {"type": "two_installments", "amounts": [1299, 1200]}]}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Insert Starter Plan (with discount)
INSERT INTO plans (
  name, price, original_price, duration, ai_minutes, validity_months,
  features, is_popular, plan_type, category, description
) VALUES
  (
    'Starter Plan',
    499.00,
    1999.00,
    180,
    100,
    6,
    ARRAY[
      '🎯 100 minutes of English conversation with an AI Tutor',
      '👥 Unlimited access to English conversation partners',
      '📚 Daily bite-sized lessons customised to your level (A1–C2) with a badge system',
      '📖 A methodical Spoken English book included',
      '💼 A complete Interview Skills course',
      '🌟 A complete soft skills & Personality Development course',
      '📝 CEFR-based English speaking test',
      '🎓 Certificate mentioning your CEFR level',
      '♾️ Lifetime membership on the SpeakEdge App'
    ],
    TRUE,
    'starter',
    'subscription',
    '75% OFF - Special introductory offer for new students'
  )
ON CONFLICT (name) DO NOTHING;

-- Update existing plans with new fields
UPDATE plans 
SET 
  plan_type = 'basic',
  category = 'subscription',
  validity_months = duration,
  description = CASE 
    WHEN name = 'Basic' THEN 'Basic plan for beginners'
    WHEN name = 'Pro' THEN 'Professional plan with advanced features'
    WHEN name = 'Premium' THEN 'Premium plan with all features'
  END
WHERE plan_type IS NULL OR plan_type = 'standard';

COMMIT;
