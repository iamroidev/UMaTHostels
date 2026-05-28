import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

const VerifyEmailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { resendEmailVerification, loading } = useAuth();

  const handleResendEmail = async () => {
    const { error } = await resendEmailVerification(email);
    if (error) {
      Alert.alert('Resend failed', error.message ?? 'Unable to resend verification email.');
      return;
    }

    Alert.alert('Verification email sent', `We just resent a verification link to ${email}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify your email</Text>
      <Text style={styles.subheading}>
        We sent a verification link to {email}. Tap the link in your inbox to activate your account.
      </Text>
      <Text style={styles.helperText}>
        Need to try again? You can resend the email below, then head back to log in once it&apos;s confirmed.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleResendEmail} disabled={loading}>
        <Text style={styles.primaryButtonText}>
          {loading ? 'Sending…' : 'Resend verification email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing['2xl'],
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  heading: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  subheading: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: Colors.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default VerifyEmailScreen;
