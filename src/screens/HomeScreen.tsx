import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabParamList, RootStackParamList } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { HostelCard } from '../components/Card';
import { useHostels } from '../hooks/useHostels';
import { useAuth } from '../context/AuthContext';
import { mapHostelsToCardData } from '../utils/hostel';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { profile } = useAuth();
  const { data: hostelsData, isLoading, isRefetching, refetch } = useHostels();

  const featuredHostels = useMemo(() => mapHostelsToCardData(hostelsData ?? []), [hostelsData]);

  const hasHostels = featuredHostels.length > 0;

  const handleSearch = () => {
    navigation.navigate('Search', {});
  };

  const handleHostelPress = (hostelId: string) => {
    navigation.navigate('HostelDetails', { hostelId });
  };

  const renderFeaturedHostels = () => {
    if (isLoading && !hasHostels) {
      return <ActivityIndicator color={Colors.primary} style={styles.loadingIndicator} />;
    }

    if (hasHostels) {
      return featuredHostels.map((hostel) => (
        <TouchableOpacity key={hostel.id} onPress={() => handleHostelPress(hostel.id)}>
          <HostelCard hostel={hostel} onPress={() => handleHostelPress(hostel.id)} />
        </TouchableOpacity>
      ));
    }

    return (
      <Text style={styles.emptyState}>
        No hostels found yet. Pull to refresh or check back soon as listings are added.
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        <View style={styles.heroSection}>
          <Text style={styles.welcomeText}>
            {profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'Find Your Perfect'}
          </Text>
          <Text style={styles.titleText}>Student Accommodation</Text>
          <Text style={styles.subtitleText}>Discover verified hostels near UMAT campus</Text>

          <Button
            title="Search Hostels"
            onPress={handleSearch}
            variant="secondary"
            size="lg"
            fullWidth
            style={styles.searchButton}
          />
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Verified Hostels</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Happy Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>🏠</Text>
              <Text style={styles.actionText}>New Listings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Price Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={styles.actionText}>Top Rated</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionText}>Near Campus</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Hostels</Text>
          {renderFeaturedHostels()}
        </View>

        <View style={styles.premiumCTA}>
          <Text style={styles.premiumTitle}>Unlock Premium Features</Text>
          <Text style={styles.premiumSubtitle}>
            Get access to contact details, messaging, and more for just 20 GHS
          </Text>
          <Button title="Upgrade to Premium" onPress={() => {}} variant="primary" size="md" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing['3xl'],
  },
  welcomeText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  titleText: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  subtitleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[300],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  searchButton: {
    marginTop: Spacing.md,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.md,
  },
  quickActions: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: Colors.background.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  featuredSection: {
    paddingTop: Spacing.lg,
  },
  loadingIndicator: {
    marginVertical: Spacing.lg,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
  },
  premiumCTA: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  premiumSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});

export default HomeScreen;