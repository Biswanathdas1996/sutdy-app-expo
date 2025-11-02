const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Running Phase 1.5 database migration...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'config', 'schema-update-phase-1.5.sql'),
      'utf8'
    );

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Changes made:');
    console.log('  - Extended plans table with new columns');
    console.log('  - Created payment_installments table');
    console.log('  - Created subscriptions table');
    console.log('  - Added Freedom Plan variants (Basic, Growth, Intensive)');
    console.log('  - Added Professional English Plan');
    console.log('  - Added Starter Plan with 75% discount');
    console.log('  - Updated existing plans with new fields\n');

    // Verify the changes
    const plansResult = await pool.query('SELECT name, price, plan_type, category FROM plans ORDER BY price');
    console.log('📋 Current plans in database:');
    console.table(plansResult.rows);

    // Check table structures
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📁 Database tables:');
    console.log(tablesResult.rows.map(r => `  - ${r.table_name}`).join('\n'));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
