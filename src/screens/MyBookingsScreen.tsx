import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useUserBookingsQuery } from '../hooks/useProfile';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import { formatCurrency } from '../utils/format';
import type { RootStackParamList } from '../types';

// Utility to format booking status labels
const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', bg: Colors.status.available, color: Colors.white };
    case 'rejected':
      return { label: 'Rejected', bg: Colors.error, color: Colors.white };
    case 'cancelled':
      return { label: 'Cancelled', bg: Colors.gray[300], color: Colors.text.secondary };
    default:
      return { label: 'Pending', bg: Colors.warning, color: Colors.primary };
  }
};

const getPaymentStatusBadge = (status?: string | null) => {
  switch (status) {
    case 'completed':
      return { label: 'Paid', bg: Colors.status.available, color: Colors.white };
    case 'failed':
      return { label: 'Payment Failed', bg: Colors.error, color: Colors.white };
    case 'refunded':
      return { label: 'Refunded', bg: Colors.info, color: Colors.white };
    default:
      return { label: 'Payment Pending', bg: Colors.secondary, color: Colors.primary };
  }
};

type Props = NativeStackScreenProps<RootStackParamList, 'Bookings'>;

const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const {
    data: bookings = [],
    isLoading,
    isRefetching,
    refetch,
  } = useUserBookingsQuery(userId || undefined);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aDate = new Date(a.created_at ?? 0).getTime();
      const bDate = new Date(b.created_at ?? 0).getTime();
      return bDate - aDate;
    });
  }, [bookings]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No bookings yet</Text>
      <Text style={styles.emptySubtitle}>
        Browse hostels and reserve a room to see your bookings here.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
        <Text style={styles.primaryButtonText}>Find Hostels</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const bookingStatus = getStatusBadge(item.status);
    const paymentStatus = getPaymentStatusBadge(item.payment_status);
    const hostelName = item.hostel?.name ?? 'Hostel';
    const roomTypeName = item.room_type?.name ?? 'Room type';
    const amount = Number(item.total_amount) || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() =>
          navigation.navigate('HostelDetails', {
            hostelId: item.hostel_id,
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.hostelName}>{hostelName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: bookingStatus.bg }]}> 
            <Text style={[styles.statusBadgeText, { color: bookingStatus.color }]}>
              {bookingStatus.label}
            </Text>
          </View>
        </View>
        <Text style={styles.roomType}>{roomTypeName}</Text>
        <Text style={styles.metaText}>Booked on {new Date(item.created_at).toLocaleDateString('en-GB')}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: paymentStatus.bg }]}>
            <Text style={[styles.statusBadgeText, { color: paymentStatus.color }]}>
              {paymentStatus.label}
            </Text>
          </View>
        </View>
        {item.status === 'pending' && item.payment_status !== 'completed' ? (
          <TouchableOpacity
            style={[styles.primaryButton, styles.payButton]}
            onPress={() =>
              navigation.navigate('Payment', {
                bookingId: item.id,
                amount,
              })
            }
          >
            <Text style={styles.primaryButtonText}>Complete Payment</Text>
          </TouchableOpacity>
        ) : null}
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
          contentContainerStyle={sorted.length ? styles.listContent : styles.emptyContainer}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
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
    gap: Spacing.md,
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
  hostelName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  roomType: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
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
  payButton: {
    marginTop: Spacing.md,
  },
});

export default MyBookingsScreen;
