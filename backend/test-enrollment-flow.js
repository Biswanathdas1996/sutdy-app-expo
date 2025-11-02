const pool = require('./config/database');

async function testEnrollmentFlow() {
  try {
    console.log('\n🧪 Testing Enrollment Flow\n');

    // 1. Check if enrollments table exists
    console.log('1️⃣ Checking enrollments table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'enrollments'
      );
    `);
    console.log('   ✅ Enrollments table exists:', tableCheck.rows[0].exists);

    // 2. Check existing enrollments
    console.log('\n2️⃣ Checking existing enrollments...');
    const enrollments = await pool.query('SELECT * FROM enrollments ORDER BY created_at DESC LIMIT 5');
    console.log(`   📋 Found ${enrollments.rows.length} enrollment(s):`);
    enrollments.rows.forEach((e, i) => {
      console.log(`   ${i + 1}. User ${e.user_id} - Plan ${e.plan_id} - Status: ${e.status}`);
      console.log(`      Start: ${e.start_date.toLocaleDateString()}, Expiry: ${e.expiry_date.toLocaleDateString()}`);
      console.log(`      AI Minutes: ${e.ai_minutes_used}/${e.ai_minutes_total}`);
    });

    // 3. Check plans table
    console.log('\n3️⃣ Checking plans table...');
    const plans = await pool.query('SELECT * FROM plans LIMIT 5');
    console.log(`   📦 Found ${plans.rows.length} plan(s):`);
    plans.rows.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (ID: ${p.id}) - ₹${p.price} - ${p.validity_months} months`);
    });

    // 4. Check users table
    console.log('\n4️⃣ Checking recent users...');
    const users = await pool.query('SELECT id, name, mobile, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log(`   👥 Found ${users.rows.length} user(s):`);
    users.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.name} (ID: ${u.id}) - ${u.mobile}`);
    });

    // 5. Test enrollment query for a specific user
    if (users.rows.length > 0) {
      const testUserId = users.rows[0].id;
      console.log(`\n5️⃣ Testing enrollment query for user ${testUserId}...`);
      
      const userEnrollment = await pool.query(`
        SELECT 
          e.*,
          p.name as plan_name,
          p.price as plan_price,
          p.plan_type,
          p.validity_months,
          p.ai_minutes as plan_ai_minutes,
          p.description as plan_description
        FROM enrollments e
        JOIN plans p ON e.plan_id = p.id::text
        WHERE e.user_id = $1 AND e.status = 'active' AND e.expiry_date > NOW()
        ORDER BY e.expiry_date DESC
        LIMIT 1
      `, [testUserId]);

      if (userEnrollment.rows.length > 0) {
        const enrollment = userEnrollment.rows[0];
        console.log('   ✅ Active enrollment found:');
        console.log(`      Plan: ${enrollment.plan_name}`);
        console.log(`      Status: ${enrollment.status}`);
        console.log(`      Expiry: ${enrollment.expiry_date.toLocaleDateString()}`);
        console.log(`      AI Minutes: ${enrollment.ai_minutes_used}/${enrollment.ai_minutes_total}`);
      } else {
        console.log('   ⚠️ No active enrollment found for this user');
      }
    }

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
  }
}

testEnrollmentFlow();
