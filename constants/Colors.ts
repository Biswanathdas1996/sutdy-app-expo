/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Unified SpeakEdge Color Palette
const primaryPurple = "#8B45FF";
const primaryPurpleDark = "#6B2FD6";
const primaryPurpleLight = "#A78BFA";

const tintColorLight = primaryPurple;
const tintColorDark = primaryPurpleLight;

export const Colors = {
  light: {
    text: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    background: "#FAFBFF",
    backgroundCard: "#FFFFFF",
    backgroundAccent: "rgba(139, 69, 255, 0.06)",
    tint: tintColorLight,
    primary: primaryPurple,
    primaryDark: primaryPurpleDark,
    primaryLight: primaryPurpleLight,
    icon: "#6B7280",
    tabIconDefault: "#6B7280",
    tabIconSelected: tintColorLight,
    border: "rgba(139, 69, 255, 0.15)",
    shadow: "rgba(139, 69, 255, 0.3)",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#E5E7EB",
    textMuted: "#9CA3AF",
    background: "#0A0A1A",
    backgroundCard: "rgba(17, 24, 39, 0.95)",
    backgroundAccent: "rgba(139, 69, 255, 0.08)",
    tint: tintColorDark,
    primary: primaryPurple,
    primaryDark: primaryPurpleDark,
    primaryLight: primaryPurpleLight,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    border: "rgba(139, 69, 255, 0.2)",
    shadow: "rgba(139, 69, 255, 0.4)",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
  },
};
