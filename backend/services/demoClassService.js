const pool = require('../config/database');

class DemoClassService {
  constructor() {
  }

  /**
   * Get available demo class time slots
   */
  async getAvailableSlots(date = null) {
    try {
      const targetDate = date ? new Date(date) : new Date();
      
      // Generate time slots (9 AM to 6 PM, 1-hour slots)
      const slots = [];
      const startHour = 9;
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        const slotDate = new Date(targetDate);
        slotDate.setHours(hour, 0, 0, 0);

        // Skip past slots
        if (slotDate < new Date()) continue;

        slots.push({
          id: `slot_${slotDate.getTime()}`,
          date: slotDate.toISOString().split('T')[0],
          time: `${hour}:00 - ${hour + 1}:00`,
          hour,
          available: true,
          capacity: 5,
          booked: 0
        });
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Book demo class
   */
  async bookDemoClass(userId, slotId, contactInfo) {
    
    
    try {
      // Extract slot info from slotId
      const timestamp = parseInt(slotId.replace('slot_', ''));
      const slotDate = new Date(timestamp);

      // Check if user already has a demo class booked
      const existingBooking = await pool.query(
        `SELECT * FROM demo_bookings 
        WHERE user_id = $1 AND status != 'cancelled' AND scheduled_at > CURRENT_TIMESTAMP`,
        [userId]
      );

      if (existingBooking.rows.length > 0) {
        throw new Error('You already have a demo class booked');
      }

      // Create booking
      const result = await pool.query(
        `INSERT INTO demo_bookings 
        (user_id, scheduled_at, contact_mobile, contact_email, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          userId,
          slotDate,
          contactInfo.mobile,
          contactInfo.email || null,
          'confirmed'
        ]
      );

      const booking = result.rows[0];

      // Send confirmation (TODO: implement notification)
      await this.sendBookingConfirmation(booking);

      return {
        success: true,
        booking: {
          id: booking.id,
          scheduledAt: booking.scheduled_at,
          status: booking.status,
          meetingLink: this.generateMeetingLink(booking.id)
        }
      };
    } catch (error) {
      console.error('Error booking demo class:', error);
      throw error;
    }
  }

  /**
   * Cancel demo class booking
   */
  async cancelBooking(bookingId, userId) {
    
    
    try {
      const result = await pool.query(
        `UPDATE demo_bookings 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND status = 'confirmed'
        RETURNING *`,
        [bookingId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Booking not found or already cancelled');
      }

      return {
        success: true,
        message: 'Demo class cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Reschedule demo class
   */
  async rescheduleBooking(bookingId, userId, newSlotId) {
    
    
    try {
      const timestamp = parseInt(newSlotId.replace('slot_', ''));
      const newSlotDate = new Date(timestamp);

      const result = await pool.query(
        `UPDATE demo_bookings 
        SET scheduled_at = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3 AND status = 'confirmed'
        RETURNING *`,
        [newSlotDate, bookingId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Booking not found or cannot be rescheduled');
      }

      const booking = result.rows[0];

      return {
        success: true,
        message: 'Demo class rescheduled successfully',
        booking: {
          id: booking.id,
          scheduledAt: booking.scheduled_at,
          status: booking.status
        }
      };
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw error;
    }
  }

  /**
   * Get user's demo class bookings
   */
  async getUserBookings(userId) {
    
    
    try {
      const result = await pool.query(
        `SELECT 
          id,
          scheduled_at,
          contact_mobile,
          contact_email,
          status,
          created_at
        FROM demo_bookings
        WHERE user_id = $1
        ORDER BY scheduled_at DESC`,
        [userId]
      );

      const bookings = result.rows.map(booking => ({
        ...booking,
        meetingLink: booking.status === 'confirmed' ? 
          this.generateMeetingLink(booking.id) : null
      }));

      return bookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  /**
   * Mark demo class as completed
   */
  async markCompleted(bookingId) {
    
    
    try {
      await pool.query(
        `UPDATE demo_bookings 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [bookingId]
      );

      return {
        success: true,
        message: 'Demo class marked as completed'
      };
    } catch (error) {
      console.error('Error marking completed:', error);
      throw error;
    }
  }

  /**
   * Generate meeting link (placeholder - integrate with Zoom/Google Meet/etc.)
   */
  generateMeetingLink(bookingId) {
    // TODO: Integrate with actual video conferencing service
    return `https://meet.speakedge.com/demo/${bookingId}`;
  }

  /**
   * Send booking confirmation (placeholder)
   */
  async sendBookingConfirmation(booking) {
    // TODO: Implement SMS/Email notification
    console.log('Booking confirmation sent for:', booking.id);
    return true;
  }

  /**
   * Get upcoming demo classes (for admin/instructor)
   */
  async getUpcomingClasses(date = null) {
    
    
    try {
      const targetDate = date ? new Date(date) : new Date();
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 7); // Next 7 days

      const result = await pool.query(
        `SELECT 
          db.*,
          u.name as user_name,
          u.mobile as user_mobile
        FROM demo_bookings db
        JOIN users u ON db.user_id = u.id
        WHERE db.scheduled_at >= $1 
          AND db.scheduled_at <= $2
          AND db.status = 'confirmed'
        ORDER BY db.scheduled_at ASC`,
        [targetDate, endDate]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting upcoming classes:', error);
      throw error;
    }
  }
}

module.exports = DemoClassService;
