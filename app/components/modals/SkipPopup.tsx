import React from "react";
import { Modal, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { modalStyles } from "../shared/SharedStyles";
import { ModernButton } from "../shared/ModernButton";
import { MaterialIcons } from "@expo/vector-icons";

interface SkipPopupProps {
  visible: boolean;
  onClose: () => void;
  onViewBenefits: () => void;
}

export const SkipPopup: React.FC<SkipPopupProps> = ({
  visible,
  onClose,
  onViewBenefits,
}) => {
  const colorScheme = useColorScheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modernModalOverlay}>
        <View
          style={[
            modalStyles.modernModalContent,
            { backgroundColor: Colors[colorScheme ?? "light"].background },
          ]}
        >
          <View style={modalStyles.modalHeader}>
            <MaterialIcons
              name="card-giftcard"
              size={48}
              color="#8B45FF"
              style={{ marginBottom: 12 }}
            />
            <ThemedText style={modalStyles.modalTitle}>
              Limited Time Offer!
            </ThemedText>
          </View>

          <ThemedText style={modalStyles.modernPopupText}>
            Claim 100% free SpeakEdge lifetime membership – Limited time offer –
            Grab it now. Save ₹999 with 100% free.
          </ThemedText>

          <View style={modalStyles.modernPopupButtonContainer}>
            <ModernButton
              title="View Benefits"
              onPress={() => {
                onClose();
                onViewBenefits();
              }}
            />
            <ModernButton
              title="Skip for Now"
              onPress={onClose}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
