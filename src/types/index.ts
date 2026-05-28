import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PaymentProvider } from '../services/payment';

export interface User {
  id: string;
  email: string;
  phone_number?: string;
  full_name?: string;
  student_id?: string;
  university?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_from_campus?: number;
  price_range: {
    min: number;
    max: number;
  };
  room_types: RoomType[];
  amenities: string[];
  images: string[];
  contact_info: ContactInfo;
  owner_id: string;
  is_verified: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  availability_status: 'available' | 'limited' | 'full';
  gender_restriction?: 'male' | 'female' | 'mixed';
  house_rules: string[];
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price_per_semester: number;
  price_per_academic_year: number;
  capacity: number;
  available_rooms: number;
  features: string[];
}

export interface ContactInfo {
  phone: string;
  whatsapp?: string;
  email?: string;
  office_hours?: string;
}

export interface Review {
  id: string;
  hostel_id: string;
  user_id: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  user: {
    full_name: string;
    student_id?: string;
  };
}

export interface Booking {
  id: string;
  user_id: string;
  hostel_id: string;
  room_type_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location';
  is_read: boolean;
  created_at: string;
}

export interface SearchFilters {
  price_range?: {
    min: number;
    max: number;
  };
  distance_from_campus?: number;
  room_types?: string[];
  amenities?: string[];
  gender_restriction?: 'male' | 'female' | 'mixed';
  rating_min?: number;
  availability_status?: 'available' | 'limited';
}

export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: { filters?: SearchFilters } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  HostelDetails: { hostelId: string };
  Booking: { hostelId: string; roomTypeId?: string };
  Payment: { bookingId?: string; amount: number; provider?: PaymentProvider };
  PremiumUpgrade: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Messages: undefined;
  MessageThread: { conversationId: string; recipientId: string; hostelId?: string; recipientName?: string };
  PaymentHistory: undefined;
  EditProfile: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};