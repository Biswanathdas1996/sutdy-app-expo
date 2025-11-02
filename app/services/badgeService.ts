/**
 * Badge Service
 * Handles all badge-related API calls
 */

import { ApiService } from "./apiService";

export interface BadgeProgress {
  userId: string;
  totalPoints: number;
  currentBadge: {
    id: number;
    name: string;
    icon: string;
    description: string;
    pointsRequired: number;
  };
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  pointsRequired: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface PointsHistory {
  id: number;
  pointsEarned: number;
  activityType: string;
  activityDate: string;
  validated: boolean;
  createdAt: string;
}

export class BadgeService {
  /**
   * Get user's badge progress
   */
  static async getBadgeProgress(userId: string): Promise<BadgeProgress> {
    try {
      const response = await ApiService.get(`/api/badges/progress/${userId}`, {
        requireAuth: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to get badge progress");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting badge progress:", error);
      throw error;
    }
  }

  /**
   * Get all badges with unlock status
   */
  static async getAllBadges(userId: string): Promise<Badge[]> {
    try {
      const response = await ApiService.get(`/api/badges/all/${userId}`, {
        requireAuth: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to get badges");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting all badges:", error);
      throw error;
    }
  }

  /**
   * Get points history
   */
  static async getPointsHistory(
    userId: string,
    limit: number = 50
  ): Promise<PointsHistory[]> {
    try {
      const response = await ApiService.get(
        `/api/badges/points/history/${userId}?limit=${limit}`,
        {
          requireAuth: false,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to get points history");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting points history:", error);
      throw error;
    }
  }

  /**
   * Get badge leaderboard
   */
  static async getLeaderboard(limit: number = 100) {
    try {
      const response = await ApiService.get(
        `/api/badges/leaderboard?limit=${limit}`,
        {
          requireAuth: false,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to get leaderboard");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      throw error;
    }
  }
}
