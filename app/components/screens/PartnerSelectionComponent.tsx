import React from "react";
import { View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { sharedStyles, optionStyles } from "../shared/SharedStyles";
import { SpeakingIndicator } from "../shared/SpeakingIndicator";
import { OptionCard } from "../shared/OptionCard";
import { ModernButton } from "../shared/ModernButton";
import { ScreenProps, Option } from "../types";

const options: Option[] = [
  { name: "Yes", emoji: "👥", color: "#8B45FF" },
  { name: "No", emoji: "🚫", color: "#A78BFA" },
  { name: "Other", emoji: "🤔", color: "#B794F6" },
];

interface PartnerSelectionComponentProps extends ScreenProps {
  selectedPartner: string;
  onPartnerSelect: (partner: string) => void;
}

export const PartnerSelectionComponent: React.FC<
  PartnerSelectionComponentProps
> = ({ onNext, selectedPartner, onPartnerSelect, isSpeaking = false }) => {
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
              { padding: 20, paddingTop: 80, minHeight: 0 },
            ]}
          >
            Speaking Partner
          </ThemedText>
          <ThemedText style={sharedStyles.stepSubtitle}>
            Are you interested in having a speaking partner?
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
            {options.map((option) => (
              <View key={option.name} style={{ width: "31%" }}>
                <OptionCard
                  key={option.name}
                  option={option}
                  isSelected={selectedPartner === option.name}
                  onPress={() => onPartnerSelect(option.name)}
                  isCompact={true}
                />
              </View>
            ))}
          </View>

          <ModernButton
            title="Continue"
            onPress={onNext}
            disabled={!selectedPartner}
          />
        </View>
      </ScrollView>
    </View>
  );
};
