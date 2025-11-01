const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('📦 Tables created: users, sessions, plans, coupons, payments, memberships');
    console.log('💰 Default plans inserted: Basic (₹499), Pro (₹1299), Premium (₹2299)');
    console.log('🎟️  Default coupons inserted: WELCOME50 (50% off), SAVE100 (₹100 off)');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✅ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
