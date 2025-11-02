import React, { useState } from "react";
import { Modal, View, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { modalStyles } from "../shared/SharedStyles";
import { ModernButton } from "../shared/ModernButton";
import { MaterialIcons } from "@expo/vector-icons";
import { MembershipFormModal } from "./MembershipFormModal";
import { router } from "expo-router";

interface BenefitsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (whatsappNumber?: string) => void;
}

const benefits = [
  {
    icon: "💬",
    text: "Unlimited English conversation partners on SpeakEdge Platform",
  },
  { icon: "🎯", text: "Daily English learning with fun" },
  { icon: "♾️", text: "Lifetime membership access" },
  { icon: "🏆", text: "Track progress with badges" },
  { icon: "🔔", text: "Be the first to get SpeakEdge updates" },
];

export const BenefitsModal: React.FC<BenefitsModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleInterestPress = () => {
    setShowMembershipForm(true);
  };

  const handleMembershipFormClose = () => {
    setShowMembershipForm(false);
    // Don't close the benefits modal here - let handleMembershipSuccess handle it
  };

  const handleMembershipSuccess = (whatsappNumber?: string) => {
    // Prevent multiple calls
    if (isClosing) return;
    setIsClosing(true);
    
    console.log("📋 BenefitsModal: Membership success, closing modals...");
    
    // Close both modals immediately
    setShowMembershipForm(false);
    onClose();
    
    // Use a longer delay to ensure complete modal cleanup before navigation
    setTimeout(() => {
      console.log("📋 BenefitsModal: Calling parent onSuccess...");
      if (onSuccess) {
        onSuccess(whatsappNumber);
      }
      setIsClosing(false);
    }, 400);
  };

  // Reset closing state when modal is opened
  React.useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modernModalOverlay}>
        <View
          style={[
            modalStyles.modernBenefitsModalContent,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              padding: 20,
              maxWidth: 360,
              maxHeight: "75%",
            },
          ]}
        >
          <View style={[modalStyles.modalHeader, { marginBottom: 12 }]}>
            <MaterialIcons
              name="celebration"
              size={28}
              color={Colors.light.primary}
            />
            <ThemedText style={[modalStyles.modalTitle, { fontSize: 20 }]}>
              Membership Benefits
            </ThemedText>
          </View>

          <ScrollView
            style={[
              modalStyles.benefitsScrollView,
              { maxHeight: 200, marginBottom: 12 },
            ]}
          >
            {benefits.map((benefit, index) => (
              <View
                key={index}
                style={[
                  modalStyles.modernBenefitItem,
                  { marginBottom: 12, padding: 12 },
                ]}
              >
                <View
                  style={[
                    modalStyles.benefitIcon,
                    {
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      marginRight: 12,
                    },
                  ]}
                >
                  <ThemedText
                    style={[modalStyles.benefitIconText, { fontSize: 16 }]}
                  >
                    {benefit.icon}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    modalStyles.modernBenefitText,
                    { fontSize: 14, lineHeight: 20 },
                  ]}
                >
                  {benefit.text}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              modalStyles.modernBenefitsButtonContainer,
              { gap: 12, marginTop: 12 },
            ]}
          >
            <ModernButton
              title="I'm Interested! ✨"
              onPress={handleInterestPress}
            />

            <ModernButton
              title="Skip for Now"
              onPress={onClose}
              variant="secondary"
            />
          </View>
        </View>
      </View>

      {/* Membership Form Modal */}
      <MembershipFormModal
        visible={showMembershipForm}
        onClose={handleMembershipFormClose}
        onSuccess={handleMembershipSuccess}
      />
    </Modal>
  );
};
