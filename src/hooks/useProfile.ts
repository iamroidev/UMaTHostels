import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { createReview, getUserBookings, updateUserProfile } from '../services/supabase';

export const useUserBookingsQuery = (userId?: string) => {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['bookings', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getUserBookings(userId);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useUpdateProfile = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      if (!userId) throw new Error('User is not authenticated');
      const { data, error } = await updateUserProfile(userId, payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      Alert.alert('Profile Update Failed', error.message || 'Unable to update profile');
    },
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await createReview(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      if (variables?.hostel_id) {
        queryClient.invalidateQueries({ queryKey: ['hostel', variables.hostel_id] });
      }
    },
    onError: (error: any) => {
      Alert.alert('Review Error', error.message || 'Failed to submit review');
    },
  });
};
