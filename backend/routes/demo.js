const express = require('express');
const router = express.Router();
const DemoClassService = require('../services/demoClassService');

const demoClassService = new DemoClassService();

/**
 * Get available demo class slots
 * GET /api/demo/slots?date=YYYY-MM-DD
 */
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    const slots = await demoClassService.getAvailableSlots(date);

    res.json({
      success: true,
      data: {
        slots,
        count: slots.length,
        date: date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error getting demo slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

/**
 * Book demo class
 * POST /api/demo/book
 */
router.post('/book', async (req, res) => {
  try {
    const { userId, slotId, mobile, email } = req.body;

    if (!userId || !slotId || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'User ID, slot ID, and mobile number are required'
      });
    }

    const result = await demoClassService.bookDemoClass(
      userId,
      slotId,
      { mobile, email }
    );

    res.json(result);
  } catch (error) {
    console.error('Error booking demo class:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book demo class',
      error: error.message
    });
  }
});

/**
 * Cancel demo class booking
 * POST /api/demo/:bookingId/cancel
 */
router.post('/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await demoClassService.cancelBooking(bookingId, userId);

    res.json(result);
  } catch (error) {
    console.error('Error cancelling demo class:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
      error: error.message
    });
  }
});

/**
 * Reschedule demo class
 * POST /api/demo/:bookingId/reschedule
 */
router.post('/:bookingId/reschedule', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId, newSlotId } = req.body;

    if (!userId || !newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new slot ID are required'
      });
    }

    const result = await demoClassService.rescheduleBooking(
      bookingId,
      userId,
      newSlotId
    );

    res.json(result);
  } catch (error) {
    console.error('Error rescheduling demo class:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reschedule booking',
      error: error.message
    });
  }
});

/**
 * Get user's demo class bookings
 * GET /api/demo/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await demoClassService.getUserBookings(userId);

    res.json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
});

/**
 * Mark demo class as completed (admin/instructor)
 * POST /api/demo/:bookingId/complete
 */
router.post('/:bookingId/complete', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await demoClassService.markCompleted(bookingId);

    res.json(result);
  } catch (error) {
    console.error('Error marking demo class complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as completed',
      error: error.message
    });
  }
});

/**
 * Get upcoming demo classes (admin/instructor view)
 * GET /api/demo/upcoming?date=YYYY-MM-DD
 */
router.get('/upcoming', async (req, res) => {
  try {
    const { date } = req.query;

    const classes = await demoClassService.getUpcomingClasses(date);

    res.json({
      success: true,
      data: {
        classes,
        count: classes.length
      }
    });
  } catch (error) {
    console.error('Error getting upcoming classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming classes',
      error: error.message
    });
  }
});

module.exports = router;
