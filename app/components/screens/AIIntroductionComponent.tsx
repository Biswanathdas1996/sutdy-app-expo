import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles } from "../shared/SharedStyles";
import { SpeakingIndicator } from "../shared/SpeakingIndicator";
import { ScreenProps } from "../types";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

interface AIIntroductionComponentProps extends ScreenProps {
  name: string;
}

export const AIIntroductionComponent: React.FC<
  AIIntroductionComponentProps
> = ({ onNext, name, isSpeaking = false }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");
  const primaryDarkColor = useThemeColor({}, "primaryDark");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const shadowColor = useThemeColor({}, "shadow");
  const backgroundCardColor = useThemeColor({}, "backgroundCard");

  // Animation for talking effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSpeaking) {
      // Scale animation for talking effect
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      // Pulse animation for glow effect
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      scaleAnimation.start();
      pulseAnimation.start();

      return () => {
        scaleAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Reset animations when not speaking
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking, scaleAnim, pulseAnim]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={[
          `rgba(139, 69, 255, ${colorScheme === "dark" ? "0.05" : "0.03"})`,
          `rgba(139, 69, 255, ${colorScheme === "dark" ? "0.12" : "0.08"})`,
        ]}
        style={styles.gradientBackground}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.aiAvatarWrapper}>
              <Animated.View
                style={[
                  styles.aiAvatarGlow,
                  {
                    backgroundColor: `rgba(139, 69, 255, ${
                      colorScheme === "dark" ? "0.25" : "0.15"
                    })`,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <View
                style={[
                  styles.aiAvatarGlowOuter,
                  {
                    backgroundColor: `rgba(139, 69, 255, ${
                      colorScheme === "dark" ? "0.08" : "0.05"
                    })`,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.aiAvatar,
                  {
                    shadowColor,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[primaryColor, primaryDarkColor]}
                  style={styles.avatarGradientBorder}
                >
                  <View style={styles.avatarImageContainer}>
                    {/* Show animated GIF only when speaking */}
                    {isSpeaking ? (
                      <Image
                        source={require("@/assets/images/ai-talk.gif")}
                        style={styles.avatarImage}
                        contentFit="cover"
                        transition={200}
                        placeholder={{
                          blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
                        }}
                        onError={(error) =>
                          console.log("Image loading error:", error)
                        }
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      // Static placeholder when not speaking
                      <View
                        style={[
                          styles.avatarImagePlaceholder,
                          { backgroundColor: `rgba(139, 69, 255, 0.2)` },
                        ]}
                      >
                        <ThemedText style={styles.avatarPlaceholderText}>
                          🤖
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {isSpeaking && (
                    <View style={styles.speakingOverlay}>
                      <View
                        style={[
                          styles.speakingIndicatorDot,
                          { backgroundColor: primaryColor },
                        ]}
                      />
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            </View>

            <View style={styles.titleSection}>
              <View style={styles.subtitleContainer}>
                <ThemedText
                  style={[styles.aiSubtitle, { color: textSecondaryColor }]}
                >
                  Your AI English Tutor
                </ThemedText>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: `rgba(139, 69, 255, ${
                        colorScheme === "dark" ? "0.15" : "0.1"
                      })`,
                      borderColor: `rgba(139, 69, 255, ${
                        colorScheme === "dark" ? "0.3" : "0.2"
                      })`,
                    },
                  ]}
                >
                  <ThemedText
                    style={[styles.badgeText, { color: primaryColor }]}
                  >
                    AI Powered
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Speech Bubble Section */}
          <View style={styles.speechSection}>
            <View style={styles.speechBubble}>
              <View
                style={[
                  styles.speechBubbleArrow,
                  {
                    backgroundColor: backgroundCardColor,
                    borderColor: `rgba(139, 69, 255, ${
                      colorScheme === "dark" ? "0.15" : "0.1"
                    })`,
                  },
                ]}
              />
              <LinearGradient
                colors={[backgroundCardColor, backgroundCardColor]}
                style={[
                  styles.speechBubbleGradient,
                  {
                    shadowColor: shadowColor,
                    borderColor: `rgba(139, 69, 255, ${
                      colorScheme === "dark" ? "0.15" : "0.1"
                    })`,
                  },
                ]}
              >
                <ThemedText style={[styles.speechText, { color: textColor }]}>
                  Hello there, {name}! It's wonderful to meet you. My name is
                  Rose, and I'm absolutely thrilled to be your personal AI
                  English tutor. I'm here to help you discover the joy of
                  learning English through carefully designed, personalized
                  lessons and engaging practice sessions that are tailored just
                  for you. Are you ready to embark on this exciting learning
                  adventure together?
                </ThemedText>
              </LinearGradient>
            </View>

            <SpeakingIndicator isVisible={isSpeaking} />
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.primaryButton, { shadowColor }]}
              onPress={onNext}
            >
              <LinearGradient
                colors={[primaryColor, primaryDarkColor]}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.primaryButtonText}>
                  Let's Begin! 🚀
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  aiAvatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  aiAvatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 3,
    overflow: "hidden",
  },
  avatarGradientBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 152,
    height: 152,
    borderRadius: 76,
  },
  avatarImageContainer: {
    width: 152,
    height: 152,
    borderRadius: 76,
    overflow: "hidden",
  },
  avatarImagePlaceholder: {
    width: 152,
    height: 152,
    borderRadius: 76,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    textAlign: "center",
    lineHeight: 60,
    includeFontPadding: false,
  },
  speakingOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  speakingIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiAvatarGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    zIndex: 2,
  },
  aiAvatarGlowOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    zIndex: 1,
  },
  titleSection: {
    alignItems: "center",
  },
  aiIntroTitle: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    alignItems: "center",
    flexDirection: "column",
    marginTop: 20,
  },
  aiSubtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  speechSection: {
    marginBottom: 40,
  },
  speechBubble: {
    position: "relative",
    marginBottom: 30,
  },
  speechBubbleArrow: {
    position: "absolute",
    top: -8,
    left: "50%",
    marginLeft: -8,
    width: 16,
    height: 16,
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  speechBubbleGradient: {
    padding: 28,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
  },
  speechText: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    fontWeight: "400",
  },
  actionSection: {
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    marginBottom: 32,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featuresPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
});
