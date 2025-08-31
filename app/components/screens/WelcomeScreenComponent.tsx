import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ScreenProps } from "../types";
import { AuthService } from "@/app/services/authService";

const { width } = Dimensions.get("window");

interface WelcomeScreenComponentProps extends ScreenProps {
  setName: (name: string) => void;
  setMobile: (mobile: string) => void;
  name: string;
  mobile: string;
  onOTPLogin?: () => void;
}

export const WelcomeScreenComponent: React.FC<WelcomeScreenComponentProps> = ({
  onNext,
  setName,
  setMobile,
  name,
  mobile,
  onOTPLogin,
}) => {
  const colorScheme = useColorScheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }

    if (!mobile.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return false;
    }

    // More flexible mobile number validation - at least 10 digits
    const cleanMobile = mobile.replace(/\D/g, ""); // Remove all non-digits
    if (cleanMobile.length < 10) {
      Alert.alert(
        "Error",
        "Please enter a valid mobile number (at least 10 digits)"
      );
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      console.log("Starting sign in process...", {
        name: name.trim(),
        mobile: mobile.trim(),
      });

      const result = await AuthService.signIn({
        fullName: name.trim(),
        mobileNumber: mobile.trim(),
      });

      console.log("Sign in result:", result);

      if (result.success) {
        console.log("Sign in successful, navigating to next screen...");
        Alert.alert("Success", result.message, [
          {
            text: "OK",
            onPress: () => {
              console.log("User pressed OK, calling onNext()");
              onNext();
            },
          },
        ]);
      } else {
        console.log("Sign in failed:", result.message);
        Alert.alert("Sign In Failed", result.message);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      console.log("Starting registration process...", {
        name: name.trim(),
        mobile: mobile.trim(),
      });

      const result = await AuthService.register({
        fullName: name.trim(),
        mobileNumber: mobile.trim(),
      });

      console.log("Registration result:", result);

      if (result.success) {
        console.log("Registration successful, proceeding to next step...");
        // Directly proceed to the next step without showing alert
        console.log("🎯 Calling onNext() after successful registration");
        onNext();
      } else {
        console.log("Registration failed:", result.message);
        Alert.alert("Registration Failed", result.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern gradient background */}
      <View
        style={[
          styles.backgroundGradient,
          {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.background
                : Colors.light.background,
          },
        ]}
      />
      <View style={styles.backgroundAccent} />
      <View style={styles.backgroundAccent2} />
      <View style={styles.floatingOrbs} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.compactHeroContainer,
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
            >
              <View
                style={[
                  styles.compactLogoCircle,
                  {
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(139, 69, 255, 0.2)"
                        : "rgba(139, 69, 255, 0.15)",
                  },
                ]}
              >
                <ThemedText style={styles.compactLogoEmoji}>🎓</ThemedText>
                <View style={styles.logoRipple} />
              </View>

              <View style={styles.compactTitleContainer}>
                <View style={styles.brandRow}>
                  <ThemedText
                    style={[
                      styles.compactWelcomeText,
                      {
                        color:
                          colorScheme === "dark"
                            ? Colors.dark.textMuted
                            : Colors.light.textMuted,
                      },
                    ]}
                  >
                    Welcome to{" "}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.compactBrandText,
                      { color: Colors.light.primary },
                    ]}
                  >
                    SpeakEdge
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.compactTaglineText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.textSecondary
                          : Colors.light.text,
                    },
                  ]}
                >
                  Master English with AI-powered learning ✨
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.backgroundCard
                      : Colors.light.backgroundCard,
                  shadowColor:
                    colorScheme === "dark"
                      ? Colors.dark.primary
                      : Colors.light.shadow,
                  borderColor:
                    colorScheme === "dark"
                      ? Colors.dark.border
                      : Colors.light.border,
                },
              ]}
            >
              <View style={styles.inputHeader}>
                <ThemedText
                  style={[
                    styles.inputHeaderText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.textSecondary
                          : Colors.light.textSecondary,
                    },
                  ]}
                >
                  Let&apos;s get started 🚀
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor:
                        colorScheme === "dark"
                          ? Colors.dark.border
                          : Colors.light.border,
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(31, 41, 55, 0.5)"
                          : "rgba(248, 250, 252, 0.8)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputIconWrapper,
                      {
                        backgroundColor:
                          colorScheme === "dark"
                            ? "rgba(139, 69, 255, 0.25)"
                            : "rgba(139, 69, 255, 0.15)",
                      },
                    ]}
                  >
                    <ThemedText style={styles.inputIcon}>👤</ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color:
                          colorScheme === "dark"
                            ? Colors.dark.text
                            : Colors.light.text,
                      },
                    ]}
                    placeholder="Enter your full name"
                    placeholderTextColor={
                      colorScheme === "dark"
                        ? Colors.dark.textMuted
                        : Colors.light.textMuted
                    }
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor:
                        colorScheme === "dark"
                          ? Colors.dark.border
                          : Colors.light.border,
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(31, 41, 55, 0.5)"
                          : "rgba(248, 250, 252, 0.8)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.inputIconWrapper,
                      {
                        backgroundColor:
                          colorScheme === "dark"
                            ? "rgba(139, 69, 255, 0.25)"
                            : "rgba(139, 69, 255, 0.15)",
                      },
                    ]}
                  >
                    <ThemedText style={styles.inputIcon}>📱</ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color:
                          colorScheme === "dark"
                            ? Colors.dark.text
                            : Colors.light.text,
                      },
                    ]}
                    placeholder="Enter mobile number"
                    placeholderTextColor={
                      colorScheme === "dark"
                        ? Colors.dark.textMuted
                        : Colors.light.textMuted
                    }
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  shadowColor: Colors.light.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.buttonGradient} />
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.backgroundCard}
                      style={{ marginRight: 8 }}
                    />
                    <ThemedText style={styles.primaryButtonText}>
                      Creating Account...
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.primaryButtonText}>
                      Get Started
                    </ThemedText>
                    <ThemedText style={styles.buttonEmoji}>🚀</ThemedText>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.backgroundAccent
                      : Colors.light.backgroundAccent,
                  borderColor:
                    colorScheme === "dark"
                      ? Colors.dark.border
                      : Colors.light.border,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={onOTPLogin || handleSignIn}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator
                    size="small"
                    color={
                      colorScheme === "dark"
                        ? Colors.dark.primaryLight
                        : Colors.light.primary
                    }
                    style={{ marginRight: 8 }}
                  />
                  <ThemedText
                    style={[
                      styles.secondaryButtonText,
                      {
                        color:
                          colorScheme === "dark"
                            ? Colors.dark.primaryLight
                            : Colors.light.primary,
                      },
                    ]}
                  >
                    Signing In...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText
                  style={[
                    styles.secondaryButtonText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.primaryLight
                          : Colors.light.primary,
                    },
                  ]}
                >
                  Already have an account? Sign In
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundAccent: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139, 69, 255, 0.08)",
  },
  backgroundAccent2: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  floatingOrbs: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(236, 72, 153, 0.04)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 60,
    zIndex: 2,
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 69, 255, 0.15)",
    zIndex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "300",
    marginBottom: 8,
    textAlign: "center",
  },
  brandWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandText: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.light.primary,
    textAlign: "center",
    textShadowColor: Colors.light.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandUnderline: {
    width: 80,
    height: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  taglineText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
  inputSection: {
    marginBottom: 40,
  },
  inputCard: {
    borderRadius: 24,
    padding: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 255, 0.1)",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  inputIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: "500",
  },
  buttonSection: {
    marginBottom: 50,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  buttonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
  },
  primaryButtonText: {
    color: Colors.light.backgroundCard,
    fontSize: 18,
    fontWeight: "600",
    zIndex: 1,
  },
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  featuresSection: {
    alignItems: "center",
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  featureCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    minWidth: width * 0.25,
    maxWidth: width * 0.28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 255, 0.1)",
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "400",
  },
  // Compact Hero Styles
  compactHeroContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 28,
    marginHorizontal: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  compactLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    marginRight: 20,
    position: "relative",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoRipple: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139, 69, 255, 0.1)",
    top: -8,
    left: -8,
  },
  compactLogoEmoji: {
    fontSize: 32,
    zIndex: 2,
  },
  compactTitleContainer: {
    flex: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  compactWelcomeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  compactBrandText: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.light.primary,
    textShadowColor: Colors.light.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compactTaglineText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  // Input Styles
  inputHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  inputHeaderText: {
    fontSize: 18,
    fontWeight: "600",
  },
  // Button Styles
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  buttonEmoji: {
    fontSize: 18,
    marginLeft: 8,
  },
  // Login Button Styles
  loginButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonEmoji: {
    fontSize: 16,
    marginLeft: 8,
  },
});
