import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { API_URL } from '../../constants/Api';

interface Subscription {
  id: number;
  plan_id: number;
  plan_name?: string;
  status: string;
  auto_pay_enabled: boolean;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  grace_period_end?: string;
  created_at: string;
}

interface SubscriptionManagementProps {
  userId: number;
  onClose?: () => void;
}

export default function SubscriptionManagementScreen({ userId, onClose }: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/subscriptions/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  const toggleAutoPay = async (subscriptionId: number, currentStatus: boolean) => {
    try {
      setActionLoading(subscriptionId);

      const endpoint = currentStatus
        ? `${API_URL}/subscriptions/${subscriptionId}/disable-autopay`
        : `${API_URL}/subscriptions/${subscriptionId}/enable-autopay`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          currentStatus
            ? 'Auto-pay has been disabled. Your subscription will continue until the end of the current period.'
            : 'Auto-pay has been enabled. Your subscription will renew automatically.'
        );
        loadSubscriptions();
      } else {
        Alert.alert('Error', data.message || 'Failed to update auto-pay');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update auto-pay');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelSubscription = async (subscriptionId: number) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? You will still have access until the end of your current billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(subscriptionId);

              const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Success', 'Subscription cancelled successfully');
                loadSubscriptions();
              } else {
                Alert.alert('Error', data.message || 'Failed to cancel subscription');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel subscription');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'grace_period':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'grace_period':
        return 'Grace Period';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
        <Text style={styles.emptyText}>
          Subscribe to a Freedom Plan to access unlimited learning resources
        </Text>
        {onClose && (
          <TouchableOpacity style={styles.browsePlansButton} onPress={onClose}>
            <Text style={styles.browsePlansText}>Browse Plans</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Text style={styles.subtitle}>Manage your active subscriptions</Text>
      </View>

      {/* Subscriptions List */}
      {subscriptions.map((subscription) => {
        const daysRemaining = getDaysRemaining(subscription.current_period_end);
        const isActive = subscription.status === 'active';
        const isGracePeriod = subscription.status === 'grace_period';

        return (
          <View key={subscription.id} style={styles.subscriptionCard}>
            {/* Status Badge */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(subscription.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(subscription.status)}</Text>
              </View>
              {subscription.auto_pay_enabled && (
                <View style={styles.autoPayBadge}>
                  <Text style={styles.autoPayText}>🔄 Auto-Pay ON</Text>
                </View>
              )}
            </View>

            {/* Plan Name */}
            <Text style={styles.planName}>
              {subscription.plan_name || `Plan #${subscription.plan_id}`}
            </Text>

            {/* Billing Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Period</Text>
                <Text style={styles.infoValue}>
                  {formatDate(subscription.current_period_start)} -{' '}
                  {formatDate(subscription.current_period_end)}
                </Text>
              </View>

              {isActive && subscription.next_billing_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Next Billing</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(subscription.next_billing_date)}
                    <Text style={styles.daysRemaining}> ({daysRemaining} days)</Text>
                  </Text>
                </View>
              )}

              {isGracePeriod && subscription.grace_period_end && (
                <View style={[styles.infoRow, styles.warningRow]}>
                  <Text style={styles.warningLabel}>Grace Period Ends</Text>
                  <Text style={styles.warningValue}>
                    {formatDate(subscription.grace_period_end)}
                  </Text>
                </View>
              )}
            </View>

            {/* Grace Period Warning */}
            {isGracePeriod && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningBannerText}>
                  ⚠️ Payment failed. Please update your payment method to continue your subscription.
                </Text>
              </View>
            )}

            {/* Actions */}
            {(isActive || isGracePeriod) && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.toggleButton,
                    actionLoading === subscription.id && styles.actionButtonDisabled,
                  ]}
                  onPress={() =>
                    toggleAutoPay(subscription.id, subscription.auto_pay_enabled)
                  }
                  disabled={actionLoading === subscription.id}
                >
                  {actionLoading === subscription.id ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Text style={styles.toggleButtonText}>
                      {subscription.auto_pay_enabled ? 'Pause Auto-Pay' : 'Enable Auto-Pay'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.cancelButton,
                    actionLoading === subscription.id && styles.actionButtonDisabled,
                  ]}
                  onPress={() => cancelSubscription(subscription.id)}
                  disabled={actionLoading === subscription.id}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cancelled Info */}
            {subscription.status === 'cancelled' && (
              <View style={styles.cancelledInfo}>
                <Text style={styles.cancelledText}>
                  Access until {formatDate(subscription.current_period_end)}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Help Section */}
      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Contact our support team for subscription-related queries
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browsePlansButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browsePlansText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  autoPayBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  autoPayText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  daysRemaining: {
    color: '#10b981',
  },
  warningRow: {
    marginTop: 8,
  },
  warningLabel: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  warningValue: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  warningBanner: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    marginBottom: 16,
  },
  warningBannerText: {
    fontSize: 13,
    color: '#991b1b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  toggleButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  toggleButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  cancelledInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelledText: {
    fontSize: 13,
    color: '#6b7280',
  },
  helpCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
