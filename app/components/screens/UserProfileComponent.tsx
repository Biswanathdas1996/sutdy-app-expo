import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { ModernButton } from "../shared/ModernButton";
import { ApiService } from "@/app/services/apiService";
import { AuthService } from "@/app/services/authService";

interface UserProfile {
  id: string;
  fullName: string;
  mobileNumber?: string;
  englishLevel?: string;
  learningGoals?: string[];
  skillsFocus?: string[];
  needsSpeakingPartner?: boolean;
  onboardingComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Membership {
  id: string;
  name: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  mobileNumber: string;
  whatsappNumber: string;
  englishSkills: string[];
  highestQualification: string;
  speakingPartnerInterest: string;
  speakingPartnerOther?: string;
  aboutYou: string;
  profilePhotoUrl?: string;
  profilePhotoBase64?: string;
  createdAt: string;
  updatedAt: string;
  membershipType: string;
  status: string;
  startDate: string;
  endDate?: string;
  features?: string[];
}

interface UserProfileComponentProps {
  onBack?: () => void;
  onEditProfile?: () => void;
}

export const UserProfileComponent: React.FC<UserProfileComponentProps> = ({
  onBack,
  onEditProfile,
}) => {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipCount, setMembershipCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // First, get user from session as fallback
      const currentUser = await AuthService.getCurrentUser();
      console.log("Current user from session:", currentUser);

      const response = await ApiService.getUserProfileWithMemberships();
      console.log("Full profile response:", JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        // Handle nested response structure: response.data.data contains the actual profile data
        const profileData = response.data.data || response.data;

        console.log("Profile data structure:", profileData);
        console.log("Setting user profile to:", profileData.user);
        console.log("Setting memberships to:", profileData.memberships);
        console.log(
          "Setting membership count to:",
          profileData.membershipCount
        );

        setUserProfile(profileData.user || currentUser || null);
        setMemberships(profileData.memberships || []);
        setMembershipCount(profileData.membershipCount || 0);

        console.log("State should now be updated");
      } else {
        console.error("Response validation failed:", {
          success: response.success,
          hasData: !!response.data,
          response,
        });
        
        // Use session user as fallback
        if (currentUser) {
          console.log("Using session user as fallback");
          setUserProfile({
            id: currentUser.id || currentUser.userId || 'unknown',
            fullName: currentUser.fullName || currentUser.name || currentUser.userName || 'User',
            mobileNumber: currentUser.mobileNumber,
            englishLevel: Array.isArray(currentUser.englishSkills) ? currentUser.englishSkills[0] : currentUser.englishSkills,
            learningGoals: [],
            skillsFocus: [],
            needsSpeakingPartner: currentUser.speakingPartnerInterest === 'yes',
            onboardingComplete: !currentUser.isNewUser,
          });
          setMemberships([]);
          setMembershipCount(0);
        } else {
          throw new Error(response.message || "Failed to load profile");
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      
      // Try to use session user as fallback
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          console.log("Using session user as fallback after error");
          setUserProfile({
            id: currentUser.id || currentUser.userId || 'unknown',
            fullName: currentUser.fullName || currentUser.name || currentUser.userName || 'User',
            mobileNumber: currentUser.mobileNumber,
            englishLevel: Array.isArray(currentUser.englishSkills) ? currentUser.englishSkills[0] : currentUser.englishSkills,
            learningGoals: [],
            skillsFocus: [],
            needsSpeakingPartner: currentUser.speakingPartnerInterest === 'yes',
            onboardingComplete: !currentUser.isNewUser,
          });
          setMemberships([]);
          setMembershipCount(0);
          setError(null); // Clear error since we have fallback data
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
      
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load profile";
      setError(errorMessage);

      Alert.alert("Error", `Failed to load your profile: ${errorMessage}`, [
        {
          text: "Retry",
          onPress: () => loadUserProfile(),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const onRefresh = () => {
    loadUserProfile(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#4CAF50";
      case "expired":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getMembershipIcon = (membershipType: string): any => {
    switch (membershipType?.toLowerCase()) {
      case "premium":
        return "star";
      case "basic":
        return "card-membership";
      case "trial":
        return "schedule";
      default:
        return "card-membership";
    }
  };

  const formatEnglishSkills = (skills: string[]) => {
    const skillMapping: Record<string, string> = {
      A1: "A1 - Beginner",
      A2: "A2 - Elementary",
      B1: "B1 - Intermediate",
      B2: "B2 - Upper Intermediate",
      C1: "C1 - Advanced",
      C2: "C2 - Proficient",
    };

    return skills.map((skill) => skillMapping[skill] || skill);
  };

  const handleSignOut = () => {
    console.log("🔴 handleSignOut called");
    
    // Use web-compatible confirmation for browsers
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      console.log("🔵 Confirmation result:", confirmed);
      
      if (confirmed) {
        console.log("🔵 Sign out confirmed - starting process...");
        performSignOut();
      } else {
        console.log("❌ Sign out cancelled");
      }
    } else {
      // Native mobile Alert
      Alert.alert(
        "Sign Out", 
        "Are you sure you want to sign out?", 
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("❌ Sign out cancelled"),
          },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => {
              console.log("🔵 Sign out confirmed - starting process...");
              performSignOut();
            },
          },
        ]
      );
    }
  };

  const performSignOut = async () => {
    setIsSigningOut(true);
    
    try {
      console.log("Step 1: Calling AuthService.signOut()...");
      await AuthService.signOut();
      console.log("Step 2: Session cleared");
      
      console.log("Step 3: Verifying sign out...");
      const isStillLoggedIn = await AuthService.isLoggedIn();
      console.log("Step 4: After sign out, still logged in?", isStillLoggedIn);
      
      if (isStillLoggedIn) {
        console.error("❌ Session was not properly cleared!");
        if (typeof window !== 'undefined' && window.alert) {
          window.alert("Failed to sign out. Please try again.");
        } else {
          Alert.alert("Error", "Failed to sign out. Please try again.");
        }
        setIsSigningOut(false);
        return;
      }
      
      console.log("Step 5: Clearing local state...");
      setUserProfile(null);
      setMemberships([]);
      setMembershipCount(0);
      
      console.log("Step 6: Calling onBack()...");
      console.log("Step 6a: onBack function exists?", !!onBack);
      if (onBack) {
        console.log("Step 6b: About to call onBack()...");
        onBack();
        console.log("Step 6c: onBack() called successfully");
      } else {
        console.warn("⚠️ onBack is not defined!");
      }
      
      console.log("✅ Sign out successful - all steps completed");
      setIsSigningOut(false);
    } catch (error) {
      console.error("❌ Sign out error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Failed to sign out: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert("Error", `Failed to sign out: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={{ marginTop: 16, fontSize: 16 }}>
          Loading your profile...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error && !userProfile) {
    return (
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <MaterialIcons
          name="error-outline"
          size={64}
          color={Colors[colorScheme ?? "light"].tabIconDefault}
        />
        <ThemedText
          style={{ marginTop: 16, fontSize: 18, textAlign: "center" }}
        >
          Failed to load profile
        </ThemedText>
        <ThemedText
          style={{
            marginTop: 8,
            fontSize: 14,
            textAlign: "center",
            color: Colors[colorScheme ?? "light"].tabIconDefault,
          }}
        >
          {error}
        </ThemedText>
        <View style={{ marginTop: 20, width: '100%', paddingHorizontal: 40 }}>
          <ModernButton title="Retry" onPress={() => loadUserProfile()} />
          
          {/* Sign Out Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              borderWidth: 1.5,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 16,
              alignItems: "center",
              marginTop: 12,
              opacity: isSigningOut ? 0.5 : 1,
            }}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <ThemedText style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>
              {isSigningOut ? "⏳ Signing Out..." : "🚪 Sign Out"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay for Sign Out */}
        {isSigningOut && (
          <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}>
            <View style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 16,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={{ marginTop: 16, fontSize: 16, color: Colors.light.textSecondary }}>
                Signing out...
              </ThemedText>
            </View>
          </View>
        )}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 20,
          paddingTop: 50,
          backgroundColor: Colors.light.primary,
        }}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 16 }}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
            }}
          >
            Profile
          </ThemedText>
        </View>
        {onEditProfile && (
          <TouchableOpacity onPress={onEditProfile}>
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Section */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {/* Profile photo will come from membership data */}
            {memberships[0]?.profilePhotoBase64 ? (
              <Image
                source={{ uri: memberships[0].profilePhotoBase64 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  marginBottom: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor:
                    Colors[colorScheme ?? "light"].tabIconDefault + "30",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialIcons
                  name="person"
                  size={48}
                  color={Colors[colorScheme ?? "light"].tabIconDefault}
                />
              </View>
            )}
            <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
              {userProfile?.fullName || memberships[0]?.name || "N/A"}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 14,
                color: Colors[colorScheme ?? "light"].tabIconDefault,
              }}
            >
              Member since {formatDate(userProfile?.createdAt)}
            </ThemedText>
          </View>

          {/* User Profile Info */}
          <View style={{ marginBottom: 20 }}>
            <ThemedText
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Profile Information
            </ThemedText>

            {[
              { label: "Mobile Number", value: userProfile?.mobileNumber },
              { label: "English Level", value: userProfile?.englishLevel },
              {
                label: "Learning Goals",
                value: userProfile?.learningGoals?.join(", "),
              },
              {
                label: "Skills Focus",
                value: userProfile?.skillsFocus?.join(", "),
              },
              {
                label: "Needs Speaking Partner",
                value: userProfile?.needsSpeakingPartner ? "Yes" : "No",
              },
            ].map(
              (item, index) =>
                item.value && (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        Colors[colorScheme ?? "light"].tabIconDefault + "20",
                    }}
                  >
                    <ThemedText style={{ fontSize: 14, fontWeight: "500" }}>
                      {item.label}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: Colors[colorScheme ?? "light"].tabIconDefault,
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {item.value}
                    </ThemedText>
                  </View>
                )
            )}
          </View>
        </View>

        {/* Memberships Section */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <ThemedText
            style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}
          >
            Memberships
          </ThemedText>

          {memberships.length > 0 ? (
            memberships.map((membership, index) => (
              <View
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: getStatusColor(membership.status),
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: getStatusColor(membership.status) + "10",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <MaterialIcons
                    name={getMembershipIcon(membership.membershipType)}
                    size={24}
                    color={getStatusColor(membership.status)}
                  />
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    {membership.membershipType}
                  </ThemedText>
                  <View
                    style={{
                      backgroundColor: getStatusColor(membership.status),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      {membership.status}
                    </ThemedText>
                  </View>
                </View>

                <View style={{ marginBottom: 8 }}>
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: Colors[colorScheme ?? "light"].tabIconDefault,
                    }}
                  >
                    Start Date: {formatDate(membership.startDate)}
                  </ThemedText>
                  {membership.endDate && (
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: Colors[colorScheme ?? "light"].tabIconDefault,
                      }}
                    >
                      End Date: {formatDate(membership.endDate)}
                    </ThemedText>
                  )}
                </View>

                {membership.features && membership.features.length > 0 && (
                  <View>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        marginBottom: 4,
                      }}
                    >
                      Features:
                    </ThemedText>
                    {membership.features.map((feature, featureIndex) => (
                      <View
                        key={featureIndex}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 2,
                        }}
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color={getStatusColor(membership.status)}
                        />
                        <ThemedText
                          style={{
                            fontSize: 12,
                            marginLeft: 6,
                            color:
                              Colors[colorScheme ?? "light"].tabIconDefault,
                          }}
                        >
                          {feature}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <MaterialIcons
                name="card-membership"
                size={48}
                color={Colors[colorScheme ?? "light"].tabIconDefault}
              />
              <ThemedText
                style={{
                  fontSize: 16,
                  marginTop: 8,
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                }}
              >
                No memberships found
              </ThemedText>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              borderWidth: 1.5,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 16,
              alignItems: "center",
              opacity: isSigningOut ? 0.5 : 1,
            }}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <ThemedText style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>
              {isSigningOut ? "⏳ Signing Out..." : "🚪 Sign Out"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay for Sign Out */}
      {isSigningOut && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: "white",
            padding: 30,
            borderRadius: 16,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <ThemedText style={{ marginTop: 16, fontSize: 16, color: Colors.light.textSecondary }}>
              Signing out...
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
};
