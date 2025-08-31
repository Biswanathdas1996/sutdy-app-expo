import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plan } from "@/app/types/api";
import { ApiService } from "@/app/services/apiService";
import { RazorpayService } from "@/app/services/razorpayService";
import { AuthService } from "@/app/services/authService";

const { width } = Dimensions.get("window");

interface CheckoutComponentProps {
  plan: Plan;
  onBack: () => void;
  onPaymentSuccess?: (plan: Plan, finalAmount: number) => void;
  onPaymentCancel?: () => void;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
}

export const CheckoutComponent: React.FC<CheckoutComponentProps> = ({
  plan,
  onBack,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(parseFloat(plan.cost));
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  useEffect(() => {
    calculateFinalAmount();
  }, [appliedCoupon, plan.cost]);

  const calculateFinalAmount = () => {
    const originalAmount = parseFloat(plan.cost);

    if (!appliedCoupon) {
      setFinalAmount(originalAmount);
      return;
    }

    let discount = 0;
    if (appliedCoupon.discountType === "percentage") {
      discount = (originalAmount * appliedCoupon.discount) / 100;
      if (appliedCoupon.maxDiscount) {
        discount = Math.min(discount, appliedCoupon.maxDiscount);
      }
    } else {
      discount = appliedCoupon.discount;
    }

    const newAmount = Math.max(0, originalAmount - discount);
    setFinalAmount(newAmount);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const formatDuration = (days: number) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? "Month" : "Months"}`;
    }
    return `${days} ${days === 1 ? "Day" : "Days"}`;
  };

  const getGradientColors = (planName: string): [string, string] => {
    const name = planName.toLowerCase();
    if (name.includes("gold")) return ["#FFD700", "#FFA500"];
    if (name.includes("diamond")) return ["#B9F2FF", "#404040"];
    if (name.includes("silver")) return ["#C0C0C0", "#808080"];
    if (name.includes("basic")) return ["#90EE90", "#32CD32"];
    if (name.includes("starter")) return ["#DDA0DD", "#9370DB"];
    return ["#4A90E2", "#357ABD"];
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }

    setCouponLoading(true);

    try {
      // Try to validate coupon via API first
      try {
        const response = await ApiService.validateCoupon(
          couponCode,
          plan.id,
          parseFloat(plan.cost)
        );

        if (response.isValid && response.coupon) {
          setAppliedCoupon(response.coupon);
          Alert.alert(
            "Success",
            `Coupon "${response.coupon.code}" applied successfully!`
          );
          return;
        }
      } catch (apiError) {
        console.log("API coupon validation failed, falling back to mock data");
      }

      // Fallback to mock coupon validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock coupon validation logic
      const mockCoupons: Coupon[] = [
        {
          id: "1",
          code: "WELCOME10",
          discount: 10,
          discountType: "percentage",
          maxDiscount: 500,
          isActive: true,
        },
        {
          id: "2",
          code: "SAVE100",
          discount: 100,
          discountType: "fixed",
          minAmount: 500,
          isActive: true,
        },
        {
          id: "3",
          code: "FIRST50",
          discount: 50,
          discountType: "fixed",
          isActive: true,
        },
      ];

      const coupon = mockCoupons.find(
        (c) => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive
      );

      if (!coupon) {
        Alert.alert(
          "Invalid Coupon",
          "The coupon code you entered is not valid or has expired."
        );
        return;
      }

      if (coupon.minAmount && parseFloat(plan.cost) < coupon.minAmount) {
        Alert.alert(
          "Minimum Amount Required",
          `This coupon requires a minimum purchase of ₹${coupon.minAmount}`
        );
        return;
      }

      setAppliedCoupon(coupon);
      Alert.alert("Success", `Coupon "${coupon.code}" applied successfully!`);
    } catch (error) {
      console.error("Coupon validation error:", error);
      Alert.alert("Error", "Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const proceedToPayment = async () => {
    setPaymentLoading(true);

    try {
      // Check if we're running on a platform that supports Razorpay
      if (Platform.OS === 'web') {
        Alert.alert(
          "Web Platform Detected",
          "Razorpay payment is not supported on web. Would you like to simulate a successful payment?",
          [
            { text: "Cancel", onPress: onPaymentCancel },
            { 
              text: "Simulate Payment", 
              onPress: () => {
                Alert.alert(
                  "Simulated Payment Successful",
                  `Your simulated payment of ${formatPrice(finalAmount)} has been processed successfully!`,
                  [
                    {
                      text: "Continue",
                      onPress: () => {
                        onPaymentSuccess?.(plan, finalAmount);
                      },
                    },
                  ]
                );
              }
            },
          ]
        );
        return;
      }

      // Get user details for payment
      const session = await AuthService.getCurrentSession();
      const userDetails = {
        name: session?.user?.fullName || 'Guest User',
        email: `${session?.user?.mobileNumber || 'guest'}@example.com`, // You might want to collect email separately
        contact: session?.user?.mobileNumber || '',
      };

      console.log('Starting Razorpay payment with details:', userDetails);

      // Validate Razorpay configuration
      if (!RazorpayService.validateConfig()) {
        Alert.alert(
          "Configuration Error",
          "Payment service is not properly configured. Would you like to simulate a successful payment for testing?",
          [
            { text: "Cancel", onPress: onPaymentCancel },
            { 
              text: "Simulate Payment", 
              onPress: () => {
                Alert.alert(
                  "Test Payment Successful",
                  `Your test payment of ${formatPrice(finalAmount)} has been processed successfully!\n\nNote: This is a simulated payment for testing purposes.`,
                  [
                    {
                      text: "Continue",
                      onPress: () => {
                        onPaymentSuccess?.(plan, finalAmount);
                      },
                    },
                  ]
                );
              }
            },
          ]
        );
        return;
      }

      // Process payment with Razorpay
      const paymentResult = await RazorpayService.processPayment(
        plan,
        finalAmount,
        userDetails,
        appliedCoupon?.code
      );

      if (paymentResult.success) {
        Alert.alert(
          "Payment Successful! 🎉",
          `Your payment of ${formatPrice(finalAmount)} has been processed successfully!\n\nPayment ID: ${paymentResult.paymentId}`,
          [
            {
              text: "Continue",
              onPress: () => {
                onPaymentSuccess?.(plan, finalAmount);
              },
            },
          ]
        );
      } else {
        // Payment failed or was cancelled
        Alert.alert(
          "Payment Failed",
          paymentResult.error || "There was an error processing your payment. Please try again.",
          [
            { text: "Cancel", onPress: onPaymentCancel },
            { text: "Retry", onPress: proceedToPayment },
          ]
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      
      // Fallback to mock payment for development/testing
      Alert.alert(
        "Payment Service Error",
        "Unable to connect to payment service. Would you like to simulate a successful payment for testing?",
        [
          { text: "Cancel", onPress: onPaymentCancel },
          { 
            text: "Simulate Success", 
            onPress: () => {
              Alert.alert(
                "Mock Payment Successful",
                `Your simulated payment of ${formatPrice(finalAmount)} has been processed successfully!`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onPaymentSuccess?.(plan, finalAmount);
                    },
                  },
                ]
              );
            }
          },
          { text: "Retry Real Payment", onPress: proceedToPayment },
        ]
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const calculateSavings = () => {
    if (!appliedCoupon) return 0;
    return parseFloat(plan.cost) - finalAmount;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Summary</Text>
          <View style={styles.planSummaryCard}>
            <LinearGradient
              colors={getGradientColors(plan.name)}
              style={styles.planGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDuration}>
                  {formatDuration(plan.duration)}
                </Text>
              </View>
              <Text style={styles.planPrice}>
                {formatPrice(parseFloat(plan.cost))}
              </Text>
            </LinearGradient>

            <View style={styles.planDetails}>
              <Text style={styles.featuresTitle}>Included Features:</Text>
              {plan.features.map((feature, index) => (
                <View key={feature.id} style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <View style={styles.couponCard}>
            {!appliedCoupon ? (
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                <TouchableOpacity
                  style={[
                    styles.applyCouponButton,
                    couponLoading && styles.disabledButton,
                  ]}
                  onPress={applyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyCouponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.appliedCouponContainer}>
                <View style={styles.appliedCouponInfo}>
                  <Text style={styles.appliedCouponCode}>
                    "{appliedCoupon.code}" Applied
                  </Text>
                  <Text style={styles.appliedCouponDiscount}>
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discount}% OFF`
                      : `₹${appliedCoupon.discount} OFF`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeCouponButton}
                  onPress={removeCoupon}
                >
                  <Text style={styles.removeCouponButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.couponSuggestions}>
              <Text style={styles.suggestionsTitle}>Available Coupons:</Text>
              <Text style={styles.suggestionItem}>
                • WELCOME10 - 10% off (max ₹500)
              </Text>
              <Text style={styles.suggestionItem}>
                • SAVE100 - ₹100 off (min ₹500)
              </Text>
              <Text style={styles.suggestionItem}>• FIRST50 - ₹50 off</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethodsCard}>
            <Text style={styles.paymentMethodsTitle}>
              Secure Payment via Razorpay
            </Text>
            <Text style={styles.paymentMethodsSubtitle}>
              We accept all major payment methods:
            </Text>
            
            <View style={styles.paymentMethodsList}>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <Text style={styles.paymentMethodText}>Credit & Debit Cards</Text>
              </View>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>🏦</Text>
                <Text style={styles.paymentMethodText}>Net Banking</Text>
              </View>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>📱</Text>
                <Text style={styles.paymentMethodText}>UPI & Digital Wallets</Text>
              </View>
              <View style={styles.paymentMethodItem}>
                <Text style={styles.paymentMethodIcon}>💰</Text>
                <Text style={styles.paymentMethodText}>EMI & Pay Later</Text>
              </View>
            </View>

            <View style={styles.securityInfo}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                256-bit SSL encrypted. Your payment information is secure.
              </Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Plan Cost</Text>
              <Text style={styles.priceValue}>
                {formatPrice(parseFloat(plan.cost))}
              </Text>
            </View>

            {appliedCoupon && (
              <View style={styles.priceRow}>
                <Text style={styles.discountLabel}>Coupon Discount</Text>
                <Text style={styles.discountValue}>
                  -{formatPrice(calculateSavings())}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatPrice(finalAmount)}</Text>
            </View>

            {appliedCoupon && (
              <Text style={styles.savingsText}>
                You save {formatPrice(calculateSavings())}!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            paymentLoading && styles.disabledButton,
          ]}
          onPress={proceedToPayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.checkoutButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.payButtonContent}>
              <Text style={styles.checkoutButtonText}>
                Pay {formatPrice(finalAmount)}
              </Text>
              <Text style={styles.paymentProviderText}>via Razorpay</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  planSummaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  planDuration: {
    fontSize: 14,
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  planDetails: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#34495E",
    flex: 1,
  },
  couponCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  couponInputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  applyCouponButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  applyCouponButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  appliedCouponContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  appliedCouponInfo: {
    flex: 1,
  },
  appliedCouponCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#27AE60",
  },
  appliedCouponDiscount: {
    fontSize: 14,
    color: "#27AE60",
  },
  removeCouponButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E74C3C",
  },
  removeCouponButtonText: {
    color: "#E74C3C",
    fontSize: 14,
    fontWeight: "500",
  },
  couponSuggestions: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 12,
    color: "#95A5A6",
    marginBottom: 4,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: "#34495E",
  },
  priceValue: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  discountLabel: {
    fontSize: 16,
    color: "#27AE60",
  },
  discountValue: {
    fontSize: 16,
    color: "#27AE60",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  savingsText: {
    textAlign: "center",
    fontSize: 14,
    color: "#27AE60",
    fontWeight: "500",
    marginTop: 8,
  },
  checkoutContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  checkoutButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  paymentMethodsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  paymentMethodsSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 16,
  },
  paymentMethodsList: {
    marginBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentMethodIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#34495E",
    flex: 1,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#27AE60",
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: "#7F8C8D",
    flex: 1,
  },
  payButtonContent: {
    alignItems: "center",
  },
  paymentProviderText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 2,
  },
});
