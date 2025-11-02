import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FreedomPlanCard } from '../shared/FreedomPlanCard';
import { ApiService } from '../../services/apiService';

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

export const PlansScreen: React.FC = () => {
  const [freedomPlans, setFreedomPlans] = useState<FreedomPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await ApiService.makeAuthenticatedCall('/api/plans?type=freedom', {
        method: 'GET',
      });
      
      if (response.success && response.data?.plans) {
        // Mark Growth plan as popular and add descriptions
        const plans = response.data.plans.map((plan: any): FreedomPlan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          originalPrice: plan.originalPrice,
          duration: plan.duration,
          aiMinutes: plan.aiMinutes,
          validityMonths: plan.validityMonths,
          features: plan.features,
          isPopular: plan.name.includes('Growth'),
          description: getDescription(plan.name),
        }));
        setFreedomPlans(plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (planName: string): string => {
    if (planName.includes('Basic')) {
      return 'Perfect for beginners starting their English journey';
    }
    if (planName.includes('Growth')) {
      return 'Best for consistent learners seeking rapid improvement';
    }
    if (planName.includes('Intensive')) {
      return 'Maximum practice for serious language mastery';
    }
    return '';
  };

  const handlePlanSelect = (plan: FreedomPlan) => {
    setSelectedPlanId(plan.id);
    // TODO: Navigate to checkout screen
    console.log('Selected plan:', plan);
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Freedom Plans</Text>
        <Text style={styles.subtitle}>
          Choose the plan that fits your learning pace
        </Text>
      </View>

      <FreedomPlanCard
        plans={freedomPlans}
        onPlanSelect={handlePlanSelect}
        selectedPlanId={selectedPlanId}
      />

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>All Freedom Plans Include:</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoText}>Unlimited access to lessons and courses</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎓</Text>
          <Text style={styles.infoText}>Practice with AI Tutors Rose & Jack</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📚</Text>
          <Text style={styles.infoText}>Daily lessons and exercises</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏆</Text>
          <Text style={styles.infoText}>Earn badges and track progress</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💬</Text>
          <Text style={styles.infoText}>Connect with SpeakEdge conversation partners</Text>
        </View>
      </View>

      <View style={styles.guaranteeSection}>
        <Text style={styles.guaranteeIcon}>✨</Text>
        <Text style={styles.guaranteeTitle}>7-Day Money Back Guarantee</Text>
        <Text style={styles.guaranteeText}>
          Not satisfied? Get a full refund within 7 days, no questions asked.
        </Text>
      </View>
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
  infoSection: {
    margin: 24,
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
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
});

export default PlansScreen;
