import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plan } from "@/app/types/api";

const { width } = Dimensions.get("window");

interface PaymentSuccessScreenProps {
  plan: Plan;
  finalAmount: number;
  onContinue: () => void;
  onViewPlans: () => void;
}

export const PaymentSuccessScreenWithNavigation: React.FC<
  PaymentSuccessScreenProps
> = ({ plan, finalAmount, onContinue, onViewPlans }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. Your plan is now active.
        </Text>

        <View style={styles.planCard}>
          <LinearGradient
            colors={["#27AE60", "#2ECC71"]}
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
            <Text style={styles.planPrice}>{formatPrice(finalAmount)}</Text>
          </LinearGradient>

          <View style={styles.planDetails}>
            <Text style={styles.detailsTitle}>Plan Details:</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>
                {formatDuration(plan.duration)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Features:</Text>
              <Text style={styles.detailValue}>
                {plan.features.length} included
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid:</Text>
              <Text style={styles.detailValue}>{formatPrice(finalAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Your Plan Includes:</Text>
          {plan.features.slice(0, 4).map((feature, index) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>
          ))}
          {plan.features.length > 4 && (
            <Text style={styles.moreFeatures}>
              +{plan.features.length - 4} more features
            </Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Continue to App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onViewPlans}>
          <Text style={styles.secondaryButtonText}>View Other Plans</Text>
        </TouchableOpacity>
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
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#27AE60",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
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
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  detailValue: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "500",
  },
  featuresContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
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
    backgroundColor: "#27AE60",
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#34495E",
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 18,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  primaryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "500",
  },
});
