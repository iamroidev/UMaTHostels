import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, CardVariants } from '../utils/theme';
import type { HostelCardData } from '../types/hostels';

interface CardProps {
  children: React.ReactNode;
  variant?: keyof typeof CardVariants;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
}) => {
  const cardStyle = [
    CardVariants[variant],
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

interface HostelCardProps {
  hostel: HostelCardData;
  onPress: () => void;
}

export const HostelCard: React.FC<HostelCardProps> = ({ hostel, onPress }) => {
  const priceLabel =
    hostel.priceRange.min === hostel.priceRange.max
      ? `GHS ${hostel.priceRange.min}/semester`
      : `GHS ${hostel.priceRange.min} - ${hostel.priceRange.max}/semester`;

  return (
    <Card style={styles.hostelCard}>
      <View style={styles.hostelHeader}>
        <View style={styles.hostelImage}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
        <View style={styles.hostelInfo}>
          <Text style={styles.hostelName} numberOfLines={1}>
            {hostel.name}
          </Text>
          <Text style={styles.hostelAddress} numberOfLines={1}>
            {hostel.address}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {hostel.rating}</Text>
            <Text style={styles.reviewCount}>({hostel.reviewCount})</Text>
          </View>
        </View>
        {hostel.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.priceRange}>{priceLabel}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  hostelCard: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  hostelHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hostelImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 24,
  },
  hostelInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hostelName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  hostelAddress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  premiumBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 12,
  },
  priceRange: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});