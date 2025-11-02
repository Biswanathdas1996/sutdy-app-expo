/**
 * Comprehensive Test Suite for Phase 1.5 Week 2 Features
 * Run with: node backend/test-week2-features.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 1;
const TEST_PLAN_ID_PROFESSIONAL = 2; // Professional plan
const TEST_PLAN_ID_FREEDOM = 3; // Freedom plan

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  total: 0,
};

async function test(name, fn) {
  results.total++;
  log.test(`Testing: ${name}`);
  
  try {
    await fn();
    results.passed++;
    log.success(`PASSED: ${name}\n`);
  } catch (error) {
    results.failed++;
    log.error(`FAILED: ${name}`);
    console.error(`   Error: ${error.message}\n`);
  }
}

// ============================================
// INSTALLMENT PAYMENT TESTS
// ============================================

async function testInstallmentPayments() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   INSTALLMENT PAYMENT TESTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  let installmentId = null;

  await test('Create first installment order', async () => {
    const response = await axios.post(`${API_URL}/installments/create-order`, {
      userId: TEST_USER_ID,
      planId: TEST_PLAN_ID_PROFESSIONAL,
    });

    if (!response.data.success) throw new Error('Failed to create order');
    if (!response.data.order) throw new Error('No order returned');
    if (response.data.order.amount !== 129900) throw new Error('First installment amount should be ₹1,299 (129900 paise)');

    log.info(`First installment order created: ₹${response.data.order.amount / 100}`);
  });

  await test('Get pending installments', async () => {
    const response = await axios.get(`${API_URL}/installments/pending/${TEST_USER_ID}`);

    if (!response.data.success) throw new Error('Failed to get pending installments');
    
    log.info(`Pending installments: ${response.data.data.count}`);
  });

  await test('Get installment history', async () => {
    const response = await axios.get(`${API_URL}/installments/history/${TEST_USER_ID}`);

    if (!response.data.success) throw new Error('Failed to get history');
    
    log.info(`Total installments in history: ${response.data.data.count}`);
  });
}

// ============================================
// SUBSCRIPTION TESTS
// ============================================

async function testSubscriptions() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   SUBSCRIPTION TESTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  let subscriptionId = null;

  await test('Create subscription', async () => {
    const response = await axios.post(`${API_URL}/subscriptions/create`, {
      userId: TEST_USER_ID,
      planId: TEST_PLAN_ID_FREEDOM,
      enableAutoPay: false,
    });

    if (!response.data.success) throw new Error('Failed to create subscription');
    if (!response.data.data.subscription) throw new Error('No subscription returned');

    subscriptionId = response.data.data.subscription.id;
    log.info(`Subscription created with ID: ${subscriptionId}`);
  });

  await test('Get user subscriptions', async () => {
    const response = await axios.get(`${API_URL}/subscriptions/user/${TEST_USER_ID}`);

    if (!response.data.success) throw new Error('Failed to get subscriptions');
    if (response.data.data.count === 0) throw new Error('No subscriptions found');

    log.info(`User has ${response.data.data.count} subscription(s)`);
  });

  if (subscriptionId) {
    await test('Enable auto-pay', async () => {
      const response = await axios.post(
        `${API_URL}/subscriptions/${subscriptionId}/enable-autopay`,
        { userId: TEST_USER_ID }
      );

      if (!response.data.success) throw new Error('Failed to enable auto-pay');

      log.info('Auto-pay enabled successfully');
    });

    await test('Disable auto-pay', async () => {
      const response = await axios.post(
        `${API_URL}/subscriptions/${subscriptionId}/disable-autopay`,
        { userId: TEST_USER_ID }
      );

      if (!response.data.success) throw new Error('Failed to disable auto-pay');

      log.info('Auto-pay disabled successfully');
    });
  }

  await test('Get upcoming renewals', async () => {
    const response = await axios.get(`${API_URL}/subscriptions/upcoming/7`);

    if (!response.data.success) throw new Error('Failed to get upcoming renewals');

    log.info(`Subscriptions renewing in next 7 days: ${response.data.data.count}`);
  });
}

// ============================================
// DEMO CLASS TESTS
// ============================================

async function testDemoClasses() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   DEMO CLASS BOOKING TESTS${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  let bookingId = null;
  let slotId = null;
  const testDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 2 days from now

  await test('Get available demo slots', async () => {
    const response = await axios.get(`${API_URL}/demo/slots?date=${testDate}`);

    if (!response.data.success) throw new Error('Failed to get slots');
    if (response.data.data.slots.length === 0) throw new Error('No slots available');

    slotId = response.data.data.slots[0].id;
    log.info(`Available slots for ${testDate}: ${response.data.data.count}`);
    log.info(`First slot: ${response.data.data.slots[0].time}`);
  });

  await test('Book demo class', async () => {
    const response = await axios.post(`${API_URL}/demo/book`, {
      userId: TEST_USER_ID,
      slotId: slotId,
      mobile: '9876543210',
      email: 'test@example.com',
    });

    if (!response.data.success) throw new Error('Failed to book demo');
    if (!response.data.booking) throw new Error('No booking returned');

    bookingId = response.data.booking.id;
    log.info(`Demo class booked with ID: ${bookingId}`);
  });

  await test('Get user bookings', async () => {
    const response = await axios.get(`${API_URL}/demo/user/${TEST_USER_ID}`);

    if (!response.data.success) throw new Error('Failed to get bookings');
    if (response.data.data.count === 0) throw new Error('No bookings found');

    log.info(`User has ${response.data.data.count} booking(s)`);
  });

  await test('Get upcoming demo classes', async () => {
    const response = await axios.get(`${API_URL}/demo/upcoming`);

    if (!response.data.success) throw new Error('Failed to get upcoming classes');

    log.info(`Upcoming demo classes: ${response.data.data.count}`);
  });

  if (bookingId) {
    await test('Cancel demo booking', async () => {
      const response = await axios.post(
        `${API_URL}/demo/${bookingId}/cancel`,
        { userId: TEST_USER_ID }
      );

      if (!response.data.success) throw new Error('Failed to cancel booking');

      log.info('Demo booking cancelled successfully');
    });
  }
}

// ============================================
// DATABASE VERIFICATION
// ============================================

async function verifyDatabase() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   DATABASE VERIFICATION${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  await test('Verify demo_bookings table exists', async () => {
    const pool = require('./config/database');
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'demo_bookings'"
    );
    
    if (result.rows.length === 0) throw new Error('Table does not exist');
    
    log.info('demo_bookings table exists ✓');
  });

  await test('Verify payment_installments table exists', async () => {
    const pool = require('./config/database');
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'payment_installments'"
    );
    
    if (result.rows.length === 0) throw new Error('Table does not exist');
    
    log.info('payment_installments table exists ✓');
  });

  await test('Verify subscriptions table exists', async () => {
    const pool = require('./config/database');
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'subscriptions'"
    );
    
    if (result.rows.length === 0) throw new Error('Table does not exist');
    
    log.info('subscriptions table exists ✓');
  });
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log(`\n${colors.blue}╔═══════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   PHASE 1.5 WEEK 2 - TEST SUITE          ║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════╝${colors.reset}\n`);

  log.info('Starting comprehensive test suite...\n');

  // Check if server is running
  try {
    await axios.get(`${API_URL.replace('/api', '')}/api/health`);
    log.success('Server is running!\n');
  } catch (error) {
    log.error('Server is not running! Please start the backend server first.');
    log.info('Run: cd backend && npm start\n');
    process.exit(1);
  }

  // Run test suites
  await verifyDatabase();
  await testInstallmentPayments();
  await testSubscriptions();
  await testDemoClasses();

  // Print summary
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}   TEST SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${percentage}%\n`);

  if (results.failed === 0) {
    log.success('ALL TESTS PASSED! 🎉\n');
    process.exit(0);
  } else {
    log.warn(`${results.failed} test(s) failed. Please review the errors above.\n`);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run tests
runAllTests();
