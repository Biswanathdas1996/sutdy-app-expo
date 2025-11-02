/**
 * Lesson Service
 * Handles all lesson-related API calls
 */

import { ApiService } from "./apiService";

export interface TodayLesson {
  assignmentId: number;
  viewed: boolean;
  lesson: {
    id: number;
    level: string;
    lessonNumber: number;
    title: string;
    content: string;
    exercises?: any[];
    mediaUrl?: string;
  };
}

export interface LessonProgress {
  level: string;
  totalLessons: number;
  completedLessons: number;
  averageScore: string;
  progressPercentage: string;
  recentLessons: {
    id: number;
    lessonNumber: number;
    title: string;
    completionDate: string;
    score?: number;
  }[];
}

export class LessonService {
  /**
   * Get today's lesson for user
   */
  static async getTodayLesson(userId: string): Promise<TodayLesson> {
    try {
      const response = await ApiService.get(`/api/lessons/today/${userId}`, {
        requireAuth: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to get today's lesson");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting today's lesson:", error);
      throw error;
    }
  }

  /**
   * Mark lesson as viewed
   */
  static async markLessonViewed(assignmentId: number): Promise<void> {
    try {
      const response = await ApiService.put(
        `/api/lessons/mark-viewed/${assignmentId}`,
        {},
        {
          requireAuth: false,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to mark lesson as viewed");
      }
    } catch (error) {
      console.error("Error marking lesson as viewed:", error);
      throw error;
    }
  }

  /**
   * Complete a lesson
   */
  static async completeLesson(
    userId: string,
    lessonId: number,
    score?: number
  ): Promise<void> {
    try {
      const response = await ApiService.post(
        "/api/lessons/complete",
        {
          userId,
          lessonId,
          score,
        },
        {
          requireAuth: false,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to complete lesson");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      throw error;
    }
  }

  /**
   * Get lesson progress
   */
  static async getLessonProgress(userId: string): Promise<LessonProgress> {
    try {
      const response = await ApiService.get(`/api/lessons/progress/${userId}`, {
        requireAuth: false,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to get lesson progress");
      }

      return response.data;
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      throw error;
    }
  }
}
