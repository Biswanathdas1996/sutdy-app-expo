import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FreedomPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: number;
  aiMinutes: number;
  validityMonths: number;
  features: string[];
  isPopular: boolean;
  description: string;
}

interface FreedomPlanCardProps {
  plans: FreedomPlan[];
  onPlanSelect?: (plan: FreedomPlan) => void;
  selectedPlanId?: string;
}

export const FreedomPlanCard: React.FC<FreedomPlanCardProps> = ({
  plans,
  onPlanSelect,
  selectedPlanId,
}) => {
  const getTierGradient = (planName: string): [string, string] => {
    if (planName.includes('Basic')) return ['#10B981', '#059669'];
    if (planName.includes('Growth')) return ['#3B82F6', '#1D4ED8'];
    if (planName.includes('Intensive')) return ['#8B5CF6', '#6D28D9'];
    return ['#6366F1', '#4F46E5'];
  };

  const getTierBadgeColor = (planName: string): string => {
    if (planName.includes('Basic')) return '#10B981';
    if (planName.includes('Growth')) return '#3B82F6';
    if (planName.includes('Intensive')) return '#8B5CF6';
    return '#6366F1';
  };

  const getTierLabel = (planName: string): string => {
    if (planName.includes('Basic')) return 'STARTER';
    if (planName.includes('Growth')) return 'POPULAR';
    if (planName.includes('Intensive')) return 'BEST VALUE';
    return '';
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const gradientColors = getTierGradient(plan.name);
        const badgeColor = getTierBadgeColor(plan.name);
        const tierLabel = getTierLabel(plan.name);

        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.9}
            onPress={() => onPlanSelect?.(plan)}
            style={styles.cardContainer}
          >
            <View style={[
              styles.card,
              isSelected && styles.cardSelected
            ]}>
              {/* Header with gradient */}
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                {plan.isPopular && tierLabel && (
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{tierLabel}</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>
                  {plan.name.replace('Freedom ', '')}
                </Text>
                
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {plan.validityMonths} {plan.validityMonths === 1 ? 'Month' : 'Months'}
                  </Text>
                </View>
              </LinearGradient>

              {/* Price section */}
              <View style={styles.priceSection}>
                {plan.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{plan.originalPrice.toLocaleString()}
                  </Text>
                )}
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.price}>{plan.price.toLocaleString()}</Text>
                </View>
                {plan.originalPrice && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      Save ₹{(plan.originalPrice - plan.price).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* AI Minutes */}
              <View style={styles.highlightSection}>
                <Text style={styles.highlightIcon}>🎯</Text>
                <Text style={styles.highlightText}>
                  {plan.aiMinutes} AI Tutor Minutes
                </Text>
              </View>

              {/* Description */}
              {plan.description && (
                <Text style={styles.description}>{plan.description}</Text>
              )}

              {/* Features */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Select button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  isSelected && styles.selectButtonSelected,
                  { backgroundColor: isSelected ? gradientColors[0] : '#F3F4F6' }
                ]}
                onPress={() => onPlanSelect?.(plan)}
              >
                <Text style={[
                  styles.selectButtonText,
                  isSelected && styles.selectButtonTextSelected
                ]}>
                  {isSelected ? '✓ Selected' : 'Select Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardContainer: {
    marginRight: 16,
  },
  card: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSelected: {
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    padding: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 4,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
    lineHeight: 32,
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 58,
    includeFontPadding: false,
  },
  savingsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  savingsText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  highlightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  featuresContainer: {
    padding: 20,
    paddingTop: 12,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureBullet: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  selectButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonSelected: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectButtonTextSelected: {
    color: '#FFFFFF',
  },
});

export default FreedomPlanCard;
