import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { useHostelDetails } from '../hooks/useHostels';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import type { HostelDetailsRecord, RoomTypeRecord } from '../types/hostels';
import { useAuth } from '../context/AuthContext';
import type { Profile as UserProfile } from '../context/AuthContext';
import { useStartConversationMutation } from '../hooks/useMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'HostelDetails'>;

const formatPrice = (value?: number | null) => {
  if (!value) return 'Pricing unavailable';
  return `GHS ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0 })} / semester`;
};

const computeAverageRating = (hostel?: HostelDetailsRecord | null) => {
  if (!hostel) return 0;
  if (typeof hostel.rating === 'number' && !Number.isNaN(hostel.rating)) {
    return hostel.rating;
  }
  const reviews = hostel.reviews ?? [];
  if (!reviews.length) return 0;
  const sum = reviews.reduce((total, review) => total + (Number(review.rating) || 0), 0);
  return reviews.length ? sum / reviews.length : 0;
};

const checkContactEligibility = (
  isPremiumUser: boolean,
  hostel: HostelDetailsRecord | null | undefined,
  profile: UserProfile | null
) => {
  if (!isPremiumUser) {
    return {
      ok: false,
      title: 'Premium required',
      message:
        'Upgrade to Premium to unlock direct messaging with hostel owners and access verified contact details.',
    } as const;
  }

  if (!hostel?.owner_id) {
    return {
      ok: false,
      title: 'Contact unavailable',
      message: 'This hostel owner is not yet connected to messaging.',
    } as const;
  }

  if (!profile?.id) {
    return {
      ok: false,
      title: 'Account error',
      message: 'Please sign in again to contact the owner.',
    } as const;
  }

  return { ok: true } as const;
};

const HostelDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { hostelId } = route.params;
  const { profile } = useAuth();
  const startConversation = useStartConversationMutation();
  const { data: hostel, isLoading, isRefetching, refetch, error } = useHostelDetails(hostelId);

  const rating = useMemo(() => computeAverageRating(hostel), [hostel]);
  const reviewCount = hostel?.review_count ?? hostel?.reviews?.length ?? 0;
  const isPremiumUser = Boolean(profile?.is_premium);
  const coverImage = hostel?.images?.[0];
  const amenities = hostel?.amenities ?? [];
  const roomTypes = (hostel?.room_types ?? []) as RoomTypeRecord[];

  let contactButtonLabel = 'Unlock Premium to Contact';
  if (startConversation.isPending) {
    contactButtonLabel = 'Connecting…';
  } else if (isPremiumUser) {
    contactButtonLabel = 'Contact Owner';
  }

  const handleBookRoom = (room: RoomTypeRecord) => {
    navigation.navigate('Booking', {
      hostelId: hostel!.id,
      roomTypeId: room.id ?? undefined,
    });
  };

  const revealContactDetails = (hostelRecord?: HostelDetailsRecord | null) => {
    const ownerPhone = hostelRecord?.owner?.phone_number;
    const ownerEmail = hostelRecord?.owner?.email;
    const lines = [
      ownerPhone ? `Phone: ${ownerPhone}` : null,
      ownerEmail ? `Email: ${ownerEmail}` : null,
    ].filter(Boolean);

    if (lines.length) {
      Alert.alert('Contact details', lines.join('\n'));
    }
  };

  const handleContact = () => {
    const guard = checkContactEligibility(isPremiumUser, hostel, profile);
    if (!guard.ok) {
      Alert.alert(guard.title ?? 'Unavailable', guard.message ?? 'Please try again later.');
      return;
    }

    const currentHostel = hostel as HostelDetailsRecord;
    const ownerId = currentHostel.owner_id as string;
    const userId = profile?.id as string;

    startConversation.mutate(
      { userId, recipientId: ownerId, hostelId: currentHostel.id },
      {
        onSuccess: (conversation) => {
          if (conversation?.id) {
            navigation.navigate('MessageThread', {
              conversationId: conversation.id,
              recipientId: ownerId,
              hostelId: currentHostel.id,
              recipientName: currentHostel.owner?.full_name ?? currentHostel.name,
            });
          }

          revealContactDetails(currentHostel);
        },
      }
    );
  };

  if (isLoading && !hostel) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hostel || error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Hostel unavailable</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't load this hostel right now. Please check your connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.heroContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>No image available</Text>
            </View>
          )}
          {hostel.is_featured ? (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.hostelName}>{hostel.name}</Text>
          <Text style={styles.hostelAddress}>{hostel.address ?? 'Tarkwa, Ghana'}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviewCount} reviews)</Text>
            {hostel.distance_from_campus ? (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>
                  {hostel.distance_from_campus} km from UMaT
                </Text>
              </View>
            ) : null}
          </View>

          {hostel.description ? (
            <Text style={styles.description}>{hostel.description}</Text>
          ) : null}
        </View>

        {amenities.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {roomTypes.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Types</Text>
            {roomTypes.map((room) => (
              <View key={room.id ?? room.name} style={styles.roomCard}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name ?? 'Room option'}</Text>
                  {room.description ? (
                    <Text style={styles.roomDescription}>{room.description}</Text>
                  ) : null}
                  <Text style={styles.roomPrice}>{formatPrice(room.price_per_semester)}</Text>
                  {typeof room.available_rooms === 'number' ? (
                    <Text style={styles.roomAvailability}>
                      {room.available_rooms} rooms available
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookRoom(room)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {hostel.owner ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hostel Owner</Text>
            <View style={styles.ownerCard}>
              <Text style={styles.ownerName}>{hostel.owner.full_name ?? 'Hostel Owner'}</Text>
              <Text style={styles.ownerHint}>
                {isPremiumUser
                  ? 'Contact details are available via the button below.'
                  : 'Upgrade to Premium to unlock contact details and in-app messaging.'}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.contactButton,
            !isPremiumUser && styles.contactButtonSecondary,
            startConversation.isPending && styles.contactButtonDisabled,
          ]}
          onPress={handleContact}
          activeOpacity={0.9}
          disabled={startConversation.isPending}
        >
          <Text
            style={[
              styles.contactButtonText,
              !isPremiumUser && styles.contactButtonTextSecondary,
            ]}
          >
            {contactButtonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },
  heroContainer: {
    position: 'relative',
    height: 260,
    backgroundColor: Colors.gray[200],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  featuredBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  featuredBadgeText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  hostelName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  hostelAddress: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ratingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  reviewCountText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  distanceBadge: {
    backgroundColor: Colors.background.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray[200],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenityChip: {
    backgroundColor: Colors.background.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  amenityText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  roomInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  roomName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  roomDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  roomPrice: {
    fontSize: Typography.fontSize.base,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  roomAvailability: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignSelf: 'center',
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  ownerCard: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ownerName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  ownerHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  actionBar: {
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  contactButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  contactButtonSecondary: {
    backgroundColor: Colors.background.accent,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  contactButtonTextSecondary: {
    color: Colors.primary,
  },
  contactButtonDisabled: {
    opacity: 0.65,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default HostelDetailsScreen;