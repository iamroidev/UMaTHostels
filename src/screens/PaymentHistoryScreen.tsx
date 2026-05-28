import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useUserPaymentsQuery } from '../hooks/usePayments';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { RootStackParamList } from '../types';

const getStatusBadge = (status?: string | null) => {
  switch (status) {
    case 'completed':
      return { label: 'Completed', bg: Colors.status.available, color: Colors.white };
    case 'failed':
      return { label: 'Failed', bg: Colors.error, color: Colors.white };
    case 'refunded':
      return { label: 'Refunded', bg: Colors.info, color: Colors.white };
    default:
      return { label: 'Pending', bg: Colors.warning, color: Colors.primary };
  }
};

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentHistory'>;

const PaymentHistoryScreen: React.FC<Props> = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const {
    data: payments = [],
    isLoading,
    isRefetching,
    refetch,
  } = useUserPaymentsQuery(userId || undefined);

  const sorted = useMemo(() => {
    return [...payments].sort((a, b) => {
      const aDate = new Date(a.created_at ?? 0).getTime();
      const bDate = new Date(b.created_at ?? 0).getTime();
      return bDate - aDate;
    });
  }, [payments]);

  const handleViewDetails = (payment: any) => {
    const lines = [
      `Reference: ${payment.reference ?? 'N/A'}`,
      `Amount: ${formatCurrency(Number(payment.amount) || 0)}`,
      `Provider: ${payment.provider ?? 'Mobile Money'}`,
      `Status: ${payment.status ?? 'pending'}`,
      `Created: ${formatDateTime(payment.created_at)}`,
    ];

    if (payment.metadata) {
      const meta = typeof payment.metadata === 'string' ? payment.metadata : JSON.stringify(payment.metadata, null, 2);
      lines.push(`Metadata: ${meta}`);
    }

    Alert.alert('Payment details', lines.join('\n'));
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No payments yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete a booking or upgrade to Premium to see your payment history.
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status);
    const amount = Number(item.amount) || 0;
    const title = item.booking_id ? 'Hostel booking' : 'Premium upgrade';
    const subtitle = item.booking_id ? `Booking reference: ${item.booking_id}` : 'Access unlock';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          <Text style={styles.timestamp}>{formatDateTime(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !sorted.length ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={sorted.length ? styles.listContent : styles.emptyContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default PaymentHistoryScreen;
