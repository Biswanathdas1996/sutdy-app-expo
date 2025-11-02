const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function addCorePlans() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to add Core and Kids course plans...\n');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'config', 'add-core-kids-plans.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Successfully added Core and Kids course plans!\n');
    
    // Display all plans
    const result = await client.query(`
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
          WHEN 'starter' THEN 5
          ELSE 6
        END,
        price
    `);
    
    console.log('\n📊 All Plans in Database:');
    console.log('='.repeat(100));
    
    let currentType = '';
    result.rows.forEach(plan => {
      if (plan.plan_type !== currentType) {
        currentType = plan.plan_type;
        console.log(`\n${currentType.toUpperCase()} PLANS:`);
        console.log('-'.repeat(100));
      }
      
      const popular = plan.is_popular ? '⭐ POPULAR' : '';
      const badges = popular || '';
      
      console.log(`  ${plan.id}. ${plan.name.padEnd(25)} | ₹${plan.price.toString().padStart(6)} | ${plan.validity_months}mo | ${plan.ai_minutes}min | ${badges}`);
    });
    
    console.log('\n='.repeat(100));
    console.log(`\n✨ Total Plans: ${result.rows.length}`);
    
    // Group by type
    const groupedCounts = result.rows.reduce((acc, plan) => {
      acc[plan.plan_type] = (acc[plan.plan_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Plans by Type:');
    Object.entries(groupedCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} plans`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding plans:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addCorePlans()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
