-- Add Core Course Plans (ELC Silver, Gold, Diamond, DELCA)
-- Add Kids Course Plans (Story Basket, Grammar Garden)

-- ELC Silver (3 months)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'ELC Silver',
  'Essential Learning Curriculum - Foundation level for structured English mastery',
  4999,
  90,
  ARRAY[
    '📚 3 months of structured curriculum',
    '🎯 300 AI tutor minutes',
    '👨‍🏫 Live classes with expert trainers',
    '📝 Weekly assessments and feedback',
    '🏆 Certificate upon completion',
    '💬 SpeakEdge community access',
    '📱 Mobile app + Desktop access'
  ],
  'core',
  'course',
  300,
  3,
  5999,
  false
);

-- ELC Gold (6 months)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'ELC Gold',
  'Essential Learning Curriculum - Intermediate level with advanced practice',
  7999,
  180,
  ARRAY[
    '📚 6 months of comprehensive curriculum',
    '🎯 600 AI tutor minutes',
    '👨‍🏫 Bi-weekly live classes',
    '📝 Detailed progress tracking',
    '🎓 Industry-recognized certificate',
    '💬 Priority SpeakEdge partner matching',
    '📱 All platforms + Offline mode',
    '🎁 Bonus: Grammar mastery module'
  ],
  'core',
  'course',
  600,
  6,
  9999,
  true
);

-- ELC Diamond (12 months)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'ELC Diamond',
  'Essential Learning Curriculum - Complete mastery program with personalized coaching',
  11999,
  365,
  ARRAY[
    '📚 12 months full curriculum access',
    '🎯 1000 AI tutor minutes',
    '👨‍🏫 Weekly live classes + 1-on-1 coaching',
    '📝 Personalized learning path',
    '🏆 Premium certification',
    '💬 VIP SpeakEdge community status',
    '📱 Lifetime access to course materials',
    '🎁 Bonus: Business English module',
    '🎁 Bonus: IELTS/TOEFL prep module'
  ],
  'core',
  'course',
  1000,
  12,
  14999,
  false
);

-- DELCA (Digital English Language and Communication Advancement)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'DELCA Program',
  'Digital English Language and Communication Advancement - Elite professional certification',
  14999,
  180,
  ARRAY[
    '🎓 6 months intensive professional program',
    '🎯 800 AI tutor minutes',
    '👨‍🏫 Daily live sessions with expert trainers',
    '📝 Weekly assignments and projects',
    '🏆 Industry-recognized DELCA certificate',
    '💼 Job interview preparation',
    '💬 Executive-level conversation practice',
    '📱 All platform access + Priority support',
    '🎁 Resume building workshop',
    '🎁 LinkedIn profile optimization',
    '🎁 Soft skills masterclass'
  ],
  'core',
  'course',
  800,
  6,
  19999,
  false
);

-- Kids: Story Basket (Ages 4-7)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'Story Basket',
  'Fun English learning through interactive stories for young children (Ages 4-7)',
  2999,
  90,
  ARRAY[
    '📖 3 months of storytelling sessions',
    '🎯 150 AI tutor minutes (kid-friendly)',
    '🎨 Interactive games and activities',
    '👶 Age-appropriate content (4-7 years)',
    '🏆 Achievement badges for kids',
    '👨‍👩‍👧 Parent progress dashboard',
    '📱 Child-safe app interface',
    '🎁 Free storybook collection'
  ],
  'kids',
  'course',
  150,
  3,
  3999,
  true
);

-- Kids: Grammar Garden (Ages 8-12)
INSERT INTO plans (
  name, 
  description, 
  price, 
  duration, 
  features,
  plan_type,
  category,
  ai_minutes,
  validity_months,
  original_price,
  is_popular
) VALUES (
  'Grammar Garden',
  'Structured grammar and vocabulary building for school-age children (Ages 8-12)',
  3999,
  120,
  ARRAY[
    '📚 4 months of structured learning',
    '🎯 250 AI tutor minutes (kid-friendly)',
    '📝 Interactive grammar exercises',
    '👧 Age-appropriate content (8-12 years)',
    '🏆 Level-based achievement system',
    '👨‍👩‍👧 Parent progress reports',
    '📱 Gamified learning interface',
    '🎁 Free grammar workbook',
    '🎁 Vocabulary flashcards'
  ],
  'kids',
  'course',
  250,
  4,
  4999,
  false
);

-- Verify all plans
SELECT 
  id,
  name,
  plan_type,
  category,
  price,
  validity_months,
  ai_minutes,
  is_popular
FROM plans
ORDER BY 
  CASE plan_type
    WHEN 'freedom' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'core' THEN 3
    WHEN 'kids' THEN 4
    ELSE 5
  END,
  price;
