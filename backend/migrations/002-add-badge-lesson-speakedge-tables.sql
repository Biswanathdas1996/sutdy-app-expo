-- Migration: Add Badge System, Lesson System, and SpeakEdge Social Module Tables
-- Created: 2025-11-02
-- Description: Tables for student badges, daily lessons, and social conversation buddy features

-- =====================================================
-- BADGE SYSTEM TABLES
-- =====================================================

-- Badge definitions table (predefined badges)
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  points_required INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined badges
INSERT INTO badges (name, description, icon, points_required) VALUES
  ('Learner in Motion', 'You are on your way - keep the momentum going!', '🚶', 0),
  ('Steady Climber', 'You have built a habit - consistency pays off.', '⛰️', 300),
  ('Committed Achiever', 'Your dedication shows - you are reaching new heights!', '🏅', 600),
  ('Language Hero', 'You are among the top learners - a true hero of progress.', '🦸', 800),
  ('Streak Legend', 'A flawless journey - you have mastered daily discipline and earned the crown.', '👑', 900)
ON CONFLICT DO NOTHING;

-- User badge progress table (tracks individual user progress)
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_badge_id INTEGER REFERENCES badges(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Daily badge points log (tracks daily activity points)
CREATE TABLE IF NOT EXISTS badge_points_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_date DATE NOT NULL,
  admin_key_validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_date, activity_type)
);

-- Badge unlocks history
CREATE TABLE IF NOT EXISTS user_badges_unlocked (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- LESSON SYSTEM TABLES
-- =====================================================

-- Lesson definitions (admin creates 3 sets of 180 lessons each)
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL, -- 'A1-A2', 'B1-B2', 'C1-C2'
  lesson_number INTEGER NOT NULL, -- 1 to 180
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  exercises JSONB, -- JSON array of exercises
  media_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(level, lesson_number)
);

-- User lesson progress (tracks which lessons a user has completed)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  score INTEGER, -- optional score if lesson has quiz
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Daily lesson assignment (one lesson per day based on user's level)
CREATE TABLE IF NOT EXISTS daily_lesson_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, assigned_date)
);

-- =====================================================
-- SPEAKEDGE SOCIAL MODULE TABLES
-- =====================================================

-- User SpeakEdge profiles (extends user data with social features)
CREATE TABLE IF NOT EXISTS speakedge_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  english_level VARCHAR(20),
  speakedge_badge VARCHAR(100), -- special badge for social activity
  bio TEXT,
  is_available_for_conversation BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- User status posts (like Facebook feed)
CREATE TABLE IF NOT EXISTS speakedge_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url VARCHAR(500),
  is_advertisement BOOLEAN DEFAULT FALSE,
  ad_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post reactions (emoji reactions with auto-comments)
CREATE TABLE IF NOT EXISTS speakedge_reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES speakedge_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  auto_comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id) -- one reaction per user per post
);

-- Manual comments on posts
CREATE TABLE IF NOT EXISTS speakedge_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES speakedge_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation partner invitations
CREATE TABLE IF NOT EXISTS speakedge_partner_invites (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'not_interested'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, receiver_id)
);

-- Accepted conversation partners
CREATE TABLE IF NOT EXISTS speakedge_partners (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- ensure no duplicate pairs
);

-- User blocks (blocked users cannot interact)
CREATE TABLE IF NOT EXISTS speakedge_blocks (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id)
);

-- User likes/dislikes on accounts
CREATE TABLE IF NOT EXISTS speakedge_account_reactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'dislike'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, target_user_id)
);

-- Advertisement packages
CREATE TABLE IF NOT EXISTS speakedge_ad_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_per_click DECIMAL(10, 2) NOT NULL,
  total_clicks_included INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default ad packages
INSERT INTO speakedge_ad_packages (name, description, price_per_click, total_clicks_included, total_price, duration_days) VALUES
  ('Starter Pack', 'Perfect for testing the waters', 2.00, 50, 100.00, 7),
  ('Growth Pack', 'Ideal for growing your reach', 1.50, 200, 300.00, 14),
  ('Pro Pack', 'Maximum visibility and engagement', 1.00, 500, 500.00, 30),
  ('Enterprise Pack', 'For serious advertisers', 0.75, 1000, 750.00, 60)
ON CONFLICT DO NOTHING;

-- User advertisement accounts
CREATE TABLE IF NOT EXISTS speakedge_ad_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES speakedge_ad_packages(id),
  clicks_remaining INTEGER DEFAULT 0,
  clicks_used INTEGER DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Notifications for SpeakEdge activities
CREATE TABLE IF NOT EXISTS speakedge_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'partner_invite', 'partner_accepted', 'reaction', 'comment', etc.
  content TEXT NOT NULL,
  related_user_id INTEGER REFERENCES users(id),
  related_post_id INTEGER REFERENCES speakedge_posts(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Badge system indexes
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_user_id ON user_badge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_points_log_user_id ON badge_points_log(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_points_log_date ON badge_points_log(activity_date);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked_user_id ON user_badges_unlocked(user_id);

-- Lesson system indexes
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_lesson_assignments_user_id ON daily_lesson_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_lesson_assignments_date ON daily_lesson_assignments(assigned_date);

-- SpeakEdge indexes
CREATE INDEX IF NOT EXISTS idx_speakedge_profiles_user_id ON speakedge_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_posts_user_id ON speakedge_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_posts_created_at ON speakedge_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speakedge_reactions_post_id ON speakedge_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_comments_post_id ON speakedge_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_partner_invites_receiver ON speakedge_partner_invites(receiver_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_blocks_blocked_id ON speakedge_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_speakedge_notifications_user_id ON speakedge_notifications(user_id);

-- =====================================================
-- GRANT PERMISSIONS (adjust based on your DB user)
-- =====================================================

-- Grant all privileges on new tables to your database user
-- Replace 'study_app_user' with your actual database user if different
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO study_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO study_app_user;
