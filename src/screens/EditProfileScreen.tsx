import React, { useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfile } from '../hooks/useProfile';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '../utils/theme';
import type { RootStackParamList } from '../types';

const GHANA_PHONE_REGEX = /^(\+233|0)[2-5]\d{8}$/;

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, user, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile(user?.id);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '');
  const [studentId, setStudentId] = useState(profile?.student_id ?? '');
  const [university, setUniversity] = useState(profile?.university ?? 'University of Mines and Technology');

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setEmail(profile?.email ?? '');
    setPhoneNumber(profile?.phone_number ?? '');
    setStudentId(profile?.student_id ?? '');
    setUniversity(profile?.university ?? 'University of Mines and Technology');
  }, [profile]);

  const isSubmitting = updateProfile.isPending;

  const isFormValid = useMemo(() => {
    if (!fullName.trim()) return false;
    if (phoneNumber.trim() && !GHANA_PHONE_REGEX.test(phoneNumber.trim())) return false;
    return true;
  }, [fullName, phoneNumber]);

  const handleSave = () => {
    if (!isFormValid) {
      Alert.alert('Invalid details', 'Please provide a valid full name and Ghanaian phone number.');
      return;
    }

    const payload: Record<string, any> = {
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone_number: phoneNumber.trim() || null,
      student_id: studentId.trim() || null,
      university: university.trim() || null,
    };

    updateProfile.mutate(payload, {
      onSuccess: async () => {
        await refreshProfile();
        Alert.alert('Profile updated', 'Your profile information has been saved.');
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert('Update failed', error.message ?? 'Unable to save your profile right now.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Ama K. Mensah"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@student.umat.edu.gh"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="e.g. 0241234567"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <Text style={styles.helperText}>Format: 0XXXXXXXXX or +233XXXXXXXXX</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Student ID</Text>
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. UMAT2025"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>University</Text>
              <TextInput
                value={university}
                onChangeText={setUniversity}
                placeholder="University name"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
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
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.background.secondary,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default EditProfileScreen;
