import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthService } from "@/app/services/authService";
import PlanList from "../shared/PlanList";

interface UserProfileComponentProps {
  onBack: () => void;
  onEditProfile?: () => void;
}

export const SimpleUserProfileComponent: React.FC<
  UserProfileComponentProps
> = ({ onBack, onEditProfile }) => {
  const colorScheme = useColorScheme();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);

      // Get basic user info from stored session
      const currentUser = await AuthService.getCurrentUser();
      const currentSession = await AuthService.getCurrentSession();

      console.log("Current user:", currentUser);
      console.log("Current session:", currentSession);

      setUserInfo({
        user: currentUser,
        session: currentSession,
      });
    } catch (error) {
      console.error("Error loading user info:", error);
      Alert.alert("Error", "Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.signOut();
            onBack(); // Go back to welcome screen
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const renderInfoCard = (
    title: string,
    content: string | string[],
    icon: string
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0))
      return null;

    return (
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.backgroundCard
                : Colors.light.backgroundCard,
          },
        ]}
      >
        <View style={styles.infoHeader}>
          <ThemedText style={styles.infoIcon}>{icon}</ThemedText>
          <ThemedText style={styles.infoTitle}>{title}</ThemedText>
        </View>
        <ThemedText
          style={[
            styles.infoContent,
            {
              color:
                colorScheme === "dark"
                  ? Colors.dark.textSecondary
                  : Colors.light.textSecondary,
            },
          ]}
        >
          {Array.isArray(content) ? content.join(", ") : content}
        </ThemedText>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
      </View>
    );
  }

  const user = userInfo?.user;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Profile</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.dark.backgroundCard
                  : Colors.light.backgroundCard,
              shadowColor:
                colorScheme === "dark"
                  ? Colors.dark.primary
                  : Colors.light.shadow,
            },
          ]}
        >
          {/* Profile Photo and Name */}
          <View style={styles.welcomeSection}>
            <View style={styles.avatarContainer}>
              {user?.profilePhotoBase64 ? (
                <Image
                  source={{ uri: user.profilePhotoBase64 }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(139, 69, 255, 0.2)"
                          : "rgba(139, 69, 255, 0.15)",
                    },
                  ]}
                >
                  <ThemedText style={styles.avatarEmoji}>👤</ThemedText>
                </View>
              )}
            </View>

            <ThemedText style={styles.welcomeText}>Welcome!</ThemedText>
            <ThemedText
              style={[
                styles.userName,
                {
                  color:
                    colorScheme === "dark"
                      ? Colors.dark.text
                      : Colors.light.text,
                },
              ]}
            >
              {user?.name || user?.fullName || "User"}
            </ThemedText>

            {user?.mobileNumber && (
              <ThemedText
                style={[
                  styles.userPhone,
                  {
                    color:
                      colorScheme === "dark"
                        ? Colors.dark.textSecondary
                        : Colors.light.textSecondary,
                  },
                ]}
              >
                📱 {user.mobileNumber}
              </ThemedText>
            )}
          </View>

          {/* Success Message */}
          <View style={styles.successSection}>
            <ThemedText style={styles.successTitle}>
              🎉 Login Successful!
            </ThemedText>
            <ThemedText
              style={[
                styles.successMessage,
                {
                  color:
                    colorScheme === "dark"
                      ? Colors.dark.textSecondary
                      : Colors.light.textSecondary,
                },
              ]}
            >
              You have successfully logged in to SpeakEdge. Your learning
              journey continues!
            </ThemedText>
          </View>
        </View>

        {/* User Information Cards */}
        <View style={styles.infoSection}>
          {renderInfoCard("Age", user?.age, "🎂")}
          {renderInfoCard("Gender", user?.gender, "👤")}
          {renderInfoCard("Country", user?.country, "🌍")}
          {renderInfoCard("WhatsApp", user?.whatsappNumber, "💬")}
          {renderInfoCard(
            "Highest Qualification",
            user?.highestQualification,
            "🎓"
          )}
          {renderInfoCard("English Skills", user?.englishSkills, "🗣️")}
          {renderInfoCard(
            "Speaking Partner Interest",
            user?.speakingPartnerInterest,
            "👥"
          )}
          {renderInfoCard("About You", user?.aboutYou, "📝")}
        </View>
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? Colors.dark.backgroundAccent
                    : Colors.light.backgroundAccent,
                borderColor:
                  colorScheme === "dark"
                    ? Colors.dark.border
                    : Colors.light.border,
              },
            ]}
            onPress={onEditProfile}
          >
            <ThemedText
              style={[
                styles.actionButtonText,
                {
                  color:
                    colorScheme === "dark"
                      ? Colors.dark.primaryLight
                      : Colors.light.primary,
                },
              ]}
            >
              ✏️ Edit Profile
            </ThemedText>
          </TouchableOpacity>
        </View>
        {/* Session Information */}

        <View style={styles.actionsSection}>
          <PlanList />
        </View>
        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.signOutButton,
              {
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "#ef4444",
              },
            ]}
            onPress={handleSignOut}
          >
            <ThemedText style={[styles.actionButtonText, { color: "#ef4444" }]}>
              🚪 Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100, // Extra padding to ensure content is visible above tab bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 60, // Same width as back button to center title
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 255, 0.1)",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 16,
    fontWeight: "500",
  },
  successSection: {
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 255, 0.1)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  infoContent: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 255, 0.1)",
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  sessionInfo: {
    gap: 8,
  },
  sessionLabel: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  debugSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(156, 163, 175, 0.2)",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.textSecondary,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "monospace",
  },
  actionsSection: {
    gap: 16,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  editButton: {
    // Styles applied inline
  },
  signOutButton: {
    // Styles applied inline
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
