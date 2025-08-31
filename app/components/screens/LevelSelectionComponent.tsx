import React from "react";
import { View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles, optionStyles } from "../shared/SharedStyles";
import { SpeakingIndicator } from "../shared/SpeakingIndicator";
import { OptionCard } from "../shared/OptionCard";
import { ModernButton } from "../shared/ModernButton";
import { ScreenProps, Option } from "../types";

const levels: Option[] = [
  { name: "Beginner", emoji: "🌱", color: "#C4B5FD" },
  { name: "Elementary", emoji: "🌿", color: "#B794F6" },
  { name: "Intermediate", emoji: "🌳", color: "#A78BFA" },
  { name: "Upper Intermediate", emoji: "🏔️", color: "#9F67FF" },
  { name: "Advanced", emoji: "🚀", color: "#8B45FF" },
  { name: "Proficient", emoji: "👑", color: "#6B2FD6" },
];

interface LevelSelectionComponentProps extends ScreenProps {
  selectedLevel: string;
  onLevelSelect: (level: string) => void;
  isLoading?: boolean;
}

export const LevelSelectionComponent: React.FC<
  LevelSelectionComponentProps
> = ({
  onNext,
  selectedLevel,
  onLevelSelect,
  isSpeaking = true,
  isLoading = false,
}) => {
  return (
    <View style={sharedStyles.gradientContainer}>
      <View style={sharedStyles.gradientBackground} />
      <ScrollView
        contentContainerStyle={[
          sharedStyles.scrollContainer,
          { paddingBottom: 30 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View
          style={[
            sharedStyles.modernContainer,
            { padding: 20, paddingTop: 60, minHeight: 0 },
          ]}
        >
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <ThemedText
              style={[
                sharedStyles.modernStepTitle,
                { fontSize: 24, marginBottom: 8, marginTop: 60 },
              ]}
            >
              What's your English level?
            </ThemedText>
            <ThemedText
              style={{ fontSize: 16, opacity: 0.7, textAlign: "center" }}
            >
              Select your current proficiency level
            </ThemedText>
          </View>

          {/* AI Avatar Section */}
          {isSpeaking && (
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  padding: 2,
                  backgroundColor: "rgba(139, 69, 255, 0.1)",
                  shadowColor: "#8B45FF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("@/assets/images/ai-talk.gif")}
                    style={{ width: 76, height: 76, borderRadius: 38 }}
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
                </View>
              </View>
            </View>
          )}

          <SpeakingIndicator isVisible={isSpeaking} />

          <View
            style={[
              optionStyles.optionsGrid,
              {
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 24,
              },
            ]}
          >
            {levels.map((level) => (
              <View key={level.name} style={{ width: "31%" }}>
                <OptionCard
                  option={level}
                  isSelected={selectedLevel === level.name}
                  onPress={() => onLevelSelect(level.name)}
                  isCompact={true}
                />
              </View>
            ))}
          </View>

          <ModernButton
            title={isLoading ? "Updating..." : "Continue"}
            onPress={onNext}
            disabled={!selectedLevel || isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
};
