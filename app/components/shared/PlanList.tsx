import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ApiService } from "@/app/services/apiService";
import { Plan, PlansResponse } from "@/app/types/api";

const { width } = Dimensions.get("window");

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSelect,
  isSelected = false,
}) => {
  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString("en-IN")}`;
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

  const getBadgeColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("gold")) return "#FF6B35";
    if (name.includes("diamond")) return "#6C5CE7";
    if (name.includes("silver")) return "#A29BFE";
    if (name.includes("basic")) return "#00B894";
    if (name.includes("starter")) return "#E17055";
    return "#0984E3";
  };

  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.selectedCard]}
      onPress={() => onSelect(plan)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors(plan.name)}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View
            style={[
              styles.durationBadge,
              { backgroundColor: getBadgeColor(plan.name) },
            ]}
          >
            <Text style={styles.durationText}>
              {formatDuration(plan.duration)}
            </Text>
          </View>
        </View>
        <Text style={styles.planPrice}>{formatPrice(plan.cost)}</Text>
      </LinearGradient>

      <View style={styles.planContent}>
        {/* {plan.description ? (
          <Text style={styles.planDescription} numberOfLines={2}>
            {plan.description}
          </Text>
        ) : null} */}

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Key Features:</Text>
          {plan.features.map((feature, index) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureText} numberOfLines={1}>
                {feature.name}
              </Text>
            </View>
          ))}
          {/* {plan.features.length > 3 && (
            <Text style={styles.moreFeatures}>
              +{plan.features.length - 3} more features
            </Text>
          )} */}
        </View>

        <TouchableOpacity
          style={[styles.selectButton, isSelected && styles.selectedButton]}
          onPress={() => onSelect(plan)}
        >
          <Text
            style={[
              styles.selectButtonText,
              isSelected && styles.selectedButtonText,
            ]}
          >
            {isSelected ? "Selected" : "Choose Plan"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

interface PlanListProps {
  onPlanSelect?: (plan: Plan) => void;
  selectedPlanId?: string;
  showHeader?: boolean;
}

const PlanList: React.FC<PlanListProps> = ({
  onPlanSelect,
  selectedPlanId,
  showHeader = true,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: PlansResponse = await ApiService.getPlans();

      if (response.success && response.plans) {
        // Filter only active plans and sort by price
        const activePlans = response.plans
          .filter((plan) => plan.isActive)
          .sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));

        setPlans(activePlans);
      } else {
        throw new Error(response.message || "Failed to fetch plans");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err instanceof Error ? err.message : "Failed to load plans");
      Alert.alert(
        "Error",
        "Failed to load plans. Please check your internet connection and try again.",
        [{ text: "Retry", onPress: fetchPlans }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    console.log("Plan selected:", plan.name);

    // Navigate directly to checkout screen with the selected plan

    router.push({
      pathname: "/components/screens/CheckoutScreen",
      params: { plan: JSON.stringify(plan) },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load plans</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noPlansText}>No plans available at the moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Select the perfect plan to boost your English learning journey
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={handlePlanSelect}
            isSelected={selectedPlanId === plan.id}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#4A90E2",
    shadowColor: "#4A90E2",
    shadowOpacity: 0.3,
  },
  gradientHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  planContent: {
    padding: 20,
    paddingTop: 16,
  },
  planDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
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
    lineHeight: 20,
  },
  moreFeatures: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginTop: 4,
    marginLeft: 18,
  },
  selectButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#27AE60",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedButtonText: {
    color: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noPlansText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
  },
});

export default PlanList;
