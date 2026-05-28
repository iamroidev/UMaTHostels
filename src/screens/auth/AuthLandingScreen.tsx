import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Spacing, Typography } from '../../utils/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthLanding'>;

const AuthLandingScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>UMAT Hostels</Text>
        <Text style={styles.subtitle}>
          Book verified hostels, connect with trusted owners, and unlock premium student services in Tarkwa.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          Continue with your UMAT email address. We&apos;ll email you a verification link to secure your account.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing['2xl'],
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: Spacing['3xl'],
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    lineHeight: 28,
  },
  actions: {
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  buttonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
  color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AuthLandingScreen;
