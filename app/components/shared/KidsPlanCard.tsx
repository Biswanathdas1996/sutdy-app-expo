import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface KidsPlan {
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

interface KidsPlanCardProps {
  plans: KidsPlan[];
  onPlanSelect?: (plan: KidsPlan) => void;
  selectedPlanId?: string;
}

export const KidsPlanCard: React.FC<KidsPlanCardProps> = ({
  plans,
  onPlanSelect,
  selectedPlanId,
}) => {
  const getAgeGroup = (planName: string): string => {
    if (planName.includes('Story Basket')) return 'Ages 4-7';
    if (planName.includes('Grammar Garden')) return 'Ages 8-12';
    return '';
  };

  const getPlanGradient = (planName: string): [string, string] => {
    if (planName.includes('Story Basket')) return ['#F472B6', '#EC4899'];
    if (planName.includes('Grammar Garden')) return ['#34D399', '#10B981'];
    return ['#60A5FA', '#3B82F6'];
  };

  const getPlanIcon = (planName: string): string => {
    if (planName.includes('Story Basket')) return '📖';
    if (planName.includes('Grammar Garden')) return '🌱';
    return '👶';
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const gradientColors = getPlanGradient(plan.name);
        const planIcon = getPlanIcon(plan.name);
        const ageGroup = getAgeGroup(plan.name);

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
                {plan.isPopular && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⭐ POPULAR</Text>
                  </View>
                )}
                
                <Text style={styles.planIcon}>{planIcon}</Text>
                
                <Text style={styles.planName}>
                  {plan.name}
                </Text>
                
                {ageGroup && (
                  <View style={styles.ageBadge}>
                    <Text style={styles.ageText}>{ageGroup}</Text>
                  </View>
                )}
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
                <Text style={styles.duration}>
                  {plan.validityMonths} {plan.validityMonths === 1 ? 'Month' : 'Months'} Course
                </Text>
                {plan.originalPrice && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      Save ₹{(plan.originalPrice - plan.price).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              {plan.description && (
                <View style={styles.descriptionSection}>
                  <Text style={styles.description}>{plan.description}</Text>
                </View>
              )}

              {/* AI Minutes highlight */}
              <View style={styles.highlightSection}>
                <View style={styles.highlightBox}>
                  <Text style={styles.highlightIcon}>🎯</Text>
                  <Text style={styles.highlightNumber}>{plan.aiMinutes}</Text>
                  <Text style={styles.highlightLabel}>AI Minutes</Text>
                </View>
                <View style={styles.highlightBox}>
                  <Text style={styles.highlightIcon}>🏆</Text>
                  <Text style={styles.highlightNumber}>{plan.validityMonths}</Text>
                  <Text style={styles.highlightLabel}>Months</Text>
                </View>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What's Included:</Text>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Parent info */}
              <View style={styles.parentInfo}>
                <Text style={styles.parentIcon}>👨‍👩‍👧</Text>
                <Text style={styles.parentText}>
                  Parent dashboard included for progress tracking
                </Text>
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
                  {isSelected ? '✓ Enrolled' : 'Enroll Now'}
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSelected: {
    shadowColor: '#F472B6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#F472B6',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
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
  planIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  ageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  ageText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 56,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
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
  descriptionSection: {
    padding: 16,
    backgroundColor: '#FEF3C7',
  },
  description: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  highlightSection: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
  },
  highlightBox: {
    alignItems: 'center',
  },
  highlightIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  highlightNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
  },
  highlightLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  featuresContainer: {
    padding: 20,
    paddingTop: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 10,
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
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  parentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  parentText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  selectButton: {
    margin: 20,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonSelected: {
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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

export default KidsPlanCard;
