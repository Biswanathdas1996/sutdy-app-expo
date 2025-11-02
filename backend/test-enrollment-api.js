const express = require('express');
const app = express();
const pool = require('./config/database');

// Test the enrollment endpoint directly
async function testEnrollmentAPI() {
  try {
    console.log('\n🧪 Testing Enrollment API\n');

    // Get all users with enrollments
    const query = `
      SELECT 
        u.id as user_id,
        u.name,
        u.mobile,
        e.id as enrollment_id,
        e.plan_id,
        e.status,
        e.expiry_date,
        p.name as plan_name
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id AND e.status = 'active' AND e.expiry_date > NOW()
      LEFT JOIN plans p ON e.plan_id = p.id::text
      ORDER BY u.created_at DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    
    console.log('📊 Users and their enrollments:\n');
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. User: ${row.name} (ID: ${row.user_id}, Mobile: ${row.mobile})`);
      if (row.enrollment_id) {
        console.log(`   ✅ Has active enrollment: ${row.plan_name} (Plan ID: ${row.plan_id})`);
        console.log(`   📅 Expires: ${row.expiry_date.toLocaleDateString()}`);
      } else {
        console.log(`   ❌ No active enrollment`);
      }
      console.log('');
    });

    // Test specific user enrollment query (user 47 who has enrollment)
    console.log('\n🔍 Testing enrollment query for user 47:\n');
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
    `, [47]);

    if (userEnrollment.rows.length > 0) {
      console.log('✅ Enrollment found:');
      console.log(JSON.stringify(userEnrollment.rows[0], null, 2));
    } else {
      console.log('❌ No enrollment found');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testEnrollmentAPI();
