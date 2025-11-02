-- Create Membership Registrations table to store form submissions
CREATE TABLE IF NOT EXISTS membership_registrations (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  whatsapp_number VARCHAR(15),
  age VARCHAR(10),
  gender VARCHAR(20),
  country VARCHAR(100),
  english_skills TEXT[],
  highest_qualification VARCHAR(255),
  speaking_partner_interest VARCHAR(255),
  about_you TEXT,
  profile_photo_base64 TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for mobile number lookup
CREATE INDEX IF NOT EXISTS idx_membership_registrations_mobile ON membership_registrations(mobile_number);

-- Add comment to table
COMMENT ON TABLE membership_registrations IS 'Stores membership registration form submissions separate from users table';
