import {
  RegisterRequest,
  AuthResponse,
  LoginRequest,
  OTPLoginRequest,
} from "@/app/types/api";
import { StorageService } from "./storageService";
import { API_CONFIG, ERROR_MESSAGES } from "@/app/constants/Api";

export class AuthService {
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT
      );

      console.log("Sending registration request:", userData);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle the actual API response structure
      if (data.success) {
        // Create testResult object from the direct response
        const testResult = {
          authToken: data.authToken,
          sessionId: data.sessionId,
          isNewUser: data.isNewUser,
          userId: data.userId || data.sessionId, // Use sessionId as userId if userId not provided
          userName: data.userName || userData.fullName, // Use fullName as userName if userName not provided
        };

        // Save user session with all the details
        await StorageService.saveUserSession(testResult, {
          userId: testResult.userId,
          userName: testResult.userName,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          isNewUser: testResult.isNewUser,
        });

        return {
          success: true,
          message: data.message || "Registration successful",
          testResult: testResult,
          user: {
            userId: testResult.userId,
            userName: testResult.userName,
            fullName: userData.fullName,
            mobileNumber: userData.mobileNumber,
            isNewUser: testResult.isNewUser,
          },
          token: testResult.authToken,
        };
      }

      return {
        success: false,
        message:
          data.message || "Registration failed - Invalid response format",
      };
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message: ERROR_MESSAGES.TIMEOUT_ERROR,
          };
        }
        return {
          success: false,
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        };
      }

      return {
        success: false,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  static async signIn(userData: LoginRequest): Promise<AuthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT
      );

      console.log("Sending sign in request:", userData);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log("Sign in response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle the actual API response structure
      if (data.success) {
        // Create testResult object from the direct response
        const testResult = {
          authToken: data.authToken,
          sessionId: data.sessionId,
          isNewUser: data.isNewUser,
          userId: data.userId || data.sessionId, // Use sessionId as userId if userId not provided
          userName: data.userName || userData.fullName, // Use fullName as userName if userName not provided
        };

        // Save user session with all the details
        await StorageService.saveUserSession(testResult, {
          userId: testResult.userId,
          userName: testResult.userName,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
          isNewUser: testResult.isNewUser,
        });

        return {
          success: true,
          message: data.message || "Sign in successful",
          testResult: testResult,
          user: {
            userId: testResult.userId,
            userName: testResult.userName,
            fullName: userData.fullName,
            mobileNumber: userData.mobileNumber,
            isNewUser: testResult.isNewUser,
          },
          token: testResult.authToken,
        };
      }

      return {
        success: false,
        message: data.message || "Sign in failed - Invalid response format",
      };
    } catch (error) {
      console.error("Sign in error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message: ERROR_MESSAGES.TIMEOUT_ERROR,
          };
        }
        return {
          success: false,
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        };
      }

      return {
        success: false,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  static async loginWithOTP(userData: OTPLoginRequest): Promise<AuthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT
      );

      console.log("Sending OTP login request:", userData);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.MEMBERSHIP_LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log("OTP login response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle the actual API response structure
      if (data.success) {
        // Create testResult object from the direct response
        const testResult = {
          authToken: data.authToken,
          sessionId: data.sessionId,
          isNewUser: data.isNewUser || false,
          userId: data.user?.id || data.sessionId, // Use user.id if available, fallback to sessionId
          userName: data.user?.name || "User", // Use user.name if available
        };

        // Create complete user object with all the details from login response
        const userForSession = {
          id: data.user?.id,
          userId: testResult.userId,
          userName: testResult.userName,
          name: data.user?.name,
          fullName: data.user?.name || "User",
          mobileNumber: data.user?.mobileNumber || userData.mobileNumber,
          whatsappNumber: data.user?.whatsappNumber,
          age: data.user?.age,
          gender: data.user?.gender,
          country: data.user?.country,
          englishSkills: data.user?.englishSkills,
          highestQualification: data.user?.highestQualification,
          speakingPartnerInterest: data.user?.speakingPartnerInterest,
          aboutYou: data.user?.aboutYou,
          profilePhotoBase64: data.user?.profilePhotoBase64,
          isNewUser: testResult.isNewUser,
        };

        // Save user session with all the details
        await StorageService.saveUserSession(testResult, userForSession);

        return {
          success: true,
          message: data.message || "Login successful",
          testResult: testResult,
          user: userForSession,
          token: testResult.authToken,
        };
      }

      return {
        success: false,
        message: data.message || "Login failed - Invalid response format",
      };
    } catch (error) {
      console.error("OTP login error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message: ERROR_MESSAGES.TIMEOUT_ERROR,
          };
        }
        return {
          success: false,
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        };
      }

      return {
        success: false,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      await StorageService.clearUserSession();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  static async getCurrentUser() {
    try {
      const session = await StorageService.getUserSession();
      return session?.user || null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  static async getCurrentSession() {
    try {
      const session = await StorageService.getUserSession();
      return session;
    } catch (error) {
      console.error("Get current session error:", error);
      return null;
    }
  }

  static async isLoggedIn(): Promise<boolean> {
    return await StorageService.isUserLoggedIn();
  }

  // Helper method to get auth headers for future API calls
  static async getAuthHeaders(): Promise<Record<string, string>> {
    return await StorageService.getAuthHeaders();
  }

  // Helper method to get user tokens for API calls
  static async getUserTokens() {
    try {
      const authToken = await StorageService.getAuthToken();
      const sessionId = await StorageService.getSessionId();
      const userId = await StorageService.getUserId();

      return {
        authToken,
        sessionId,
        userId,
      };
    } catch (error) {
      console.error("Get user tokens error:", error);
      return {
        authToken: null,
        sessionId: null,
        userId: null,
      };
    }
  }
}
