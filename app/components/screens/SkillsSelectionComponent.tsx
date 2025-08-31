import React from "react";
import { View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles, optionStyles } from "../shared/SharedStyles";
import { SpeakingIndicator } from "../shared/SpeakingIndicator";
import { OptionCard } from "../shared/OptionCard";
import { ModernButton } from "../shared/ModernButton";
import { ScreenProps, Option } from "../types";

const skills: Option[] = [
  { name: "Speaking", emoji: "🗣️", color: "#8B45FF" },
  { name: "Writing", emoji: "✍️", color: "#A78BFA" },
  { name: "Reading", emoji: "📖", color: "#9F67FF" },
  { name: "Listening", emoji: "👂", color: "#B794F6" },
  { name: "Pronunciation", emoji: "🎤", color: "#A78BFA" },
  { name: "All", emoji: "🎯", color: "#8B45FF" },
  { name: "Other", emoji: "💡", color: "#C4B5FD" },
];

interface SkillsSelectionComponentProps extends ScreenProps {
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
}

export const SkillsSelectionComponent: React.FC<
  SkillsSelectionComponentProps
> = ({ onNext, selectedSkills, onSkillToggle, isSpeaking = false }) => {
  return (
    <View style={sharedStyles.gradientContainer}>
      <View style={sharedStyles.gradientBackground} />
      <ScrollView
        contentContainerStyle={sharedStyles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={sharedStyles.modernContainer}>
          <ThemedText
            style={[
              sharedStyles.modernStepTitle,
              { fontSize: 24, marginBottom: 8, marginTop: 80 },
            ]}
          >
            Which skills do you want to focus on?
          </ThemedText>
          <ThemedText style={sharedStyles.stepSubtitle}>
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
                gap: 10,
                marginBottom: 20,
                justifyContent: "space-between",
              },
            ]}
          >
            {skills.map((skill) => (
              <View key={skill.name} style={{ width: "31%" }}>
                <OptionCard
                  key={skill.name}
                  option={skill}
                  isCompact={true}
                  isSelected={selectedSkills.includes(skill.name)}
                  onPress={() => onSkillToggle(skill.name)}
                />
              </View>
            ))}
          </View>

          <ModernButton
            title="Continue"
            onPress={onNext}
            disabled={selectedSkills.length === 0}
          />
        </View>
      </ScrollView>
    </View>
  );
};
