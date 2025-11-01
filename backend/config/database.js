const { Pool } = require('pg');

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_nf7oerVRlF4N@ep-purple-band-a8v4t174-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
