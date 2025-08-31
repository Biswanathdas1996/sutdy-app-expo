// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  method?: string;
  endpoint?: string;
  payload?: any;
  responseTime?: number;
  timestamp?: string;
  data?: T;
}

// Auth Types
export interface User {
  id?: string;
  userId: string;
  userName: string;
  name?: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  age?: string;
  gender?: string;
  country?: string;
  englishSkills?: string[];
  highestQualification?: string;
  speakingPartnerInterest?: string;
  aboutYou?: string;
  profilePhotoBase64?: string;
  isNewUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestResult {
  authToken: string;
  sessionId: string;
  isNewUser: boolean;
  userId: string;
  userName: string;
}

export interface AuthResponse extends ApiResponse {
  testResult?: TestResult;
  user?: User;
  token?: string;
}

export interface RegisterRequest {
  fullName: string;
  mobileNumber: string;
}

export interface LoginRequest {
  fullName: string;
  mobileNumber: string;
}

export interface OTPLoginRequest {
  mobileNumber: string;
  otp: string;
}

// User Profile Update Types
export interface EnglishLevelUpdateRequest {
  sessionId: string;
  englishLevel: string;
}

export interface EnglishLevelUpdateResponse extends ApiResponse {
  sessionId?: string;
  englishLevel?: string;
}

export interface LearningGoalsUpdateRequest {
  sessionId: string;
  learningGoals: string[];
}

export interface LearningGoalsUpdateResponse extends ApiResponse {
  sessionId?: string;
  learningGoals?: string[];
}

export interface SkillsFocusUpdateRequest {
  sessionId: string;
  skillsFocus: string[];
}

export interface SkillsFocusUpdateResponse extends ApiResponse {
  sessionId?: string;
  skillsFocus?: string[];
}

export interface SpeakingPartnerUpdateRequest {
  sessionId: string;
  needsSpeakingPartner: boolean;
}

export interface SpeakingPartnerUpdateResponse extends ApiResponse {
  sessionId?: string;
  needsSpeakingPartner?: boolean;
}

// Plans Types
export interface PlanFeature {
  id: string;
  name: string;
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  duration: number;
  cost: string;
  isActive: boolean;
  features: PlanFeature[];
  subPlans: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse extends ApiResponse {
  plans: Plan[];
  totalPlans: number;
  testMetadata?: {
    method: string;
    endpoint: string;
    payload: any;
    responseTime: number;
    timestamp: string;
    statusCode: number;
    statusText: string;
  };
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  description?: string;
}

export interface CouponValidationRequest {
  couponCode: string;
  planId: string;
  amount: number;
}

export interface CouponValidationResponse extends ApiResponse {
  coupon?: Coupon;
  isValid: boolean;
  discountAmount?: number;
  finalAmount?: number;
}

// Payment Types
export interface PaymentRequest {
  planId: string;
  amount: number;
  couponCode?: string;
  paymentMethod: "razorpay" | "stripe" | "paytm" | "other";
}

export interface PaymentResponse extends ApiResponse {
  paymentId: string;
  orderId?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  paymentUrl?: string;
}

// Storage Types
export interface UserSession {
  user: User;
  authToken: string;
  sessionId: string;
  userId: string;
  userName: string;
  isNewUser: boolean;
  expiresAt: number;
  createdAt: number;
}
