import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { ModernButton } from "../shared/ModernButton";
import { ApiService } from "@/app/services/apiService";
import { Plan as ApiPlan } from "@/app/types/api";

interface PlansScreenComponentProps {
  onBack: () => void;
  onPlanSelect: (planId: string) => void;
}

export const PlansScreenComponent: React.FC<PlansScreenComponentProps> = ({
  onBack,
  onPlanSelect,
}) => {
  const colorScheme = useColorScheme();
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanType, setSelectedPlanType] = useState<string>("all");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getPlans();
      if (response.success) {
        setPlans(response.plans || []);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      if (Platform.OS === "web") {
        window.alert("Failed to load plans. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanCard = (plan: ApiPlan) => {
    const isStarter = plan.name.toLowerCase().includes("starter");
    const isFreedom = plan.planType === "freedom";
    const isProfessional = plan.planType === "professional";
    const isCore = plan.planType === "core";
    const isKids = plan.planType === "kids";

    return (
      <TouchableOpacity
        key={plan.id}
        style={{
          backgroundColor: isStarter
            ? Colors.light.primary + "15"
            : Colors[colorScheme ?? "light"].background,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: isStarter ? 2 : 1,
          borderColor: isStarter
            ? Colors.light.primary
            : Colors[colorScheme ?? "light"].tabIconDefault + "30",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
        onPress={() => onPlanSelect(plan.id)}
      >
        {/* Plan Badge */}
        {(isStarter || plan.isPopular) && (
          <View
            style={{
              position: "absolute",
              top: -10,
              right: 20,
              backgroundColor: isStarter
                ? Colors.light.primary
                : "#FFD700",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name={isStarter ? "star" : "local-fire-department"}
              size={14}
              color="#fff"
            />
            <ThemedText
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: "700",
                marginLeft: 4,
              }}
            >
              {isStarter ? "RECOMMENDED" : "POPULAR"}
            </ThemedText>
          </View>
        )}

        {/* Plan Name */}
        <ThemedText
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 8,
            color: isStarter
              ? Colors.light.primary
              : Colors[colorScheme ?? "light"].text,
          }}
        >
          {plan.name}
        </ThemedText>

        {/* Plan Description */}
        {plan.description && (
          <ThemedText
            style={{
              fontSize: 13,
              color: Colors[colorScheme ?? "light"].tabIconDefault,
              marginBottom: 12,
              lineHeight: 18,
            }}
          >
            {plan.description}
          </ThemedText>
        )}

        {/* Price */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "baseline", 
          marginBottom: 16,
          flexWrap: "wrap",
        }}>
          <ThemedText
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: Colors.light.primary,
              lineHeight: 38,
            }}
          >
            ₹{plan.price}
          </ThemedText>
          {plan.originalPrice && plan.originalPrice > plan.price && (
            <ThemedText
              style={{
                fontSize: 18,
                textDecorationLine: "line-through",
                color: Colors[colorScheme ?? "light"].tabIconDefault,
                marginLeft: 8,
                lineHeight: 24,
                opacity: 0.6,
              }}
            >
              ₹{plan.originalPrice}
            </ThemedText>
          )}
        </View>

        {/* Validity & AI Minutes */}
        <View style={{ flexDirection: "row", marginBottom: 16, gap: 12 }}>
          <View
            style={{
              backgroundColor: Colors.light.primary + "10",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="schedule"
              size={16}
              color={Colors.light.primary}
            />
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: "600",
                marginLeft: 4,
                color: Colors.light.primary,
              }}
            >
              {plan.validityMonths} month{plan.validityMonths > 1 ? "s" : ""}
            </ThemedText>
          </View>
          {plan.aiMinutes > 0 && (
            <View
              style={{
                backgroundColor: Colors.light.primary + "10",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="smart-toy"
                size={16}
                color={Colors.light.primary}
              />
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  marginLeft: 4,
                  color: Colors.light.primary,
                }}
              >
                {plan.aiMinutes} min AI
              </ThemedText>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={{ marginBottom: 16 }}>
          {(Array.isArray(plan.features) ? plan.features.slice(0, 5) : []).map((feature: any, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <MaterialIcons
                name="check-circle"
                size={18}
                color={Colors.light.primary}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <ThemedText
                style={{
                  flex: 1,
                  fontSize: 13,
                  lineHeight: 20,
                  color: Colors[colorScheme ?? "light"].text,
                }}
              >
                {typeof feature === 'string' ? feature : feature.name || feature.description || ''}
              </ThemedText>
            </View>
          ))}
          {plan.features && plan.features.length > 5 && (
            <ThemedText
              style={{
                fontSize: 12,
                color: Colors.light.primary,
                marginTop: 4,
                fontWeight: "600",
              }}
            >
              +{plan.features.length - 5} more features
            </ThemedText>
          )}
        </View>

        {/* Action Button */}
        <ModernButton
          title={isStarter ? "Get Started - Best Value! 🎯" : "Choose This Plan"}
          onPress={() => onPlanSelect(plan.id)}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={{ marginTop: 16, fontSize: 16 }}>
          Loading plans...
        </ThemedText>
      </View>
    );
  }

  const planTypes = [
    { key: "all", label: "All Plans", icon: "grid-view" },
    { key: "starter", label: "Starter", icon: "star" },
    { key: "freedom", label: "Freedom", icon: "flight-takeoff" },
    { key: "professional", label: "Professional", icon: "business-center" },
    { key: "core", label: "Core", icon: "school" },
    { key: "kids", label: "Kids", icon: "child-care" },
  ];

  const filteredPlans = plans.filter((plan) => {
    if (selectedPlanType === "all") return true;
    if (selectedPlanType === "starter")
      return plan.name.toLowerCase().includes("starter");
    return plan.planType === selectedPlanType;
  });

  // Sort to show Starter plan first
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    const aIsStarter = a.name.toLowerCase().includes("starter");
    const bIsStarter = b.name.toLowerCase().includes("starter");
    if (aIsStarter && !bIsStarter) return -1;
    if (!aIsStarter && bIsStarter) return 1;
    return 0;
  });

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
              Choose Your Plan
            </ThemedText>
            <ThemedText
              style={{ fontSize: 14, color: "#fff", opacity: 0.9, marginTop: 4 }}
            >
              Select the best plan for your learning journey
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Plan Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 60 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
      >
        {planTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            onPress={() => setSelectedPlanType(type.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor:
                selectedPlanType === type.key
                  ? Colors.light.primary
                  : Colors[colorScheme ?? "light"].background,
              borderWidth: 1,
              borderColor:
                selectedPlanType === type.key
                  ? Colors.light.primary
                  : Colors[colorScheme ?? "light"].tabIconDefault + "30",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name={type.icon as any}
              size={16}
              color={
                selectedPlanType === type.key
                  ? "#fff"
                  : Colors[colorScheme ?? "light"].text
              }
            />
            <ThemedText
              style={{
                marginLeft: 6,
                fontSize: 13,
                fontWeight: "600",
                color:
                  selectedPlanType === type.key
                    ? "#fff"
                    : Colors[colorScheme ?? "light"].text,
              }}
            >
              {type.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plans List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => renderPlanCard(plan))
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <MaterialIcons
              name="info-outline"
              size={48}
              color={Colors[colorScheme ?? "light"].tabIconDefault}
            />
            <ThemedText
              style={{
                fontSize: 16,
                marginTop: 16,
                color: Colors[colorScheme ?? "light"].tabIconDefault,
              }}
            >
              No plans available in this category
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
