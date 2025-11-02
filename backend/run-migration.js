/**
 * Run Database Migration
 * Executes the SQL migration file to create new tables for:
 * - Badge System
 * - Lesson System
 * - SpeakEdge Social Module
 */

const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '002-add-badge-lesson-speakedge-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL statements...\n');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('📋 Tables created:');
    console.log('   • badges');
    console.log('   • user_badge_progress');
    console.log('   • badge_points_log');
    console.log('   • user_badges_unlocked');
    console.log('   • lessons');
    console.log('   • user_lesson_progress');
    console.log('   • daily_lesson_assignments');
    console.log('   • speakedge_profiles');
    console.log('   • speakedge_posts');
    console.log('   • speakedge_reactions');
    console.log('   • speakedge_comments');
    console.log('   • speakedge_partner_invites');
    console.log('   • speakedge_partners');
    console.log('   • speakedge_blocks');
    console.log('   • speakedge_account_reactions');
    console.log('   • speakedge_ad_packages');
    console.log('   • speakedge_ad_accounts');
    console.log('   • speakedge_notifications\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('📋 Error details:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
