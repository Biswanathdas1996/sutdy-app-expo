import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { PlanList, CheckoutComponent } from "@/app/components";
import { Plan } from "@/app/types/api";

interface PlanSelectionComponentProps {
  onPlanSelected?: (plan: Plan) => void;
  onContinue?: (selectedPlan: Plan) => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  enableCheckout?: boolean;
}

export const PlanSelectionComponent: React.FC<PlanSelectionComponentProps> = ({
  onPlanSelected,
  onContinue,
  onSkip,
  showSkipOption = false,
  enableCheckout = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    onPlanSelected?.(plan);

    if (enableCheckout) {
      // Navigate to checkout
      setShowCheckout(true);
    } else {
      // Show confirmation alert
      Alert.alert(
        "Plan Selected",
        `You've selected the ${plan.name} for ${plan.cost} INR. This plan includes ${plan.features.length} features and is valid for ${plan.duration} days.`,
        [
          {
            text: "Change",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => handleContinue(plan),
          },
        ]
      );
    }
  };

  const handleContinue = (plan: Plan) => {
    if (onContinue) {
      onContinue(plan);
    } else {
      // Default behavior - show plan details
      Alert.alert(
        "Plan Confirmed",
        `Thank you for selecting ${plan.name}! Redirecting to payment...`,
        [{ text: "OK" }]
      );
    }
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const handlePaymentSuccess = (plan: Plan, finalAmount: number) => {
    Alert.alert(
      "Payment Successful!",
      `Thank you for purchasing ${plan.name} for ₹${finalAmount.toLocaleString(
        "en-IN"
      )}. Your plan is now active!`,
      [
        {
          text: "OK",
          onPress: () => {
            setShowCheckout(false);
            onContinue?.(plan);
          },
        },
      ]
    );
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      "Payment Cancelled",
      "Your payment was cancelled. You can try again anytime.",
      [
        {
          text: "OK",
          onPress: () => {
            setShowCheckout(false);
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Plan Selection",
      "You can always select a plan later from your profile.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          onPress: onSkip,
        },
      ]
    );
  };

  if (showCheckout && selectedPlan) {
    return (
      <CheckoutComponent
        plan={selectedPlan}
        onBack={handleBackFromCheckout}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <PlanList
          onPlanSelect={handlePlanSelect}
          selectedPlanId={selectedPlan?.id}
          showHeader={true}
        />

        {showSkipOption && (
          <View style={styles.skipContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
  },
  skipContainer: {
    padding: 20,
    paddingTop: 10,
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#BDC3C7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#7F8C8D",
    fontSize: 16,
    fontWeight: "500",
  },
});
