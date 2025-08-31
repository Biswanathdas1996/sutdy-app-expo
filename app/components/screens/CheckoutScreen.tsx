import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { CheckoutComponent } from "@/app/components";
import { Plan } from "@/app/types/api";
import { useLocalSearchParams, router } from "expo-router";

export default function CheckoutScreen() {
  const { plan: planParam } = useLocalSearchParams();

  // Parse the plan from the stringified JSON parameter
  const plan: Plan = React.useMemo(() => {
    try {
      return JSON.parse(planParam as string);
    } catch (error) {
      console.error("Error parsing plan parameter:", error);
      // Fallback to a default plan or navigate back
      router.back();
      return null;
    }
  }, [planParam]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Invalid plan data</Text>
      </SafeAreaView>
    );
  }

  const handlePaymentSuccess = (plan: Plan, finalAmount: number) => {
    // Navigate to success screen or back to plans
    router.push({
      pathname: "/components/screens/PaymentSuccessScreen",
      params: {
        plan: JSON.stringify(plan),
        finalAmount: finalAmount.toString(),
      },
    });
  };

  const handlePaymentCancel = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <CheckoutComponent
      plan={plan}
      onBack={handleBack}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentCancel={handlePaymentCancel}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
  },
});
