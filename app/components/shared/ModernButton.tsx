import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles } from "../shared/SharedStyles";

interface ModernButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  onPress,
  title,
  disabled = false,
  variant = "primary",
}) => {
  if (variant === "secondary") {
    return (
      <TouchableOpacity
        style={sharedStyles.modernSecondaryButton}
        onPress={onPress}
      >
        <ThemedText style={sharedStyles.modernSecondaryButtonText}>
          {title}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        sharedStyles.modernPrimaryButton,
        disabled && sharedStyles.modernDisabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={sharedStyles.buttonGradient} />
      <ThemedText style={sharedStyles.modernButtonText}>{title}</ThemedText>
    </TouchableOpacity>
  );
};
