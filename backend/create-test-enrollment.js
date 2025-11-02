const pool = require('./config/database');

async function createTestEnrollment() {
  try {
    console.log('\n🧪 Creating test enrollment for user 45 or 46\n');

    // Check which user doesn't have enrollment
    const users = await pool.query('SELECT id, name, mobile FROM users WHERE id IN (45, 46) ORDER BY id');
    
    console.log('Available users:');
    users.rows.forEach(u => console.log(`  - User ${u.id}: ${u.name} (${u.mobile})`));

    // Get a plan
    const plans = await pool.query('SELECT * FROM plans LIMIT 1');
    const plan = plans.rows[0];
    
    console.log(`\nSelected plan: ${plan.name} (ID: ${plan.id})`);

    // Create enrollment for user 45
    const userId = 45;
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (plan.validity_months || 1));

    const result = await pool.query(`
      INSERT INTO enrollments (
        user_id, plan_id, start_date, expiry_date, status, 
        ai_minutes_total, ai_minutes_used, created_at
      ) VALUES ($1, $2, $3, $4, 'active', $5, 0, NOW())
      RETURNING *
    `, [
      userId,
      plan.id.toString(),
      startDate,
      expiryDate,
      plan.ai_minutes || 0
    ]);

    console.log('\n✅ Enrollment created:');
    console.log(`   User: ${userId}`);
    console.log(`   Plan: ${plan.name}`);
    console.log(`   Expires: ${result.rows[0].expiry_date.toLocaleDateString()}`);
    console.log(`   AI Minutes: ${result.rows[0].ai_minutes_total}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestEnrollment();
