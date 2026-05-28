import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { PaymentProvider, PaymentService } from '../services/payment';
import { useAuth } from '../context/AuthContext';
import {
  useBookingDetailsQuery,
  useCreatePaymentRecord,
  useUpdateBookingPaymentStatus,
} from '../hooks/usePayments';
import { PAYMENT_METHODS, getProviderLabel, mapPaymentStatus } from '../utils/payments';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const PaymentScreen: React.FC<Props> = ({ route, navigation }) => {
  const paymentService = useMemo(() => new PaymentService(), []);
  const { bookingId, amount, provider } = route.params;
  const { profile } = useAuth();

  const { data: booking, isLoading } = useBookingDetailsQuery(bookingId);
  const createPayment = useCreatePaymentRecord();
  const updateBookingStatus = useUpdateBookingPaymentStatus();

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(provider ?? null);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '');
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

  const formattedAmount = useMemo(() => {
    const value = amount ?? booking?.total_amount ?? 0;
    return Number(value || 0);
  }, [amount, booking?.total_amount]);

  const hostelName = booking?.hostel?.name ?? 'Selected hostel';

  const validate = () => {
    if (!profile?.id) {
      Alert.alert('Payment', 'You need to be signed in to complete payment.');
      return false;
    }
    if (!bookingId) {
      Alert.alert('Payment', 'Booking information is missing.');
      return false;
    }
    if (!phoneNumber) {
      Alert.alert('Payment', 'Enter the mobile money number you want to pay with.');
      return false;
    }

    if (!paymentService.validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid number',
        'Enter a valid Ghana mobile number including the leading 0 or +233 prefix.'
      );
      return false;
    }

    if (!selectedProvider) {
      const detected = paymentService.detectProvider(phoneNumber);
      if (!detected) {
        Alert.alert(
          'Select network',
          'Choose your mobile money network so we can route your payment correctly.'
        );
        return false;
      }
      setSelectedProvider(detected);
    }

    if (!formattedAmount || Number.isNaN(formattedAmount)) {
      Alert.alert('Payment', 'We could not determine the amount for this booking.');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validate() || !profile?.id || !bookingId) {
      return;
    }

    const providerToUse = selectedProvider ?? paymentService.detectProvider(phoneNumber);
    if (!providerToUse) {
      return;
    }

    try {
      setProcessing(true);
      const formattedPhone = paymentService.formatGhanaianPhoneNumber(phoneNumber);
      const reference = `BOOKING_${bookingId}_${Date.now()}`;

      const response = await paymentService.processPayment(providerToUse, {
        amount: formattedAmount,
        currency: 'GHS',
        phoneNumber: formattedPhone,
        description: `${hostelName} booking payment`,
        reference,
      });

      const paymentStatus = mapPaymentStatus(response.status);

      const paymentRecord = await createPayment.mutateAsync({
        booking_id: bookingId,
        user_id: profile.id,
        amount: formattedAmount,
        provider: providerToUse,
        phone_number: formattedPhone,
        status: paymentStatus,
        reference: response.reference || reference,
        transaction_id: response.transactionId || null,
        metadata: {
          providerMessage: response.message,
          providerStatus: response.status,
        },
      });

      await updateBookingStatus.mutateAsync({
        bookingId,
        updates: {
          payment_status: paymentStatus,
          payment_method: providerToUse,
          payment_reference: paymentRecord?.reference ?? response.reference ?? reference,
        },
      });

      if (paymentStatus === 'completed') {
        Alert.alert(
          'Payment successful',
          'Your booking has been secured. We will notify the hostel owner immediately.',
          [
            {
              text: 'Done',
              onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),
            },
          ]
        );
      } else if (paymentStatus === 'pending') {
        Alert.alert(
          'Payment initiated',
          'Approve the prompt on your phone to finalize the booking. We will update you once the payment clears.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),
            },
          ]
        );
      } else {
        Alert.alert('Payment failed', response.message || 'Payment could not be completed.');
      }
    } catch (error: any) {
      Alert.alert('Payment error', error.message || 'Unable to process payment right now.');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading booking…</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>We could not find this booking.</Text>
      </SafeAreaView>
    );
  }

  const detectedProvider = paymentService.detectProvider(phoneNumber);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Complete your payment</Text>
          <Text style={styles.subtitle}>
            Secure your reservation at {hostelName}. Confirm the payment on your mobile device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hostel</Text>
            <Text style={styles.summaryValue}>{hostelName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>{formatDate(booking.check_in_date)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>{formatDate(booking.check_out_date)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={[styles.summaryValue, styles.amountValue]}>
              GHS {formattedAmount.toLocaleString('en-US')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile money number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0241234567 or +233241234567"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          {detectedProvider ? (
            <Text style={styles.helperText}>
              Detected network: <Text style={styles.helperTextHighlight}>{getProviderLabel(detectedProvider)}</Text>
            </Text>
          ) : (
            <Text style={styles.helperText}>We'll detect the network automatically.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select payment network</Text>
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

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>How it works</Text>
          <Text style={styles.noticeText}>1. Tap "Pay now" to send the request to your network.</Text>
          <Text style={styles.noticeText}>2. Approve the prompt or dial the USSD code to confirm.</Text>
          <Text style={styles.noticeText}>3. We'll update your booking once payment clears.</Text>
          <Text style={styles.noticeFootnote}>
            Having issues? Call the network short code above or reach out to support on campus.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.payButton, processing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={processing || createPayment.isPending || updateBookingStatus.isPending}
        activeOpacity={0.9}
      >
        <Text style={styles.payButtonText}>
          {processing || createPayment.isPending || updateBookingStatus.isPending ? 'Processing…' : 'Pay now'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.base,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  amountValue: {
    color: Colors.secondary,
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
  helperTextHighlight: {
    color: Colors.primary,
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
  noticeCard: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  noticeTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  noticeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
  noticeFootnote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  payButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  payButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default PaymentScreen;
