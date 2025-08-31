declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: number;
    name: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      backdropclose?: boolean;
      escape?: boolean;
      handleback?: boolean;
    };
    notes?: { [key: string]: string };
    send_sms_hash?: boolean;
    allow_rotation?: boolean;
    orientation?: number;
    bar_label?: string;
  }

  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  export interface RazorpayError {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: any;
  }

  export default class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<RazorpayResponse>;
  }
}
