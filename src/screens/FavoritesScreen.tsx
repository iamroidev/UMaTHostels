import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useToggleFavorite, useUserFavorites } from '../hooks/useHostels';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import { formatCurrency } from '../utils/format';
import type { RootStackParamList } from '../types';

const getPriceRangeLabel = (hostel: any) => {
  const roomTypes = hostel?.room_types ?? [];
  if (!roomTypes.length) return 'Contact for pricing';

  const prices = roomTypes
    .map((room: any) => Number(room.price_per_semester) || 0)
    .filter((price: number) => price > 0);

  if (!prices.length) return 'Contact for pricing';

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatCurrency(min);
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { data = [], isLoading, isRefetching, refetch } = useUserFavorites(userId || undefined);
  const toggleFavorite = useToggleFavorite(userId || undefined);

  const sorted = useMemo(() => {
    const entries = (Array.isArray(data) ? data : []) as Array<Record<string, any>>;
    return [...entries].sort((a, b) => {
      const aDate = new Date(a.created_at ?? 0).getTime();
      const bDate = new Date(b.created_at ?? 0).getTime();
      return bDate - aDate;
    });
  }, [data]);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptySubtitle}>
        Save hostels you love to easily compare and book later.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
        <Text style={styles.primaryButtonText}>Browse hostels</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
  const hostel = item.hostel;
    const image = hostel?.images?.[0];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('HostelDetails', { hostelId: hostel?.id ?? item.hostel_id })}
        activeOpacity={0.9}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>No image</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.headerRow}>
            <Text style={styles.hostelName}>{hostel?.name ?? 'Hostel'}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() =>
                toggleFavorite.mutate({
                  hostelId: hostel?.id ?? item.hostel_id,
                  favoriteId: item.id,
                })
              }
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>{hostel?.address ?? 'Tarkwa, Ghana'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.priceText}>{getPriceRangeLabel(hostel)}</Text>
            {typeof hostel?.distance_from_campus === 'number' ? (
              <Text style={styles.distanceText}>{hostel.distance_from_campus} km from UMaT</Text>
            ) : null}
          </View>
          {hostel?.amenities?.length ? (
            <View style={styles.amenitiesRow}>
              {hostel.amenities.slice(0, 3).map((amenity: string) => (
                <View key={amenity} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
              {hostel.amenities.length > 3 ? (
                <View style={styles.amenityChip}>
                  <Text style={styles.amenityText}>+{hostel.amenities.length - 3}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
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
    overflow: 'hidden',
    ...Shadow.md,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.gray[200],
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostelName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  removeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.accent,
  },
  removeButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  addressText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  distanceText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  amenityChip: {
    backgroundColor: Colors.background.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  amenityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
});

export default FavoritesScreen;
