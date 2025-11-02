const pool = require('./config/database');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table columns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Also check a sample user
    const sample = await pool.query('SELECT * FROM users LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('\n👤 Sample user data:');
      console.log(sample.rows[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
