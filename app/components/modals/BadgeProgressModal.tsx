/**
 * Badge Progress Modal
 * Shows user's badge progress and all available badges
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
import { BadgeService, Badge } from "@/app/services/badgeService";

interface BadgeProgressModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export const BadgeProgressModal: React.FC<BadgeProgressModalProps> = ({
  visible,
  onClose,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentBadge, setCurrentBadge] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && userId) {
      loadBadges();
    }
  }, [visible, userId]);

  const loadBadges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load badge progress
      const progress = await BadgeService.getBadgeProgress(userId);
      setTotalPoints(progress.totalPoints);
      setCurrentBadge(
        `${progress.currentBadge.icon} ${progress.currentBadge.name}`
      );

      // Load all badges
      const allBadges = await BadgeService.getAllBadges(userId);
      setBadges(allBadges);
    } catch (err) {
      console.error("Error loading badges:", err);
      setError("Failed to load badge information");
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeCardStyle = (badge: Badge) => {
    if (badge.isUnlocked) {
      return styles.badgeCardUnlocked;
    }
    return styles.badgeCardLocked;
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
              🏅 Badge Progress System
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {/* Current Progress */}
          <View style={styles.progressSection}>
            <ThemedText style={styles.pointsText}>
              Total Points: {totalPoints}
            </ThemedText>
            <ThemedText style={styles.currentBadgeText}>
              Current Badge: {currentBadge}
            </ThemedText>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={styles.loadingText}>
                Loading badges...
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
              <TouchableOpacity onPress={loadBadges} style={styles.retryButton}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.badgeList}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <ThemedText style={[styles.tableHeaderText, { flex: 1 }]}>
                  🔢 Points Earned
                </ThemedText>
                <ThemedText style={[styles.tableHeaderText, { flex: 1.5 }]}>
                  🏅 Badge Name
                </ThemedText>
                <ThemedText style={[styles.tableHeaderText, { flex: 2 }]}>
                  💬 Description
                </ThemedText>
              </View>

              {/* Badge List */}
              {badges.map((badge, index) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    getBadgeCardStyle(badge),
                    index === badges.length - 1 && styles.lastBadgeCard,
                  ]}
                >
                  <View style={styles.badgeRow}>
                    <View style={styles.badgePointsColumn}>
                      <ThemedText style={styles.badgePoints}>
                        {badge.pointsRequired === 0
                          ? "0-299"
                          : badge.pointsRequired === 300
                          ? "300-599"
                          : badge.pointsRequired === 600
                          ? "600-799"
                          : badge.pointsRequired === 800
                          ? "800-899"
                          : "900"}
                      </ThemedText>
                      {badge.isUnlocked && (
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color={Colors.light.primary}
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </View>

                    <View style={styles.badgeNameColumn}>
                      <ThemedText style={styles.badgeIcon}>
                        {badge.icon}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.badgeName,
                          !badge.isUnlocked && styles.lockedText,
                        ]}
                      >
                        {badge.name}
                      </ThemedText>
                    </View>

                    <View style={styles.badgeDescColumn}>
                      <ThemedText
                        style={[
                          styles.badgeDescription,
                          !badge.isUnlocked && styles.lockedText,
                        ]}
                      >
                        {badge.description}
                      </ThemedText>
                    </View>
                  </View>

                  {!badge.isUnlocked && (
                    <View style={styles.lockOverlay}>
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color={Colors.light.tabIconDefault}
                      />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
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
    maxHeight: "80%",
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
  progressSection: {
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 4,
  },
  currentBadgeText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
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
  badgeList: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.text,
  },
  badgeCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 12,
    position: "relative",
  },
  badgeCardUnlocked: {
    backgroundColor: "white",
  },
  badgeCardLocked: {
    backgroundColor: "#f9fafb",
    opacity: 0.7,
  },
  lastBadgeCard: {
    borderBottomWidth: 0,
  },
  badgeRow: {
    flexDirection: "row",
  },
  badgePointsColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  badgePoints: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  badgeNameColumn: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  badgeDescColumn: {
    flex: 2,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  lockedText: {
    color: Colors.light.tabIconDefault,
  },
  lockOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
