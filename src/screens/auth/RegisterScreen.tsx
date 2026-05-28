import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

const formatPhone = (value: string) => {
  const digits = value.replace(/[^0-9+]/g, '');
  if (digits.startsWith('0')) {
    return `+233${digits.slice(1)}`;
  }
  if (!digits.startsWith('+233')) {
    return `+233${digits}`;
  }
  return digits;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUpWithPassword, resendEmailVerification, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Sign Up', 'Please fill out all required fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Sign Up', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Sign Up', 'Passwords do not match.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const formattedPhone = phone ? formatPhone(phone) : undefined;
    const { error } = await signUpWithPassword(trimmedEmail, password, {
      fullName,
      studentId,
      phoneNumber: formattedPhone,
    });

    if (error) {
      Alert.alert('Sign Up', error.message ?? 'Could not create account.');
      return;
    }

    // Supabase sends the first verification email automatically; offer a manual resend just in case.
    if (trimmedEmail) {
      const { error: resendError } = await resendEmailVerification(trimmedEmail);
      if (resendError) {
        console.warn('Failed to trigger verification email', resendError);
      }
    }

    Alert.alert(
      'Verify your email',
      `We sent a verification link to ${trimmedEmail}. Check your inbox to activate your account.`
    );
    navigation.navigate('VerifyEmail', { email: trimmedEmail });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subheading}>
          Unlock premium hostel listings, real-time availability, and secure messaging with hostel owners.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="0241234567"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@student.umat.edu.gh"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Student ID (optional)</Text>
          <TextInput
            style={styles.input}
            value={studentId}
            onChangeText={setStudentId}
            placeholder="UMaT/2025/12345"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Create a strong password"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
            placeholderTextColor={Colors.gray[400]}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creating account…' : 'Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: Spacing['2xl'],
    gap: Spacing.lg,
  },
  heading: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  formGroup: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default RegisterScreen;
