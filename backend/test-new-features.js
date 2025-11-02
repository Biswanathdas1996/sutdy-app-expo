/**
 * Test Script for New Features
 * Tests Badge System, Lesson System, and SpeakEdge Social Module
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_KEY = 'admin123'; // Set this in your .env file

// Test user IDs (you'll need to create these users first or use existing ones)
const TEST_USER_1 = 1;
const TEST_USER_2 = 2;

console.log('🧪 Starting Feature Tests...\n');
console.log('📍 Base URL:', BASE_URL);
console.log('👤 Test User 1 ID:', TEST_USER_1);
console.log('👤 Test User 2 ID:', TEST_USER_2);
console.log('\n' + '='.repeat(60) + '\n');

// =====================================================
// BADGE SYSTEM TESTS
// =====================================================

async function testBadgeSystem() {
  console.log('🏅 TESTING BADGE SYSTEM\n');

  try {
    // Test 1: Get badge progress
    console.log('1️⃣ Getting badge progress for User 1...');
    const progressResponse = await axios.get(`${BASE_URL}/badges/progress/${TEST_USER_1}`);
    console.log('✅ Badge Progress:', JSON.stringify(progressResponse.data.data, null, 2));
    console.log('');

    // Test 2: Get all badges
    console.log('2️⃣ Getting all badges with unlock status...');
    const allBadgesResponse = await axios.get(`${BASE_URL}/badges/all/${TEST_USER_1}`);
    console.log(`✅ Found ${allBadgesResponse.data.data.length} badges`);
    allBadgesResponse.data.data.forEach(badge => {
      console.log(`   ${badge.icon} ${badge.name} - ${badge.isUnlocked ? 'UNLOCKED' : 'LOCKED'} (${badge.pointsRequired} points)`);
    });
    console.log('');

    // Test 3: Add badge points
    console.log('3️⃣ Adding 50 points to User 1 for daily lesson completion...');
    const addPointsResponse = await axios.post(`${BASE_URL}/badges/points/add`, {
      userId: TEST_USER_1,
      points: 50,
      activityType: 'daily_lesson_completion',
      adminKey: ADMIN_KEY
    });
    console.log('✅ Points Added:', JSON.stringify(addPointsResponse.data.data, null, 2));
    console.log('');

    // Test 4: Get points history
    console.log('4️⃣ Getting points history...');
    const historyResponse = await axios.get(`${BASE_URL}/badges/points/history/${TEST_USER_1}?limit=10`);
    console.log(`✅ Found ${historyResponse.data.data.length} point entries`);
    console.log('');

    // Test 5: Get leaderboard
    console.log('5️⃣ Getting badge leaderboard...');
    const leaderboardResponse = await axios.get(`${BASE_URL}/badges/leaderboard?limit=10`);
    console.log(`✅ Top ${leaderboardResponse.data.data.length} users:`);
    leaderboardResponse.data.data.forEach(user => {
      console.log(`   #${user.rank} ${user.name} - ${user.totalPoints} points (${user.badgeIcon} ${user.badgeName})`);
    });
    console.log('');

    console.log('✅ Badge System Tests Completed!\n');
  } catch (error) {
    console.error('❌ Badge System Test Failed:', error.response?.data || error.message);
  }

  console.log('='.repeat(60) + '\n');
}

// =====================================================
// LESSON SYSTEM TESTS
// =====================================================

async function testLessonSystem() {
  console.log('📖 TESTING LESSON SYSTEM\n');

  try {
    // Test 1: Create a sample lesson (admin)
    console.log('1️⃣ Creating sample A1-A2 lesson (admin)...');
    const createLessonResponse = await axios.post(`${BASE_URL}/lessons/admin/create`, {
      level: 'A1-A2',
      lessonNumber: 1,
      title: 'Introduction to Basic Greetings',
      content: 'In this lesson, you will learn how to greet people in English. Common greetings include: Hello, Hi, Good morning, Good afternoon, Good evening.',
      exercises: [
        { type: 'multiple-choice', question: 'What is a common greeting?', options: ['Hello', 'Goodbye', 'Maybe', 'Never'], correct: 0 },
        { type: 'fill-blank', question: 'Good _____ (in the early hours)', answer: 'morning' }
      ],
      adminKey: ADMIN_KEY
    });
    console.log('✅ Lesson Created:', createLessonResponse.data.data);
    console.log('');

    // Test 2: Get today's lesson
    console.log('2️⃣ Getting today\'s lesson for User 1...');
    const todayLessonResponse = await axios.get(`${BASE_URL}/lessons/today/${TEST_USER_1}`);
    console.log('✅ Today\'s Lesson:', {
      assignmentId: todayLessonResponse.data.data.assignmentId,
      viewed: todayLessonResponse.data.data.viewed,
      lessonTitle: todayLessonResponse.data.data.lesson.title,
      lessonLevel: todayLessonResponse.data.data.lesson.level
    });
    console.log('');

    const assignmentId = todayLessonResponse.data.data.assignmentId;

    // Test 3: Mark lesson as viewed
    console.log('3️⃣ Marking lesson as viewed...');
    const markViewedResponse = await axios.put(`${BASE_URL}/lessons/mark-viewed/${assignmentId}`);
    console.log('✅', markViewedResponse.data.message);
    console.log('');

    // Test 4: Complete lesson
    console.log('4️⃣ Completing lesson with score...');
    const completeLessonResponse = await axios.post(`${BASE_URL}/lessons/complete`, {
      userId: TEST_USER_1,
      lessonId: todayLessonResponse.data.data.lesson.id,
      score: 85
    });
    console.log('✅ Lesson Completed:', completeLessonResponse.data.data);
    console.log('');

    // Test 5: Get lesson progress
    console.log('5️⃣ Getting lesson progress for User 1...');
    const progressResponse = await axios.get(`${BASE_URL}/lessons/progress/${TEST_USER_1}`);
    console.log('✅ Progress:', {
      level: progressResponse.data.data.level,
      completed: `${progressResponse.data.data.completedLessons}/${progressResponse.data.data.totalLessons}`,
      progress: `${progressResponse.data.data.progressPercentage}%`,
      averageScore: progressResponse.data.data.averageScore
    });
    console.log('');

    console.log('✅ Lesson System Tests Completed!\n');
  } catch (error) {
    console.error('❌ Lesson System Test Failed:', error.response?.data || error.message);
  }

  console.log('='.repeat(60) + '\n');
}

// =====================================================
// SPEAKEDGE SYSTEM TESTS
// =====================================================

async function testSpeakEdgeSystem() {
  console.log('💬 TESTING SPEAKEDGE SOCIAL SYSTEM\n');

  try {
    // Test 1: Get/Create SpeakEdge profile
    console.log('1️⃣ Getting SpeakEdge profile for User 1...');
    const profileResponse = await axios.get(`${BASE_URL}/speakedge/profile/${TEST_USER_1}`);
    console.log('✅ Profile:', JSON.stringify(profileResponse.data.data, null, 2));
    console.log('');

    // Test 2: Create a status post
    console.log('2️⃣ Creating a status post...');
    const createPostResponse = await axios.post(`${BASE_URL}/speakedge/posts/create`, {
      userId: TEST_USER_1,
      content: 'Hello everyone! I\'m excited to practice English with you all! 🎉'
    });
    console.log('✅ Post Created:', createPostResponse.data.data);
    console.log('');

    const postId = createPostResponse.data.data.id;

    // Test 3: React to post with emoji
    console.log('3️⃣ User 2 reacting to User 1\'s post with ❤️...');
    const reactResponse = await axios.post(`${BASE_URL}/speakedge/posts/${postId}/react`, {
      userId: TEST_USER_2,
      emoji: '❤️'
    });
    console.log('✅ Reaction:', reactResponse.data.data);
    console.log('');

    // Test 4: Add a comment
    console.log('4️⃣ User 2 commenting on User 1\'s post...');
    const commentResponse = await axios.post(`${BASE_URL}/speakedge/posts/${postId}/comment`, {
      userId: TEST_USER_2,
      content: 'Welcome! Let\'s practice together!'
    });
    console.log('✅ Comment:', commentResponse.data.data);
    console.log('');

    // Test 5: Get feed
    console.log('5️⃣ Getting feed for User 1...');
    const feedResponse = await axios.get(`${BASE_URL}/speakedge/feed/${TEST_USER_1}?limit=5`);
    console.log(`✅ Feed (${feedResponse.data.data.length} posts):`);
    feedResponse.data.data.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.userName}: "${post.content.substring(0, 50)}..." (${post.reactionCount} reactions, ${post.commentCount} comments)`);
    });
    console.log('');

    // Test 6: Search for partners
    console.log('6️⃣ Searching for conversation partners...');
    const searchResponse = await axios.get(`${BASE_URL}/speakedge/partners/search/${TEST_USER_1}?limit=5`);
    console.log(`✅ Found ${searchResponse.data.data.length} potential partners`);
    console.log('');

    // Test 7: Send partner invitation
    console.log('7️⃣ User 1 sending partner invitation to User 2...');
    const inviteResponse = await axios.post(`${BASE_URL}/speakedge/partners/invite`, {
      senderId: TEST_USER_1,
      receiverId: TEST_USER_2
    });
    console.log('✅ Invitation:', inviteResponse.data.message);
    console.log('');

    const inviteId = inviteResponse.data.data.id;

    // Test 8: Respond to invitation
    console.log('8️⃣ User 2 accepting partner invitation...');
    const respondResponse = await axios.put(`${BASE_URL}/speakedge/partners/invite/${inviteId}/respond`, {
      userId: TEST_USER_2,
      status: 'accepted'
    });
    console.log('✅', respondResponse.data.message);
    console.log('');

    // Test 9: Get my partners
    console.log('9️⃣ Getting User 1\'s conversation partners...');
    const partnersResponse = await axios.get(`${BASE_URL}/speakedge/partners/my/${TEST_USER_1}`);
    console.log(`✅ Partners (${partnersResponse.data.data.length}):`);
    partnersResponse.data.data.forEach(partner => {
      console.log(`   • ${partner.name} (${partner.englishLevel}) - ${partner.speakedgeBadge}`);
    });
    console.log('');

    // Test 10: Get notifications
    console.log('🔟 Getting notifications for User 1...');
    const notifResponse = await axios.get(`${BASE_URL}/speakedge/notifications/${TEST_USER_1}?limit=5`);
    console.log(`✅ Notifications (${notifResponse.data.data.length}):`);
    notifResponse.data.data.forEach(notif => {
      console.log(`   • ${notif.content} (${notif.isRead ? 'read' : 'unread'})`);
    });
    console.log('');

    // Test 11: Get ad packages
    console.log('1️⃣1️⃣ Getting advertisement packages...');
    const packagesResponse = await axios.get(`${BASE_URL}/speakedge/ads/packages`);
    console.log(`✅ Ad Packages (${packagesResponse.data.data.length}):`);
    packagesResponse.data.data.forEach(pkg => {
      console.log(`   • ${pkg.name}: $${pkg.totalPrice} (${pkg.totalClicksIncluded} clicks @ $${pkg.pricePerClick}/click)`);
    });
    console.log('');

    console.log('✅ SpeakEdge System Tests Completed!\n');
  } catch (error) {
    console.error('❌ SpeakEdge System Test Failed:', error.response?.data || error.message);
  }

  console.log('='.repeat(60) + '\n');
}

// =====================================================
// RUN ALL TESTS
// =====================================================

async function runAllTests() {
  await testBadgeSystem();
  await testLessonSystem();
  await testSpeakEdgeSystem();

  console.log('🎉 ALL TESTS COMPLETED!\n');
  console.log('💡 Next Steps:');
  console.log('   1. Run the migration: node backend/run-migration.js');
  console.log('   2. Start the server: npm start (in backend folder)');
  console.log('   3. Create test users if needed');
  console.log('   4. Run this test again to verify all features');
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
