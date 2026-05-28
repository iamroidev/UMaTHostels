import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import type { RootStackParamList } from '../types';

const SETTINGS_STORAGE_KEY = 'umat-hostels-settings';

interface AppSettings {
  pushNotifications: boolean;
  emailUpdates: boolean;
  locationSuggestions: boolean;
  dataSaverMode: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const defaultSettings: AppSettings = {
  pushNotifications: true,
  emailUpdates: false,
  locationSuggestions: true,
  dataSaverMode: false,
};

const SettingsScreen: React.FC<Props> = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AppSettings;
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load settings', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = async (key: keyof AppSettings) => {
    try {
      const updated = { ...settings, [key]: !settings[key] };
      setSettings(updated);
      setSaving(true);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to persist setting', error);
      Alert.alert('Update failed', 'Unable to save your preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSettings(defaultSettings);
      setSaving(true);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.warn('Failed to reset settings', error);
      Alert.alert('Reset failed', 'Unable to reset preferences right now.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </SafeAreaView>
    );
  }

  const options: Array<{ key: keyof AppSettings; title: string; subtitle: string }> = [
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      subtitle: 'Receive instant alerts for booking updates and messages',
    },
    {
      key: 'emailUpdates',
      title: 'Email Updates',
      subtitle: 'Get periodic newsletters and hostel recommendations via email',
    },
    {
      key: 'locationSuggestions',
      title: 'Location-based Suggestions',
      subtitle: 'Use your location to recommend nearby hostels and offers',
    },
    {
      key: 'dataSaverMode',
      title: 'Data Saver Mode',
      subtitle: 'Optimise images and defer rich media on mobile data',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {options.map((option) => (
          <View key={option.key} style={styles.optionRow}>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Switch
              value={settings[option.key]}
              onValueChange={() => handleToggle(option.key)}
              trackColor={{ false: Colors.gray[300], true: Colors.secondary }}
              thumbColor={settings[option.key] ? Colors.primary : Colors.white}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.85}>
          <Text style={styles.resetButtonText}>Reset to defaults</Text>
        </TouchableOpacity>
        {saving ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.footerHint}>Preferences are saved automatically</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray[200],
  },
  optionCopy: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  optionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  resetButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  footerHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
});

export default SettingsScreen;
