import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import { PaymentProvider, PaymentService, createPremiumUpgradePayment } from '../services/payment';
import { useAuth } from '../context/AuthContext';
import {
  useCreatePaymentRecord,
  useUpgradeToPremium,
} from '../hooks/usePayments';
import { PAYMENT_METHODS, getProviderLabel, mapPaymentStatus } from '../utils/payments';

const PREMIUM_PRICE = 20;

type Props = NativeStackScreenProps<RootStackParamList, 'PremiumUpgrade'>;

const PremiumUpgradeScreen: React.FC<Props> = ({ navigation }) => {
  const paymentService = useMemo(() => new PaymentService(), []);
  const { profile, refreshProfile } = useAuth();
  const createPayment = useCreatePaymentRecord();
  const upgradeMutation = useUpgradeToPremium();

  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!selectedProvider && phoneNumber) {
      const detected = paymentService.detectProvider(phoneNumber);
      if (detected) {
        setSelectedProvider(detected);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  const validate = () => {
    if (!profile?.id) {
      Alert.alert('Premium', 'You need to be signed in to upgrade.');
      return false;
    }
    if (!phoneNumber) {
      Alert.alert('Premium', 'Enter the mobile number you would like to use for payment.');
      return false;
    }
    if (!paymentService.validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid number',
        'Enter a valid Ghana mobile number including the leading 0 or +233 prefix.'
      );
      return false;
    }

    if (!selectedProvider && !paymentService.detectProvider(phoneNumber)) {
      Alert.alert('Select network', 'Choose your mobile money network.');
      return false;
    }

    return true;
  };

  const handleUpgrade = async () => {
    if (!validate() || !profile?.id) {
      return;
    }

    const providerToUse = selectedProvider ?? paymentService.detectProvider(phoneNumber);
    if (!providerToUse) {
      return;
    }

    try {
      setProcessing(true);
      const formattedPhone = paymentService.formatGhanaianPhoneNumber(phoneNumber);
      const paymentRequest = createPremiumUpgradePayment(formattedPhone);

      const response = await paymentService.processPayment(providerToUse, paymentRequest);
      const paymentStatus = mapPaymentStatus(response.status);

      await createPayment.mutateAsync({
        booking_id: null,
        user_id: profile.id,
  amount: PREMIUM_PRICE,
        provider: providerToUse,
        phone_number: formattedPhone,
        status: paymentStatus,
        reference: response.reference ?? paymentRequest.reference,
        transaction_id: response.transactionId ?? null,
        metadata: {
          purpose: 'premium_upgrade',
          providerMessage: response.message,
          providerStatus: response.status,
        },
      });

      if (paymentStatus === 'completed') {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        await upgradeMutation.mutateAsync({
          userId: profile.id,
          expiresAt: expiry.toISOString(),
        });
        await refreshProfile();
        Alert.alert(
          'Welcome to Premium',
          'Your premium membership is active. Enjoy direct owner contact, messaging, and more!',
          [
            {
              text: 'Great!',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else if (paymentStatus === 'pending') {
        Alert.alert(
          'Payment initiated',
          'Approve the prompt on your mobile device. We will activate premium automatically once payment clears.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Payment failed', response.message || 'Unable to complete payment.');
      }
    } catch (error: any) {
      Alert.alert('Upgrade error', error.message || 'Unable to process upgrade right now.');
    } finally {
      setProcessing(false);
    }
  };

  const detectedProvider = paymentService.detectProvider(phoneNumber);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.title}>Unlock Premium Access</Text>
          <Text style={styles.subtitle}>
            Connect directly with hostel owners, send instant messages, and enjoy priority support.
          </Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>GHS {PREMIUM_PRICE}</Text>
            <Text style={styles.priceCaption}>One-time annual fee</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile money number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0241234567 or +233241234567"
            placeholderTextColor={Colors.text.tertiary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          {detectedProvider ? (
            <Text style={styles.helperText}>
              Detected network: <Text style={styles.helperHighlight}>{getProviderLabel(detectedProvider)}</Text>
            </Text>
          ) : (
            <Text style={styles.helperText}>We'll detect your network automatically.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select your network</Text>
          <View style={styles.methodList}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedProvider === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                  onPress={() => setSelectedProvider(method.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.methodHeader}>
                    <Text style={[styles.methodTitle, isSelected && styles.methodTitleSelected]}>
                      {method.title}
                    </Text>
                    {isSelected ? <Text style={styles.methodCheck}>✔</Text> : null}
                  </View>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>Premium benefits</Text>
          <Text style={styles.benefitItem}>• Direct hostel owner contact</Text>
          <Text style={styles.benefitItem}>• In-app messaging and instant notifications</Text>
          <Text style={styles.benefitItem}>• Unlimited favorites and saved searches</Text>
          <Text style={styles.benefitItem}>• Priority assistance from the UMaT Hostels team</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handleUpgrade}
        disabled={processing || createPayment.isPending || upgradeMutation.isPending}
        activeOpacity={0.9}
      >
        <Text style={styles.payButtonText}>
          {processing || createPayment.isPending || upgradeMutation.isPending
            ? 'Processing…'
            : 'Upgrade now'}
        </Text>
      </TouchableOpacity>
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
  heroSection: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    opacity: 0.9,
  },
  priceTag: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  priceCaption: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  helperHighlight: {
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  methodList: {
    gap: Spacing.sm,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    backgroundColor: Colors.white,
  },
  methodCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.background.accent,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  methodTitleSelected: {
    color: Colors.primary,
  },
  methodSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  methodCheck: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  benefitCard: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  benefitTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  benefitItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
  payButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  payButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  payButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default PremiumUpgradeScreen;
