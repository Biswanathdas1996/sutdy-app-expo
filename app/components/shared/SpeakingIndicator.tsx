import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles } from "../shared/SharedStyles";

interface SpeakingIndicatorProps {
  isVisible: boolean;
  text?: string;
}

export const SpeakingIndicator: React.FC<SpeakingIndicatorProps> = ({
  isVisible,
  text = "Rose is speaking...",
}) => {
  if (!isVisible) return null;

  return (
    <View style={sharedStyles.modernSpeakingIndicator}>
      <View style={sharedStyles.soundWave}>
        <View style={[sharedStyles.wave, sharedStyles.wave1]} />
        <View style={[sharedStyles.wave, sharedStyles.wave2]} />
        <View style={[sharedStyles.wave, sharedStyles.wave3]} />
      </View>
      <ThemedText style={sharedStyles.modernSpeakingText}>{text}</ThemedText>
    </View>
  );
};
