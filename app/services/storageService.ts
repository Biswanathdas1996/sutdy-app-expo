import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserSession, TestResult } from "@/app/types/api";

const USER_SESSION_KEY = "@speakedge_user_session";
const AUTH_TOKEN_KEY = "@speakedge_auth_token";
const SESSION_ID_KEY = "@speakedge_session_id";
const USER_ID_KEY = "@speakedge_user_id";

export class StorageService {
  static async saveUserSession(
    testResult: TestResult,
    userData: User
  ): Promise<void> {
    try {
      console.log("saveUserSession called with:", {
        testResult,
        userData,
      });

      // Validate required fields
      if (!testResult.authToken) {
        console.error("Missing authToken in testResult");
        throw new Error("authToken is required");
      }

      if (!testResult.sessionId) {
        console.error("Missing sessionId in testResult");
        throw new Error("sessionId is required");
      }

      if (!testResult.userId) {
        console.error("Missing userId in testResult");
        throw new Error("userId is required");
      }

      const user: User = {
        ...userData,
        userId: testResult.userId,
        userName: testResult.userName,
        isNewUser: testResult.isNewUser,
      };

      const session: UserSession = {
        user,
        authToken: testResult.authToken,
        sessionId: testResult.sessionId,
        userId: testResult.userId,
        userName: testResult.userName,
        isNewUser: testResult.isNewUser,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        createdAt: Date.now(),
      };

      // Save complete session
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));

      // Save individual tokens for easy access
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, testResult.authToken);
      await AsyncStorage.setItem(SESSION_ID_KEY, testResult.sessionId);
      await AsyncStorage.setItem(USER_ID_KEY, testResult.userId);

      console.log("User session saved successfully:", {
        userId: testResult.userId,
        authToken: testResult.authToken.substring(0, 8) + "...",
        sessionId: testResult.sessionId.substring(0, 8) + "...",
      });

      // Verify the save worked
      const savedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
      const savedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      console.log("Verified saved values:", {
        sessionId: savedSessionId?.substring(0, 8) + "...",
        authToken: savedAuthToken?.substring(0, 8) + "...",
      });
    } catch (error) {
      console.error("Error saving user session:", error);
      throw error;
    }
  }

  static async getUserSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        await this.clearUserSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting user session:", error);
      return null;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  static async getSessionId(): Promise<string | null> {
    try {
      const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
      return sessionId;
    } catch (error) {
      console.error("Error getting session ID:", error);
      return null;
    }
  }

  static async getUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  }

  static async clearUserSession(): Promise<void> {
    try {
      console.log("🗑️ Clearing user session...");
      
      await AsyncStorage.multiRemove([
        USER_SESSION_KEY,
        AUTH_TOKEN_KEY,
        SESSION_ID_KEY,
        USER_ID_KEY,
      ]);
      
      // Verify all keys were removed
      const remainingToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const remainingSession = await AsyncStorage.getItem(SESSION_ID_KEY);
      const remainingUserId = await AsyncStorage.getItem(USER_ID_KEY);
      
      console.log("✅ User session cleared successfully");
      console.log("Verification - remaining values:", {
        token: remainingToken,
        sessionId: remainingSession,
        userId: remainingUserId,
      });
      
      if (remainingToken || remainingSession || remainingUserId) {
        console.warn("⚠️ Warning: Some session data may not have been cleared!");
      }
    } catch (error) {
      console.error("❌ Error clearing user session:", error);
      throw error;
    }
  }

  static async isUserLoggedIn(): Promise<boolean> {
    const session = await this.getUserSession();
    return session !== null;
  }

  // Helper method to get auth headers for future API calls
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const authToken = await this.getAuthToken();
    const sessionId = await this.getSessionId();
    const userId = await this.getUserId();

    console.log("getAuthHeaders - Retrieved values:", {
      authToken: authToken ? authToken.substring(0, 8) + "..." : "null",
      sessionId: sessionId ? sessionId.substring(0, 8) + "..." : "null",
      userId: userId ? userId.substring(0, 8) + "..." : "null",
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header if authToken exists and is not null/undefined
    if (authToken && authToken !== "null" && authToken !== "undefined") {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    // Only add X-Session-ID header if sessionId exists and is not null/undefined
    if (sessionId && sessionId !== "null" && sessionId !== "undefined") {
      headers["X-Session-ID"] = sessionId;
    }

    // Only add X-User-ID header if userId exists and is not null/undefined
    if (userId && userId !== "null" && userId !== "undefined") {
      headers["X-User-ID"] = userId;
    }

    console.log("getAuthHeaders - Final headers:", headers);
    return headers;
  }
}
