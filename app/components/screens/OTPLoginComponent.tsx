import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ScreenProps } from "../types";
import { AuthService } from "@/app/services/authService";

interface OTPLoginComponentProps extends ScreenProps {
  onSignUpRedirect: () => void;
  onLoginSuccess?: () => void;
}

export const OTPLoginComponent: React.FC<OTPLoginComponentProps> = ({
  onNext,
  onSignUpRedirect,
  onLoginSuccess,
}) => {
  const colorScheme = useColorScheme();
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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
    if (!mobileNumber.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return false;
    }

    // More flexible mobile number validation - at least 10 digits
    const cleanMobile = mobileNumber.replace(/\D/g, ""); // Remove all non-digits
    if (cleanMobile.length < 10) {
      Alert.alert(
        "Error",
        "Please enter a valid mobile number (at least 10 digits)"
      );
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      console.log("Starting OTP login process...", {
        mobileNumber: mobileNumber.trim(),
        otp: "1234", // Static OTP value
      });

      const result = await AuthService.loginWithOTP({
        mobileNumber: mobileNumber.trim(),
        otp: "1234", // Static OTP value
      });

      console.log("OTP login result:", result);

      if (result.success) {
        console.log("OTP login successful, navigating to profile...");
        Alert.alert("Success", result.message, [
          {
            text: "OK",
            onPress: () => {
              console.log("User pressed OK, navigating to profile");
              if (onLoginSuccess) {
                onLoginSuccess();
              } else {
                onNext();
              }
            },
          },
        ]);
      } else {
        console.log("OTP login failed:", result.message);
        Alert.alert("Login Failed", result.message);
      }
    } catch (error) {
      console.error("OTP login error:", error);
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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View
              style={[
                styles.headerContainer,
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
                  styles.iconCircle,
                  {
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(139, 69, 255, 0.2)"
                        : "rgba(139, 69, 255, 0.15)",
                  },
                ]}
              >
                <ThemedText style={styles.iconEmoji}>🔐</ThemedText>
              </View>

              <View style={styles.titleContainer}>
                <ThemedText
                  style={[
                    styles.titleText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.text
                          : Colors.light.text,
                    },
                  ]}
                >
                  Welcome Back!
                </ThemedText>
                <ThemedText
                  style={[
                    styles.subtitleText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.textSecondary
                          : Colors.light.textSecondary,
                    },
                  ]}
                >
                  Sign in with your mobile number �
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
              {/* Mobile Number Input */}
              <View style={styles.inputGroup}>
                <ThemedText
                  style={[
                    styles.inputLabel,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.textSecondary
                          : Colors.light.textSecondary,
                    },
                  ]}
                >
                  Mobile Number
                </ThemedText>
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
                    placeholder="Enter your mobile number"
                    placeholderTextColor={
                      colorScheme === "dark"
                        ? Colors.dark.textMuted
                        : Colors.light.textMuted
                    }
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
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
              onPress={handleLogin}
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
                      Signing In...
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.primaryButtonText}>
                      Sign In
                    </ThemedText>
                    <ThemedText style={styles.buttonEmoji}>🔑</ThemedText>
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
              onPress={onSignUpRedirect}
              activeOpacity={0.7}
              disabled={isLoading}
            >
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
                Don't have an account? Sign Up
              </ThemedText>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    marginRight: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconEmoji: {
    fontSize: 32,
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  primaryButtonText: {
    color: Colors.light.backgroundCard,
    fontSize: 18,
    fontWeight: "600",
    zIndex: 1,
  },
  buttonEmoji: {
    fontSize: 18,
    marginLeft: 8,
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
});
