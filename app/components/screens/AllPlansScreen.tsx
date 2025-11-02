import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FreedomPlanCard } from '../shared/FreedomPlanCard';
import { CorePlanCard } from '../shared/CorePlanCard';
import { KidsPlanCard } from '../shared/KidsPlanCard';
import { ApiService } from '../../services/apiService';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: number;
  aiMinutes: number;
  validityMonths: number;
  features: string[];
  planType: string;
  category: string;
  description: string;
  isPopular: boolean;
}

type PlanCategory = 'freedom' | 'professional' | 'core' | 'kids';

export const AllPlansScreen: React.FC = () => {
  const [freedomPlans, setFreedomPlans] = useState<Plan[]>([]);
  const [professionalPlans, setProfessionalPlans] = useState<Plan[]>([]);
  const [corePlans, setCorePlans] = useState<Plan[]>([]);
  const [kidsPlans, setKidsPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('freedom');

  useEffect(() => {
    loadAllPlans();
  }, []);

  const loadAllPlans = async () => {
    try {
      setLoading(true);
      const response = await ApiService.makeAuthenticatedCall('/api/plans', {
        method: 'GET',
      });
      
      if (response.success && response.data?.plans) {
        const plans = response.data.plans;
        
        // Group plans by type
        setFreedomPlans(plans
          .filter((p: Plan) => p.planType === 'freedom')
          .map(enrichPlan)
        );
        
        setProfessionalPlans(plans
          .filter((p: Plan) => p.planType === 'professional')
          .map(enrichPlan)
        );
        
        setCorePlans(plans
          .filter((p: Plan) => p.planType === 'core')
          .map(enrichPlan)
        );
        
        setKidsPlans(plans
          .filter((p: Plan) => p.planType === 'kids')
          .map(enrichPlan)
        );
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enrichPlan = (plan: any): Plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    originalPrice: plan.originalPrice,
    duration: plan.duration,
    aiMinutes: plan.aiMinutes,
    validityMonths: plan.validityMonths,
    features: plan.features,
    planType: plan.planType,
    category: plan.category,
    description: plan.description || getDefaultDescription(plan.name),
    isPopular: plan.isPopular !== undefined ? plan.isPopular : (plan.name.includes('Growth') || plan.name.includes('Gold') || plan.name.includes('Story Basket')),
  });

  const getDefaultDescription = (planName: string): string => {
    if (planName.includes('Basic')) return 'Perfect for beginners starting their English journey';
    if (planName.includes('Growth')) return 'Best for consistent learners seeking rapid improvement';
    if (planName.includes('Intensive')) return 'Maximum practice for serious language mastery';
    if (planName.includes('Professional')) return 'Tailored English for your career advancement';
    if (planName.includes('Silver')) return 'Foundation level for structured English mastery';
    if (planName.includes('Gold')) return 'Intermediate level with advanced practice';
    if (planName.includes('Diamond')) return 'Complete mastery with personalized coaching';
    if (planName.includes('DELCA')) return 'Elite professional certification program';
    if (planName.includes('Story Basket')) return 'Interactive stories for young learners';
    if (planName.includes('Grammar Garden')) return 'Structured learning for school-age children';
    return '';
  };

  const handlePlanSelect = (plan: { id: string; name: string; price: number }) => {
    setSelectedPlanId(plan.id);
    // TODO: Navigate to checkout screen
    console.log('Selected plan:', plan);
  };

  const CategoryTab: React.FC<{ category: PlanCategory; label: string; count: number }> = ({ 
    category, 
    label, 
    count 
  }) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeCategory === category && styles.tabActive
      ]}
      onPress={() => setActiveCategory(category)}
    >
      <Text style={[
        styles.tabText,
        activeCategory === category && styles.tabTextActive
      ]}>
        {label}
      </Text>
      <View style={[
        styles.countBadge,
        activeCategory === category && styles.countBadgeActive
      ]}>
        <Text style={[
          styles.countText,
          activeCategory === category && styles.countTextActive
        ]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the perfect plan for your English learning journey
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        <CategoryTab category="freedom" label="Freedom Plans" count={freedomPlans.length} />
        <CategoryTab category="professional" label="Professional" count={professionalPlans.length} />
        <CategoryTab category="core" label="Core Courses" count={corePlans.length} />
        <CategoryTab category="kids" label="Kids Programs" count={kidsPlans.length} />
      </ScrollView>

      {/* Freedom Plans */}
      {activeCategory === 'freedom' && (
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Freedom Plans</Text>
            <Text style={styles.sectionSubtitle}>
              Flexible conversation practice with AI tutors
            </Text>
          </View>
          <FreedomPlanCard
            plans={freedomPlans}
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
          />
        </View>
      )}

      {/* Professional Plan */}
      {activeCategory === 'professional' && (
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💼 Professional English</Text>
            <Text style={styles.sectionSubtitle}>
              Career-focused English with installment options
            </Text>
          </View>
          <FreedomPlanCard
            plans={professionalPlans}
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
          />
          <View style={styles.installmentInfo}>
            <Text style={styles.installmentIcon}>💳</Text>
            <View style={styles.installmentTextContainer}>
              <Text style={styles.installmentTitle}>Flexible Payments Available</Text>
              <Text style={styles.installmentText}>
                Pay ₹1,299 now, ₹1,200 after 30 days
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Core Courses */}
      {activeCategory === 'core' && (
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Core Courses</Text>
            <Text style={styles.sectionSubtitle}>
              Structured curriculum with live classes & certification
            </Text>
          </View>
          <CorePlanCard
            plans={corePlans}
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
          />
        </View>
      )}

      {/* Kids Programs */}
      {activeCategory === 'kids' && (
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👶 Kids Programs</Text>
            <Text style={styles.sectionSubtitle}>
              Age-appropriate English learning for children
            </Text>
          </View>
          <KidsPlanCard
            plans={kidsPlans}
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
          />
        </View>
      )}

      {/* Guarantee Section */}
      <View style={styles.guaranteeSection}>
        <Text style={styles.guaranteeIcon}>✨</Text>
        <Text style={styles.guaranteeTitle}>7-Day Money Back Guarantee</Text>
        <Text style={styles.guaranteeText}>
          Not satisfied? Get a full refund within 7 days, no questions asked.
        </Text>
      </View>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  tabTextActive: {
    color: '#1E40AF',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  categorySection: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  installmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  installmentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  installmentTextContainer: {
    flex: 1,
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  installmentText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  guaranteeSection: {
    margin: 24,
    marginTop: 8,
    padding: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  guaranteeIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  guaranteeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  guaranteeText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AllPlansScreen;
