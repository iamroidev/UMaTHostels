import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HostelFilters } from '../types/hostels';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage implementation for React Native
const customStorage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getSession = () => {
  return supabase.auth.getSession();
};

// Database helper functions
export const getHostels = async (filters?: HostelFilters) => {
  let query = supabase.from('hostels').select(`
    *,
    room_types:hostel_room_types(*),
    owner:profiles(full_name, phone_number)
  `);

  if (filters) {
    if (filters.price_range) {
      // Filter by price range in room_types
    }
    if (filters.search_query) {
      const term = `%${filters.search_query.trim()}%`;
      query = query.or(`name.ilike.${term},address.ilike.${term}`);
    }
    if (filters.distance_from_campus) {
      query = query.lte('distance_from_campus', filters.distance_from_campus);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }
    if (filters.gender_restriction) {
      query = query.eq('gender_restriction', filters.gender_restriction);
    }
    if (filters.rating_min) {
      query = query.gte('rating', filters.rating_min);
    }
  }

  return await query.order('created_at', { ascending: false });
};

export const getHostelById = async (id: string) => {
  return await supabase
    .from('hostels')
    .select(`
      *,
      room_types:hostel_room_types(*),
      reviews:hostel_reviews(
        *,
        user:profiles(full_name, student_id)
      ),
      owner:profiles(full_name, phone_number, email)
    `)
    .eq('id', id)
    .single();
};

export const createBooking = async (bookingData: any) => {
  return await supabase.from('bookings').insert([bookingData]).select().single();
};

export const getUserBookings = async (userId: string) => {
  return await supabase
    .from('bookings')
    .select(`
      *,
      hostel:hostels(name, address),
      room_type:hostel_room_types(name, price_per_semester)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const getBookingById = async (bookingId: string) => {
  return await supabase
    .from('bookings')
    .select(`
      *,
      hostel:hostels(id, name, address, images),
      room_type:hostel_room_types(id, name, price_per_semester)
    `)
    .eq('id', bookingId)
    .maybeSingle();
};

export const updateBookingPaymentStatus = async (
  bookingId: string,
  updates: {
    payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
    status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
    payment_method?: string | null;
    payment_reference?: string | null;
  }
) => {
  return await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();
};

export const createReview = async (reviewData: any) => {
  return await supabase.from('hostel_reviews').insert([reviewData]).select().single();
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  return await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
};

export const uploadImage = async (file: File, bucket: string, path: string) => {
  return await supabase.storage.from(bucket).upload(path, file);
};

export const getPublicUrl = (bucket: string, path: string) => {
  return supabase.storage.from(bucket).getPublicUrl(path);
};

export const getUserFavorites = async (userId: string) => {
  return await supabase
    .from('user_favorites')
    .select(`
      id,
      hostel_id,
      created_at,
      hostel:hostels(*, room_types:hostel_room_types(*))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const addFavorite = async (userId: string, hostelId: string) => {
  return await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, hostel_id: hostelId }])
    .select()
    .single();
};

export const removeFavorite = async (favoriteId: string) => {
  return await supabase.from('user_favorites').delete().eq('id', favoriteId);
};

export const getConversations = async (userId: string) => {
  return await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!conversations_user1_id_fkey(full_name, phone_number, avatar_url),
      user2:profiles!conversations_user2_id_fkey(full_name, phone_number, avatar_url),
      hostel:hostels(id, name, images)
    `)
  .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });
};

export const getMessagesForConversation = async (conversationId: string) => {
  return await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  return await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      },
    ])
    .select()
    .single();
};

export const createConversation = async (
  userId: string,
  recipientId: string,
  hostelId?: string
) => {
  const [user1Id, user2Id] = userId < recipientId ? [userId, recipientId] : [recipientId, userId];
  return await supabase
    .from('conversations')
    .upsert(
      {
        user1_id: user1Id,
        user2_id: user2Id,
        hostel_id: hostelId ?? null,
      },
      { onConflict: 'user1_id,user2_id,hostel_id', ignoreDuplicates: false }
    )
    .select()
    .single();
};

export const subscribeToConversation = (
  conversationId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();
};

export const createPaymentRecord = async (payload: any) => {
  return await supabase.from('payments').insert([payload]).select().single();
};

export const updatePaymentStatus = async (paymentId: string, updates: any) => {
  return await supabase.from('payments').update(updates).eq('id', paymentId).select().single();
};

export const getUserPayments = async (userId: string) => {
  return await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const upgradeUserToPremium = async (userId: string, expiresAt: string | null) => {
  return await supabase
    .from('profiles')
    .update({ is_premium: true, premium_expires_at: expiresAt })
    .eq('id', userId)
    .select()
    .single();
};