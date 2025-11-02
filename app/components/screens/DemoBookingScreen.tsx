import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { API_URL } from '../../constants/Api';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  hour: number;
  available: boolean;
  capacity: number;
  booked: number;
}

interface DemoBookingScreenProps {
  userId: number;
  onSuccess: (booking: any) => void;
  onCancel: () => void;
}

export default function DemoBookingScreen({ userId, onSuccess, onCancel }: DemoBookingScreenProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);

  useEffect(() => {
    loadUserBookings();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadSlots(today);
  }, []);

  const loadUserBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/demo/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUserBookings(data.data.bookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadSlots = async (date: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/demo/slots?date=${date}`);
      const data = await response.json();

      if (data.success) {
        setAvailableSlots(data.data.slots);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
    setSelectedSlot(null);
    loadSlots(date.dateString);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
  };

  const bookDemoClass = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    Alert.prompt(
      'Contact Information',
      'Please enter your mobile number',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Book',
          onPress: async (mobile?: string) => {
            if (!mobile || mobile.length < 10) {
              Alert.alert('Error', 'Please enter a valid mobile number');
              return;
            }

            try {
              setBookingLoading(true);

              const response = await fetch(`${API_URL}/demo/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  slotId: selectedSlot.id,
                  mobile,
                }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert(
                  'Success!',
                  `Demo class booked for ${selectedSlot.date} at ${selectedSlot.time}\n\nYou will receive a confirmation SMS shortly.`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        loadUserBookings();
                        onSuccess(data.booking);
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', data.message || 'Failed to book demo class');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to book demo class');
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'phone-pad'
    );
  };

  const cancelBooking = async (bookingId: number) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this demo class?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/demo/${bookingId}/cancel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (data.success) {
              Alert.alert('Success', 'Booking cancelled successfully');
              loadUserBookings();
            } else {
              Alert.alert('Error', data.message || 'Failed to cancel booking');
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to cancel booking');
          }
        },
      },
    ]);
  };

  const rescheduleBooking = async (bookingId: number) => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a new time slot first');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/demo/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newSlotId: selectedSlot.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Demo class rescheduled successfully');
        loadUserBookings();
        setSelectedSlot(null);
      } else {
        Alert.alert('Error', data.message || 'Failed to reschedule booking');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reschedule booking');
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#3B82F6',
      };
    }

    // Mark dates with bookings
    userBookings.forEach((booking) => {
      const date = booking.scheduled_at.split('T')[0];
      marked[date] = {
        ...marked[date],
        marked: true,
        dotColor: booking.status === 'confirmed' ? '#10b981' : '#ef4444',
      };
    });

    return marked;
  };

  const upcomingBooking = userBookings.find(
    (b) => b.status === 'confirmed' && new Date(b.scheduled_at) > new Date()
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Book Free Demo Class</Text>
        <Text style={styles.subtitle}>
          Experience our teaching method with a free 1-on-1 demo session
        </Text>
      </View>

      {/* Upcoming Booking */}
      {upcomingBooking && (
        <View style={styles.upcomingCard}>
          <Text style={styles.upcomingTitle}>Your Upcoming Demo</Text>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingDate}>
              📅 {new Date(upcomingBooking.scheduled_at).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.upcomingTime}>
              🕐 {new Date(upcomingBooking.scheduled_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.upcomingActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelBooking(upcomingBooking.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => Alert.alert('Meeting Link', upcomingBooking.meeting_link || 'Link will be shared via SMS')}
            >
              <Text style={styles.joinButtonText}>Join Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Calendar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select Date</Text>
        <Calendar
          current={selectedDate}
          minDate={new Date().toISOString().split('T')[0]}
          maxDate={
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
          onDayPress={handleDateSelect}
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: '#3B82F6',
            selectedDayBackgroundColor: '#3B82F6',
            selectedDayTextColor: '#ffffff',
            arrowColor: '#3B82F6',
          }}
        />
      </View>

      {/* Time Slots */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Available Slots - {new Date(selectedDate).toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : availableSlots.length === 0 ? (
          <Text style={styles.noSlots}>No slots available for this date</Text>
        ) : (
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotButton,
                  !slot.available && styles.slotButtonDisabled,
                  selectedSlot?.id === slot.id && styles.slotButtonSelected,
                ]}
                onPress={() => handleSlotSelect(slot)}
                disabled={!slot.available}
              >
                <Text
                  style={[
                    styles.slotTime,
                    !slot.available && styles.slotTimeDisabled,
                    selectedSlot?.id === slot.id && styles.slotTimeSelected,
                  ]}
                >
                  {slot.time}
                </Text>
                {!slot.available && (
                  <Text style={styles.slotFull}>Full</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>What to Expect</Text>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>1-on-1 session with expert trainer</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>Level assessment & personalized plan</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>✅</Text>
          <Text style={styles.benefitText}>No cost, no commitment required</Text>
        </View>
      </View>

      {/* Book Button */}
      {selectedSlot && (
        <TouchableOpacity
          style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]}
          onPress={bookDemoClass}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              Book Demo - {selectedSlot.date} at {selectedSlot.time}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={onCancel}>
        <Text style={styles.backButtonText}>Back to Plans</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  upcomingCard: {
    backgroundColor: '#d1fae5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 12,
  },
  upcomingInfo: {
    marginBottom: 12,
  },
  upcomingDate: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 14,
    color: '#047857',
  },
  upcomingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  loader: {
    marginVertical: 32,
  },
  noSlots: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    paddingVertical: 24,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    width: '30%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  slotButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  slotButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3B82F6',
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  slotTimeDisabled: {
    color: '#9ca3af',
  },
  slotTimeSelected: {
    color: '#3B82F6',
  },
  slotFull: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 4,
  },
  benefitsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#4b5563',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
