import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { ModernButton } from "../shared/ModernButton";
import { ApiService } from "@/app/services/apiService";
import { Plan as ApiPlan } from "@/app/types/api";

interface PaymentScreenComponentProps {
  plan: ApiPlan;
  onBack: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentScreenComponent: React.FC<PaymentScreenComponentProps> = ({
  plan,
  onBack,
  onPaymentSuccess,
}) => {
  const colorScheme = useColorScheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("upi");
  const successAnimation = new Animated.Value(0);

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: "account-balance", subtitle: "Google Pay, PhonePe, Paytm" },
    { id: "card", name: "Credit/Debit Card", icon: "credit-card", subtitle: "Visa, Mastercard, Amex" },
    { id: "netbanking", name: "Net Banking", icon: "account-balance", subtitle: "All major banks" },
    { id: "wallet", name: "Wallet", icon: "account-balance-wallet", subtitle: "Paytm, Amazon Pay" },
  ];

  useEffect(() => {
    if (paymentSuccess) {
      Animated.spring(successAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [paymentSuccess]);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      if (onOk) onOk();
    } else {
      if (onOk) {
        Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
      } else {
        Alert.alert(title, message);
      }
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment success - call backend to enroll user
      const enrollmentResponse = await ApiService.enrollUserInPlan(plan.id);

      if (enrollmentResponse.success) {
        console.log("✅ User enrolled in plan successfully");
        setPaymentSuccess(true);

        // Show success for 2 seconds, then navigate
        setTimeout(() => {
          showAlert(
            "Payment Successful! 🎉",
            `You've been enrolled in ${plan.name}. Enjoy your learning journey!`,
            () => {
              onPaymentSuccess();
            }
          );
        }, 1500);
      } else {
        throw new Error(enrollmentResponse.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Payment/Enrollment error:", error);
      showAlert(
        "Payment Failed",
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    const scale = successAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme ?? "light"].background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.light.primary + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <MaterialIcons
              name="check-circle"
              size={80}
              color={Colors.light.primary}
            />
          </View>
          <ThemedText
            style={{
              fontSize: 28,
              fontWeight: "700",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Payment Successful!
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 16,
              color: Colors[colorScheme ?? "light"].tabIconDefault,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            You've been enrolled in {plan.name}
          </ThemedText>
        </Animated.View>
      </View>
    );
  }

  const discount = plan.originalPrice && plan.originalPrice > plan.price
    ? plan.originalPrice - plan.price
    : 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: Colors.light.primary,
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={onBack}
            disabled={isProcessing}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <ThemedText
              style={{ fontSize: 24, fontWeight: "700", color: "#fff" }}
            >
              Complete Payment
            </ThemedText>
            <ThemedText
              style={{ fontSize: 14, color: "#fff", opacity: 0.9, marginTop: 4 }}
            >
              Secure checkout for {plan.name}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Summary Card */}
        <View
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: Colors.light.primary + "30",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.light.primary + "20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <MaterialIcons
                name="workspace-premium"
                size={28}
                color={Colors.light.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ fontSize: 20, fontWeight: "700", marginBottom: 4 }}
              >
                {plan.name}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                }}
              >
                {plan.validityMonths} month{plan.validityMonths > 1 ? "s" : ""} validity
              </ThemedText>
            </View>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault + "20",
              marginBottom: 16,
            }}
          />

          {/* Price Breakdown */}
          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 14,
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                }}
              >
                Plan Price
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors[colorScheme ?? "light"].text,
                }}
              >
                ₹{plan.originalPrice || plan.price}
              </ThemedText>
            </View>

            {discount > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 14,
                    color: Colors.light.primary,
                    fontWeight: "600",
                  }}
                >
                  Discount
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors.light.primary,
                  }}
                >
                  -₹{discount}
                </ThemedText>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: Colors[colorScheme ?? "light"].tabIconDefault + "20",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                Total Amount
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: Colors.light.primary,
                }}
              >
                ₹{plan.price}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Select Payment Method
        </ThemedText>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPaymentMethod(method.id)}
              disabled={isProcessing}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderRadius: 12,
                backgroundColor:
                  selectedPaymentMethod === method.id
                    ? Colors.light.primary + "15"
                    : Colors[colorScheme ?? "light"].background,
                borderWidth: 2,
                borderColor:
                  selectedPaymentMethod === method.id
                    ? Colors.light.primary
                    : Colors[colorScheme ?? "light"].tabIconDefault + "20",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    selectedPaymentMethod === method.id
                      ? Colors.light.primary + "20"
                      : Colors[colorScheme ?? "light"].tabIconDefault + "10",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={
                    selectedPaymentMethod === method.id
                      ? Colors.light.primary
                      : Colors[colorScheme ?? "light"].tabIconDefault
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  {method.name}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: Colors[colorScheme ?? "light"].tabIconDefault,
                  }}
                >
                  {method.subtitle}
                </ThemedText>
              </View>
              <MaterialIcons
                name={
                  selectedPaymentMethod === method.id
                    ? "radio-button-checked"
                    : "radio-button-unchecked"
                }
                size={24}
                color={
                  selectedPaymentMethod === method.id
                    ? Colors.light.primary
                    : Colors[colorScheme ?? "light"].tabIconDefault
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: Colors.light.primary + "10",
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <MaterialIcons
            name="security"
            size={20}
            color={Colors.light.primary}
            style={{ marginRight: 8 }}
          />
          <ThemedText
            style={{
              flex: 1,
              fontSize: 12,
              color: Colors.light.primary,
              lineHeight: 18,
            }}
          >
            Your payment is 100% secure. This is a mock payment for demo purposes.
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <ModernButton
            title={
              isProcessing
                ? "Processing Payment..."
                : `Pay ₹${plan.price} (Mock Payment)`
            }
            onPress={handlePayment}
            disabled={isProcessing}
          />
          {isProcessing && (
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <ThemedText
                style={{
                  fontSize: 12,
                  color: Colors[colorScheme ?? "light"].tabIconDefault,
                  marginTop: 8,
                }}
              >
                Please wait while we process your payment...
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
