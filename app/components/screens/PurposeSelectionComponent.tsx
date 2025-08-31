import React from "react";
import { View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles, optionStyles } from "../shared/SharedStyles";
import { SpeakingIndicator } from "../shared/SpeakingIndicator";
import { OptionCard } from "../shared/OptionCard";
import { ModernButton } from "../shared/ModernButton";
import { ScreenProps, Option } from "../types";

const purposes: Option[] = [
  { name: "Job/Business", emoji: "💼", color: "#8B45FF" },
  { name: "Abroad", emoji: "✈️", color: "#A78BFA" },
  { name: "Improve skills", emoji: "📈", color: "#9F67FF" },
  { name: "Academic", emoji: "🎓", color: "#8B45FF" },
  { name: "Practise", emoji: "🗣️", color: "#B794F6" },
  { name: "Pronunciation", emoji: "🎤", color: "#A78BFA" },
  { name: "CEFR Test", emoji: "📊", color: "#9F67FF" },
  { name: "Other", emoji: "💡", color: "#C4B5FD" },
];

interface PurposeSelectionComponentProps extends ScreenProps {
  selectedPurposes: string[];
  onPurposeToggle: (purpose: string) => void;
  isLoading?: boolean;
}

export const PurposeSelectionComponent: React.FC<
  PurposeSelectionComponentProps
> = ({
  onNext,
  selectedPurposes,
  onPurposeToggle,
  isSpeaking = false,
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
            { padding: 20, minHeight: "auto" },
          ]}
        >
          <ThemedText
            style={[
              sharedStyles.modernStepTitle,
              { fontSize: 24, marginBottom: 8, marginTop: 80 },
            ]}
          >
            Why learn English?
          </ThemedText>
          <ThemedText
            style={[
              sharedStyles.stepSubtitle,
              { fontSize: 14, marginBottom: 20 },
            ]}
          >
            Select all that apply
          </ThemedText>

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
                gap: 6,
                marginBottom: 20,
                justifyContent: "space-between",
              },
            ]}
          >
            {purposes.map((purpose) => (
              <View key={purpose.name} style={{ width: "31%" }}>
                <OptionCard
                  option={purpose}
                  isSelected={selectedPurposes.includes(purpose.name)}
                  onPress={() => onPurposeToggle(purpose.name)}
                  isCompact={true}
                />
              </View>
            ))}
          </View>

          <ModernButton
            title={isLoading ? "Saving..." : "Continue"}
            onPress={onNext}
            disabled={selectedPurposes.length === 0 || isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
};
