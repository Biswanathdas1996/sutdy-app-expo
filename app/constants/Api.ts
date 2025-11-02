import { Platform } from 'react-native';

// Detect if running on physical device or emulator
const getBaseUrl = () => {
  // For web (browser)
  if (Platform.OS === 'web') {
    return "http://localhost:3000";
  }
  
  // For physical devices (Android/iOS), use your computer's local IP
  // Replace with your actual IP address from ipconfig/ifconfig
  const LOCAL_IP = "192.168.1.6";
  
  // For Android emulator, use 10.0.2.2 (special alias for host machine)
  // For iOS simulator, localhost works fine
  if (Platform.OS === 'android') {
    // Check if running on emulator or physical device
    // Physical devices need the local IP
    return `http://${LOCAL_IP}:3000`;
  }
  
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    // Physical iOS device needs local IP
    return `http://${LOCAL_IP}:3000`;
  }
  
  // Fallback
  return "http://localhost:3000";
};

// Log the base URL being used for debugging
const BASE_URL = getBaseUrl();
console.log(`📡 API Base URL: ${BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);

// API Configuration
export const API_CONFIG = {
  BASE_URL: BASE_URL,
  // Manual override if needed:
  // BASE_URL: "http://192.168.1.6:3000", // For physical devices
  // BASE_URL: "http://localhost:3000",    // For web/emulator
  // Original Replit URL (backup):
  // BASE_URL: "https://55c1e6e5-cc5c-43f8-a6bc-09dbe6a8787c-00-30mdf3t7vv0b7.riker.replit.dev",
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/auth/register",
      LOGIN: "/api/auth/login",
      MEMBERSHIP_LOGIN: "/api/auth/membership-login",
      LOGOUT: "/api/auth/logout",
    },
    USER: {
      ENGLISH_LEVEL: "/api/user/english-level",
      LEARNING_GOALS: "/api/user/learning-goals",
      SKILLS_FOCUS: "/api/user/skills-focus",
      SPEAKING_PARTNER: "/api/user/speaking-partner",
    },
    PLANS: "/api/plans",
    HEALTH: "/api/health", // Health check endpoint
  },
  TIMEOUT: 10000, // 10 seconds
  // CORS Configuration (handled by backend)
  CORS_ENABLED: true,
  ALLOWED_ORIGINS: ["http://localhost:8081", "exp://localhost:8081"],
};

// Export BASE_URL as API_URL for convenience
export const API_URL = API_CONFIG.BASE_URL;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};
