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
    } catch (error) {
      console.error("Error saving user session:", error);
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
      await AsyncStorage.multiRemove([
        USER_SESSION_KEY,
        AUTH_TOKEN_KEY,
        SESSION_ID_KEY,
        USER_ID_KEY,
      ]);
      console.log("User session cleared successfully");
    } catch (error) {
      console.error("Error clearing user session:", error);
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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    if (userId) {
      headers["X-User-ID"] = userId;
    }

    return headers;
  }
}
