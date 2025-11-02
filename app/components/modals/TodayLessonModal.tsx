/**
 * Today's Lesson Modal
 * Shows daily lesson assigned based on user's English level
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { LessonService, TodayLesson } from "@/app/services/lessonService";

interface TodayLessonModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const TodayLessonModal: React.FC<TodayLessonModalProps> = ({
  visible,
  onClose,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState<TodayLesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && userId) {
      loadTodayLesson();
    }
  }, [visible, userId]);

  const loadTodayLesson = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const todayLesson = await LessonService.getTodayLesson(userId);
      setLesson(todayLesson);

      // Mark as viewed if not already
      if (todayLesson && !todayLesson.viewed) {
        await LessonService.markLessonViewed(todayLesson.assignmentId);
      }
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError("Failed to load today's lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson || !userId) return;

    try {
      // Mark lesson as complete with a default score
      await LessonService.completeLesson(userId, lesson.lesson.id, 100);

      // Reload to show next lesson
      await loadTodayLesson();
    } catch (err) {
      console.error("Error completing lesson:", err);
      alert("Failed to complete lesson. Please try again.");
    }
  };

  const getLevelColor = (level: string) => {
    if (level.startsWith("A1") || level.startsWith("A2")) return "#10b981";
    if (level.startsWith("B1") || level.startsWith("B2")) return "#3b82f6";
    if (level.startsWith("C1") || level.startsWith("C2")) return "#8b5cf6";
    return Colors.light.primary;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              📖 Today's Lesson
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={styles.loadingText}>
                Loading your lesson...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons
                name="error-outline"
                size={48}
                color={Colors.light.tabIconDefault}
              />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity
                onPress={loadTodayLesson}
                style={styles.retryButton}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : lesson ? (
            <ScrollView style={styles.lessonContent}>
              {/* Lesson Info */}
              <View style={styles.lessonHeader}>
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: getLevelColor(lesson.lesson.level) },
                  ]}
                >
                  <ThemedText style={styles.levelBadgeText}>
                    {lesson.lesson.level}
                  </ThemedText>
                </View>
                <ThemedText style={styles.lessonNumber}>
                  Lesson {lesson.lesson.lessonNumber}
                </ThemedText>
              </View>

              <ThemedText style={styles.lessonTitle}>
                {lesson.lesson.title}
              </ThemedText>

              {/* Content Section */}
              {lesson.lesson.content && (
                <View style={styles.contentSection}>
                  <ThemedText style={styles.sectionTitle}>
                    📝 Lesson Content
                  </ThemedText>
                  <ThemedText style={styles.contentText}>
                    {lesson.lesson.content}
                  </ThemedText>
                </View>
              )}

              {/* Exercises Section */}
              {lesson.lesson.exercises && lesson.lesson.exercises.length > 0 && (
                <View style={styles.contentSection}>
                  <ThemedText style={styles.sectionTitle}>
                    ✏️ Exercises
                  </ThemedText>
                  <ThemedText style={styles.contentText}>
                    {JSON.stringify(lesson.lesson.exercises, null, 2)}
                  </ThemedText>
                </View>
              )}

              {/* Media Section */}
              {lesson.lesson.mediaUrl && (
                <View style={styles.contentSection}>
                  <ThemedText style={styles.sectionTitle}>
                    🎥 Media Resource
                  </ThemedText>
                  <ThemedText style={styles.contentText}>
                    {lesson.lesson.mediaUrl}
                  </ThemedText>
                </View>
              )}

              {/* Completion Status */}
              <View style={styles.statusSection}>
                {lesson.viewed ? (
                  <View style={styles.completedBanner}>
                    <MaterialIcons
                      name="visibility"
                      size={24}
                      color={Colors.light.primary}
                    />
                    <ThemedText style={styles.completedText}>
                      You have viewed this lesson
                    </ThemedText>
                  </View>
                ) : null}
                <TouchableOpacity
                  onPress={handleCompleteLesson}
                  style={styles.completeButton}
                >
                  <MaterialIcons name="check" size={20} color="white" />
                  <ThemedText style={styles.completeButtonText}>
                    Mark as Complete
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="school"
                size={64}
                color={Colors.light.tabIconDefault}
              />
              <ThemedText style={styles.emptyText}>
                No lesson assigned yet
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: Colors.light.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: Colors.light.tabIconDefault,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: Colors.light.tabIconDefault,
  },
  lessonContent: {
    flex: 1,
    padding: 20,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  levelBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  lessonNumber: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.light.text,
  },
  lessonDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  contentSection: {
    marginBottom: 24,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: Colors.light.text,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
  },
  statusSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1fae5",
    padding: 16,
    borderRadius: 12,
  },
  completedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    marginLeft: 8,
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
