import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import type { RootStackParamList } from '../types';

const SUPPORT_PHONE = '+233204123456';
const SUPPORT_EMAIL = 'support@umat-hostels.com';
const WHATSAPP_NUMBER = '+233559876543';
const FAQ_URL = 'https://umat-hostels.com/support/faq';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const openLink = async (url: string, fallbackMessage: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unavailable', fallbackMessage);
    }
  } catch (error) {
    console.warn('Failed to open support link', error);
    Alert.alert('Unavailable', fallbackMessage);
  }
};

const HelpSupportScreen: React.FC<Props> = () => {
  const handleCall = () => openLink(`tel:${SUPPORT_PHONE}`, 'Unable to start a phone call on this device.');
  const handleEmail = () =>
    openLink(`mailto:${SUPPORT_EMAIL}`, 'Please email support@umat-hostels.com from your mail app.');
  const handleWhatsApp = () =>
    openLink(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`, 'WhatsApp is not available on this device.');
  const handleFaq = () =>
    openLink(FAQ_URL, 'View our support centre at umat-hostels.com/support/faq');

  const helpOptions = [
    {
      title: 'Call Support',
      subtitle: 'Speak with a UMAT Hostels specialist',
      icon: '📞',
      action: handleCall,
    },
    {
      title: 'Email Us',
      subtitle: 'We typically respond within 24 hours',
      icon: '✉️',
      action: handleEmail,
    },
    {
      title: 'WhatsApp',
      subtitle: 'Chat with support on WhatsApp',
      icon: '💬',
      action: handleWhatsApp,
    },
    {
      title: 'Help Centre',
      subtitle: 'Browse FAQs and troubleshooting guides',
      icon: '📚',
      action: handleFaq,
    },
  ];

  const emergencyOptions = [
    {
      title: 'Security Office',
      subtitle: 'UMaT campus security: +233 312 320 555',
      icon: '🛡️',
      action: () => openLink('tel:+233312320555', 'Unable to start a phone call on this device.'),
    },
    {
      title: 'Emergency Services',
      subtitle: 'Ghana emergency line: 112',
      icon: '🚑',
      action: () => openLink('tel:112', 'Unable to start a phone call on this device.'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>We are here to help</Text>
          <Text style={styles.subtitle}>
            Our support team is available every day from 7:00 to 22:00 GMT to assist with bookings, payments,
            and hostel enquiries.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact support</Text>
          {helpOptions.map((option) => (
            <TouchableOpacity key={option.title} style={styles.item} onPress={option.action} activeOpacity={0.85}>
              <View style={styles.iconBubble}>
                <Text style={styles.icon}>{option.icon}</Text>
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{option.title}</Text>
                <Text style={styles.itemSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emergency contacts</Text>
          {emergencyOptions.map((option) => (
            <TouchableOpacity key={option.title} style={styles.item} onPress={option.action} activeOpacity={0.85}>
              <View style={[styles.iconBubble, styles.emergencyIconBubble]}>
                <Text style={styles.icon}>{option.icon}</Text>
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{option.title}</Text>
                <Text style={styles.itemSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.emergencyHint}>
            Use emergency contacts only for urgent safety or security issues. For booking or payment concerns,
            reach out through our support channels above.
          </Text>
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
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.base * 1.6,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray[200],
    gap: Spacing.md,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyIconBubble: {
    backgroundColor: Colors.error,
  },
  icon: {
    fontSize: Typography.fontSize.lg,
  },
  itemCopy: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  itemSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  chevron: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.gray[300],
  },
  emergencyHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    lineHeight: Typography.fontSize.base * 1.4,
  },
});

export default HelpSupportScreen;
