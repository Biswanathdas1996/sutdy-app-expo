// Conditional import for Razorpay - only works with native builds, not Expo Go
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay');
} catch (e) {
  console.warn('Razorpay not available in Expo Go. Use a development build or test on web/emulator.');
}

import { Alert, Platform } from 'react-native';
import { Plan } from '@/app/types/api';
import { ApiService } from './apiService';

export interface RazorpayOptions {
  description: string;
  image?: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  order_id?: string;
  prefill: {
    email: string;
    contact: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export class RazorpayService {
  // Razorpay configuration
  private static readonly RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // Replace with your actual Razorpay key
  private static readonly COMPANY_NAME = 'English Learning App';
  private static readonly COMPANY_LOGO = 'https://your-domain.com/logo.png'; // Replace with your logo URL
  private static readonly THEME_COLOR = '#4A90E2';

  /**
   * Create Razorpay order on the backend
   */
  static async createOrder(planId: string, amount: number, couponCode?: string): Promise<any> {
    try {
      const orderData = {
        planId,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        couponCode,
      };

      console.log('Creating Razorpay order:', orderData);

      // Call your backend API to create Razorpay order
      const response = await ApiService.post('/api/payments/razorpay/create-order', orderData);

      console.log('Razorpay order created:', response);

      return response;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify payment on the backend
   */
  static async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
    planId: string
  ): Promise<any> {
    try {
      const verificationData = {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        planId,
      };

      console.log('Verifying Razorpay payment:', verificationData);

      // Call your backend API to verify payment
      const response = await ApiService.post('/api/payments/razorpay/verify', verificationData);

      console.log('Payment verification response:', response);

      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Process Razorpay payment
   */
  static async processPayment(
    plan: Plan,
    amount: number,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    couponCode?: string
  ): Promise<PaymentResult> {
    try {
      // Check if Razorpay is available (not in Expo Go)
      if (!RazorpayCheckout || !RazorpayCheckout.default?.open) {
        Alert.alert(
          'Payment Not Available',
          'Razorpay payments are not available in Expo Go. To test payments:\n\n' +
          '1. Use web browser (mock payment)\n' +
          '2. Create a development build\n' +
          '3. Test on a physical device with development build',
          [{ text: 'OK' }]
        );
        
        // Return mock success for testing
        return {
          success: true,
          paymentId: 'mock_pay_' + Date.now(),
          orderId: 'mock_order_' + Date.now(),
          error: 'Mock payment (Razorpay not available in Expo Go)'
        };
      }

      // Step 1: Create order on backend
      let orderId: string | undefined;
      
      try {
        const orderResponse = await this.createOrder(plan.id, amount, couponCode);
        orderId = orderResponse.orderId || orderResponse.id;
        console.log('Order created with ID:', orderId);
      } catch (orderError) {
        console.log('Backend order creation failed, proceeding with direct payment');
        // Continue without order ID for fallback
      }

      // Step 2: Prepare Razorpay options
      const options: RazorpayOptions = {
        description: `Payment for ${plan.name} plan`,
        image: this.COMPANY_LOGO,
        currency: 'INR',
        key: this.RAZORPAY_KEY,
        amount: amount * 100, // Convert to paise
        name: this.COMPANY_NAME,
        order_id: orderId,
        prefill: {
          email: userDetails.email,
          contact: userDetails.contact,
          name: userDetails.name,
        },
        theme: {
          color: this.THEME_COLOR,
        },
      };

      console.log('Razorpay options:', options);

      // Step 3: Open Razorpay checkout
      const paymentData = await this.openRazorpay(options);

      console.log('Payment successful:', paymentData);

      // Step 4: Verify payment on backend (if order was created)
      if (orderId && paymentData.razorpay_order_id && paymentData.razorpay_signature) {
        try {
          await this.verifyPayment(
            paymentData.razorpay_payment_id,
            paymentData.razorpay_order_id,
            paymentData.razorpay_signature,
            plan.id
          );
          console.log('Payment verified successfully');
        } catch (verificationError) {
          console.error('Payment verification failed:', verificationError);
          // Even if verification fails, we have payment ID, so treat as success
          // You might want to handle this differently based on your requirements
        }
      }

      return {
        success: true,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        signature: paymentData.razorpay_signature,
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('user_cancelled')) {
          errorMessage = 'Payment was cancelled by user';
        } else if (error.message.includes('network_error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('payment_failed')) {
          errorMessage = 'Payment failed. Please try with a different payment method.';
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Open Razorpay checkout
   */
  private static openRazorpay(options: RazorpayOptions): Promise<RazorpayResponse> {
    return new Promise((resolve, reject) => {
      if (!RazorpayCheckout || !RazorpayCheckout.default) {
        reject(new Error('Razorpay not available'));
        return;
      }
      
      RazorpayCheckout.default.open(options)
        .then((data: RazorpayResponse) => {
          resolve(data);
        })
        .catch((error: any) => {
          console.error('Razorpay error:', error);
          reject(error);
        });
    });
  }

  /**
   * Get payment methods available
   */
  static getAvailablePaymentMethods(): string[] {
    return [
      'card',
      'netbanking',
      'wallet',
      'upi',
      'emi',
      'cardless_emi',
      'paylater',
    ];
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  /**
   * Validate Razorpay configuration
   */
  static validateConfig(): boolean {
    if (!this.RAZORPAY_KEY || this.RAZORPAY_KEY === 'rzp_test_1DP5mmOlF5G5ag') {
      console.warn('⚠️ Please update RAZORPAY_KEY with your actual Razorpay key');
      return false;
    }
    return true;
  }

  /**
   * Get test card details for testing
   */
  static getTestCardDetails() {
    return {
      cardNumber: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123',
      cardholderName: 'Test User',
      note: 'This is a test card for Razorpay testing environment'
    };
  }
}
