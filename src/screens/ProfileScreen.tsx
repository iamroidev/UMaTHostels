import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabParamList, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, signOut, refreshProfile, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const initials = useMemo(() => {
    if (!profile?.full_name) return 'U';
    const parts = profile.full_name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [profile?.full_name]);

  const isPremium = Boolean(profile?.is_premium);
  const premiumExpiry = formatDate(profile?.premium_expires_at ?? undefined);
  const accountStatusLabel = isPremium ? 'Premium Member' : 'Free Account';
  let statusDescription = 'Upgrade to unlock exclusive features';
  if (isPremium) {
    statusDescription = premiumExpiry
      ? `Active until ${premiumExpiry}`
      : 'Active premium subscription';
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    navigation.navigate('PremiumUpgrade');
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message ?? 'Please try again.');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  type MenuKey =
    | 'bookings'
    | 'favorites'
    | 'messages'
    | 'payments'
    | 'settings'
    | 'help';

  const menuItems: Array<{ key: MenuKey; title: string; subtitle: string; icon: string }> = [
    { key: 'bookings', title: 'My Bookings', subtitle: 'View and manage reservations', icon: '📋' },
    { key: 'favorites', title: 'Favorites', subtitle: 'Saved hostels', icon: '❤️' },
    { key: 'messages', title: 'Messages', subtitle: 'Chat with hostel owners', icon: '💬' },
    { key: 'payments', title: 'Payment History', subtitle: 'Track your transactions', icon: '💳' },
    { key: 'settings', title: 'Settings', subtitle: 'App preferences', icon: '⚙️' },
    { key: 'help', title: 'Help & Support', subtitle: 'Get assistance', icon: '❓' },
  ];

  const handleMenuPress = (key: MenuKey) => {
    switch (key) {
      case 'bookings':
        navigation.navigate('Bookings');
        break;
      case 'favorites':
        navigation.navigate('Favorites');
        break;
      case 'messages':
        navigation.navigate('Messages');
        break;
      case 'payments':
        navigation.navigate('PaymentHistory');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('HelpSupport');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name ?? 'UMaT Student'}</Text>
            {profile?.email ? <Text style={styles.userDetail}>{profile.email}</Text> : null}
            {profile?.phone_number ? <Text style={styles.userDetail}>{profile.phone_number}</Text> : null}
            {profile?.student_id ? (
              <Text style={styles.userDetail}>Student ID: {profile.student_id}</Text>
            ) : null}
            <View
              style={[styles.statusPill, isPremium ? styles.statusPillPremium : styles.statusPillFree]}
            >
              <Text
                style={[styles.statusText, isPremium ? styles.statusTextPremium : styles.statusTextFree]}
              >
                {accountStatusLabel}
              </Text>
            </View>
            <Text style={styles.statusDescription}>{statusDescription}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleEditProfile} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          {!isPremium && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpgrade} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Upgrade - 20 GHS</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => handleMenuPress(item.key)}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!isPremium && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>Unlock Premium Benefits</Text>
            <Text style={styles.premiumSubtitle}>
              Access verified contact details, in-app messaging, unlimited favorites, and exclusive deals.
            </Text>
            <View style={styles.premiumList}>
              <Text style={styles.premiumBullet}>• Contact hostel owners instantly</Text>
              <Text style={styles.premiumBullet}>• Real-time messaging with owners</Text>
              <Text style={styles.premiumBullet}>• Unlimited favorites and saved searches</Text>
              <Text style={styles.premiumBullet}>• Priority support and booking assistance</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpgrade} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.secondaryButton, styles.signOutButton]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text style={[styles.secondaryButtonText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  userDetail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  statusPillPremium: {
    backgroundColor: Colors.secondary,
  },
  statusPillFree: {
    backgroundColor: Colors.background.accent,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  statusTextPremium: {
    color: Colors.primary,
  },
  statusTextFree: {
    color: Colors.text.secondary,
  },
  statusDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    flex: 1,
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
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray[200],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIconText: {
    fontSize: Typography.fontSize.lg,
  },
  menuCopy: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  menuSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  menuChevron: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.gray[300],
  },
  premiumCard: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  premiumTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  premiumSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  premiumList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  premiumBullet: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
  signOutButton: {
    marginTop: Spacing.sm,
  },
  signOutText: {
    color: Colors.error,
  },
});

export default ProfileScreen;