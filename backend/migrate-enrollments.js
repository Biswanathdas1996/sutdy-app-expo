const pool = require('./config/database');

async function createEnrollmentsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id VARCHAR(255) NOT NULL,
      start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expiry_date TIMESTAMP NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      ai_minutes_total INTEGER NOT NULL DEFAULT 0,
      ai_minutes_used INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, plan_id, status)
    );

    CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    CREATE INDEX IF NOT EXISTS idx_enrollments_expiry ON enrollments(expiry_date);
  `;

  try {
    await pool.query(query);
    console.log('✅ Enrollments table created successfully');
  } catch (error) {
    console.error('❌ Error creating enrollments table:', error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  createEnrollmentsTable()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createEnrollmentsTable };
