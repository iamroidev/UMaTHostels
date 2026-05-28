import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  createPaymentRecord,
  getBookingById,
  getUserPayments,
  updateBookingPaymentStatus,
  updatePaymentStatus,
  upgradeUserToPremium,
} from '../services/supabase';
import type { PaymentProvider } from '../services/payment';

export interface CreatePaymentPayload {
  booking_id?: string | null;
  user_id: string;
  amount: number;
  provider: PaymentProvider;
  phone_number: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string | null;
  transaction_id?: string | null;
  metadata?: Record<string, any> | null;
}

export const useBookingDetailsQuery = (bookingId?: string) => {
  return useQuery({
    enabled: Boolean(bookingId),
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const { data, error } = await getBookingById(bookingId);
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePaymentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload) => {
      const { data, error } = await createPaymentRecord({
        ...payload,
        metadata: payload.metadata ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.user_id] });
      if (variables.booking_id) {
        queryClient.invalidateQueries({ queryKey: ['booking', variables.booking_id] });
      }
    },
    onError: (error: any) => {
      Alert.alert('Payment', error.message || 'Unable to create payment record.');
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paymentId,
      updates,
    }: {
      paymentId: string;
      updates: Partial<{ status: string; transaction_id: string | null; reference: string | null }>;
    }) => {
      const { data, error } = await updatePaymentStatus(paymentId, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['payments', data.user_id] });
      }
    },
  });
};

export const useUpdateBookingPaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      updates,
    }: {
      bookingId: string;
      updates: Parameters<typeof updateBookingPaymentStatus>[1];
    }) => {
      const { data, error } = await updateBookingPaymentStatus(bookingId, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['bookings', data.user_id] });
      }
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      }
    },
    onError: (error: any) => {
      Alert.alert('Booking', error.message || 'Unable to update booking.');
    },
  });
};

export const useUserPaymentsQuery = (userId?: string) => {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['payments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getUserPayments(userId);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useUpgradeToPremium = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, expiresAt }: { userId: string; expiresAt: string | null }) => {
      const { data, error } = await upgradeUserToPremium(userId, expiresAt);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      }
    },
    onError: (error: any) => {
      Alert.alert('Premium Upgrade', error.message || 'Unable to upgrade account.');
    },
  });
};
