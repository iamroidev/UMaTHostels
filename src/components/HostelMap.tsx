import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';

type HostelListItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  priceRange: { min: number; max: number };
  rating: number;
  distanceFromCampusKm?: number | null;
};

interface HostelMapProps {
  hostels: HostelListItem[];
  onHostelSelect?: (hostelId: string) => void;
}

const formatPriceRange = (priceRange: HostelListItem['priceRange']) => {
  return `GHS ${priceRange.min.toLocaleString('en-US')} - ${priceRange.max.toLocaleString('en-US')} / semester`;
};

const formatDistance = (value?: number | null) => {
  if (value == null) return 'Distance unavailable';
  return `${value.toFixed(1)} km from UMaT`;
};

export const HostelMapScreen: React.FC<HostelMapProps> = ({ hostels, onHostelSelect }) => {
  const dataset = hostels.length
    ? hostels
    : [
        {
          id: 'mock-1',
          name: 'UMaT Guest House',
          latitude: 5.2827,
          longitude: -1.9967,
          priceRange: { min: 300, max: 500 },
          rating: 4.5,
          distanceFromCampusKm: 0.2,
        },
        {
          id: 'mock-2',
          name: 'Golden Palace Hostel',
          latitude: 5.275,
          longitude: -1.985,
          priceRange: { min: 250, max: 400 },
          rating: 4.2,
          distanceFromCampusKm: 1.0,
        },
      ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hostels Near You</Text>
        <Text style={styles.subtitle}>{dataset.length} hostels listed</Text>
        <Text style={styles.helper}>Map visualisation is unavailable in the current build.</Text>
      </View>
      <FlatList
        data={dataset}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onHostelSelect?.(item.id)}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.meta}>{formatPriceRange(item.priceRange)}</Text>
            <Text style={styles.meta}>{formatDistance(item.distanceFromCampusKm)}</Text>
            <Text style={styles.coordinates}>
              lat {item.latitude.toFixed(4)}, lng {item.longitude.toFixed(4)}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default HostelMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[200],
  },
  helper: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[300],
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  rating: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.secondary,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  coordinates: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  separator: {
    height: Spacing.md,
  },
});