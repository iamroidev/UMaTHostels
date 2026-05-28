export interface HostelFilters {
  search_query?: string;
  price_range?: { min: number; max: number };
  distance_from_campus?: number;
  amenities?: string[];
  gender_restriction?: 'male' | 'female' | 'mixed';
  rating_min?: number;
  is_featured?: boolean;
}

export interface RoomTypeRecord {
  id?: string;
  name?: string;
  price_per_semester?: number | null;
  available_rooms?: number | null;
  description?: string | null;
  occupancy?: number | null;
}

export interface SupabaseHostelRecord {
  id: string;
  name: string;
  address?: string | null;
  owner_id?: string | null;
  rating?: number | null;
  review_count?: number | null;
  is_featured?: boolean | null;
  images?: string[] | null;
  room_types?: RoomTypeRecord[] | null;
  distance_from_campus?: number | null;
  amenities?: string[] | null;
}

export interface HostelOwnerInfo {
  full_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
}

export interface HostelReviewRecord {
  id: string;
  rating?: number | null;
  comment?: string | null;
  created_at?: string | null;
  user?: {
    full_name?: string | null;
    student_id?: string | null;
  } | null;
}

export interface HostelDetailsRecord extends SupabaseHostelRecord {
  description?: string | null;
  owner?: HostelOwnerInfo | null;
  reviews?: HostelReviewRecord[] | null;
  room_types?: RoomTypeRecord[] | null;
}

export interface HostelCardData {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number };
  imageUrl?: string;
  isPremium?: boolean;
}
