const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Allow ALL headers and origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*', // Allow ALL headers
  credentials: true,
  exposedHeaders: ['x-auth-token', 'x-session-id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle preflight requests for all routes
app.options('*', cors());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const plansRoutes = require('./routes/plans');
const couponsRoutes = require('./routes/coupons');
const paymentsRoutes = require('./routes/payments');
const membershipRoutes = require('./routes/membership');
const installmentsRoutes = require('./routes/installments');
const subscriptionsRoutes = require('./routes/subscriptions');
const demoRoutes = require('./routes/demo');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/installments', installmentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/demo', demoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Study App API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        membershipLogin: 'POST /api/auth/membership-login'
      },
      user: {
        englishLevel: 'PUT /api/user/english-level',
        learningGoals: 'PUT /api/user/learning-goals',
        skillsFocus: 'PUT /api/user/skills-focus',
        speakingPartner: 'PUT /api/user/speaking-partner',
        profileWithMemberships: 'GET /api/user/profile-with-memberships'
      },
      plans: 'GET /api/plans',
      coupons: {
        validate: 'POST /api/coupons/validate'
      },
      payments: {
        process: 'POST /api/payments/process',
        status: 'GET /api/payments/:paymentId/status'
      },
      membership: {
        register: 'POST /api/membership/register'
      },
      installments: {
        createOrder: 'POST /api/installments/create-order',
        verifyFirst: 'POST /api/installments/verify-first',
        createSecondOrder: 'POST /api/installments/create-second-order',
        verifySecond: 'POST /api/installments/verify-second',
        pending: 'GET /api/installments/pending/:userId',
        history: 'GET /api/installments/history/:userId'
      },
      subscriptions: {
        create: 'POST /api/subscriptions/create',
        enableAutoPay: 'POST /api/subscriptions/:id/enable-autopay',
        disableAutoPay: 'POST /api/subscriptions/:id/disable-autopay',
        cancel: 'POST /api/subscriptions/:id/cancel',
        userSubscriptions: 'GET /api/subscriptions/user/:userId',
        webhook: 'POST /api/subscriptions/webhook',
        upcoming: 'GET /api/subscriptions/upcoming/:days'
      },
      demo: {
        slots: 'GET /api/demo/slots',
        book: 'POST /api/demo/book',
        cancel: 'POST /api/demo/:bookingId/cancel',
        reschedule: 'POST /api/demo/:bookingId/reschedule',
        userBookings: 'GET /api/demo/user/:userId',
        complete: 'POST /api/demo/:bookingId/complete',
        upcoming: 'GET /api/demo/upcoming'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

module.exports = app;
