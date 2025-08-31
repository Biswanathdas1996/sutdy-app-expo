import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { optionStyles } from "../shared/SharedStyles";
import { Option } from "../types";

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  onPress: () => void;
  isLarge?: boolean;
  isCompact?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isSelected,
  onPress,
  isLarge = false,
  isCompact = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        optionStyles.modernOptionCard,
        isLarge && optionStyles.largeOptionCard,
        isCompact && optionStyles.compactOptionCard,
        isSelected && optionStyles.modernSelectedOption,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          optionStyles.optionEmoji,
          isLarge && optionStyles.largeOptionEmoji,
          isCompact && optionStyles.compactOptionEmoji,
          { backgroundColor: option.color + "20" },
        ]}
      >
        <ThemedText
          style={[
            optionStyles.optionEmojiText,
            isLarge && optionStyles.largeEmojiText,
            isCompact && optionStyles.compactEmojiText,
          ]}
        >
          {option.emoji}
        </ThemedText>
      </View>
      <ThemedText
        style={[
          optionStyles.modernOptionText,
          isLarge && optionStyles.largeOptionText,
          isCompact && optionStyles.compactOptionText,
          isSelected && optionStyles.modernSelectedOptionText,
          !isSelected && { color: "#333333" }, // Ensure good contrast for unselected text
        ]}
        numberOfLines={isCompact ? 2 : undefined}
        ellipsizeMode={isCompact ? "tail" : undefined}
      >
        {option.name}
      </ThemedText>
      {isSelected && (
        <View
          style={[
            optionStyles.selectedCheckmark,
            isCompact && {
              width: 16,
              height: 16,
              borderRadius: 8,
              top: 4,
              right: 4,
            },
          ]}
        >
          <ThemedText
            style={[optionStyles.checkmarkText, isCompact && { fontSize: 9 }]}
          >
            ✓
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};
