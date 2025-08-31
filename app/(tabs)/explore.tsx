import React, { useState } from "react";
import { PlanList, CheckoutComponent } from "@/app/components";
import { Plan } from "@/app/types/api";
import { Alert } from "react-native";

export default function PlansScreen() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    console.log("Selected plan:", plan.name);
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
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
            setSelectedPlan(null);
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
            setSelectedPlan(null);
          },
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

  return <PlanList onPlanSelect={handlePlanSelect} showHeader={true} />;
}
