import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  addFavorite,
  createBooking,
  getHostelById,
  getHostels,
  getUserFavorites,
  removeFavorite,
} from '../services/supabase';
import type { HostelDetailsRecord, HostelFilters, SupabaseHostelRecord } from '../types/hostels';

export const useHostels = (filters?: HostelFilters) => {
  return useQuery<SupabaseHostelRecord[]>({
    queryKey: ['hostels', filters],
    queryFn: async () => {
      const { data, error } = await getHostels(filters);
      if (error) {
        throw error;
      }
      let hostels = (data ?? []) as SupabaseHostelRecord[];

      if (filters?.price_range) {
        const { min, max } = filters.price_range;
        hostels = hostels.filter((hostel) => {
          const roomTypes = hostel.room_types ?? [];
          const prices = roomTypes
            .map((room) => Number(room.price_per_semester) || 0)
            .filter((price) => price > 0);

          if (prices.length === 0) {
            return false;
          }

          const roomMin = Math.min(...prices);
          const roomMax = Math.max(...prices);

          return roomMin <= max && roomMax >= min;
        });
      }

      const requiredAmenities = filters?.amenities ?? [];
      if (requiredAmenities.length) {
        hostels = hostels.filter((hostel) => {
          const amenities = hostel.amenities ?? [];
          if (!Array.isArray(amenities) || amenities.length === 0) {
            return false;
          }
          return requiredAmenities.every((amenity) => amenities.includes(amenity));
        });
      }

      return hostels;
    },
  });
};

export const useHostelDetails = (hostelId?: string) => {
  return useQuery<HostelDetailsRecord | null>({
    enabled: Boolean(hostelId),
    queryKey: ['hostel', hostelId],
    queryFn: async () => {
      if (!hostelId) return null;
      const { data, error } = await getHostelById(hostelId);
      if (error) {
        throw error;
      }
      return (data as HostelDetailsRecord) ?? null;
    },
  });
};

export const useUserFavorites = (userId?: string) => {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getUserFavorites(userId);
      if (error) {
        throw error;
      }
      return data ?? [];
    },
  });
};

export const useToggleFavorite = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hostelId, favoriteId }: { hostelId: string; favoriteId?: string }) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (favoriteId) {
        const { error } = await removeFavorite(favoriteId);
        if (error) throw error;
        return { removed: true, favoriteId };
      }

      const { data, error } = await addFavorite(userId, hostelId);
      if (error) throw error;
      return { removed: false, favoriteId: data.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
    },
    onError: (error: any) => {
      Alert.alert('Favorites', error.message || 'Failed to update favorites.');
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await createBooking(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.user_id] });
    },
    onError: (error: any) => {
      Alert.alert('Booking failed', error.message || 'Unable to complete booking.');
    },
  });
};
