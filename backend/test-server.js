// Minimal test server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./database');
    const plans = await db.getAllPlans();
    res.json({
      success: true,
      message: 'Database connection works',
      plansCount: plans.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Import and use one route at a time to find the issue
try {
  console.log('Loading plans route...');
  const plansRoutes = require('./routes/plans');
  app.use('/api/plans', plansRoutes);
  console.log('✅ Plans route loaded');
} catch (err) {
  console.error('❌ Error loading plans route:', err.message);
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Keep the process alive
setInterval(() => {
  console.log('Server still running... connected clients:', server.address());
}, 5000);
