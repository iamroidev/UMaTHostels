import type { HostelCardData, SupabaseHostelRecord } from '../types/hostels';

const DEFAULT_ADDRESS = 'Tarkwa, Ghana';

export const mapHostelToCardData = (hostel: SupabaseHostelRecord): HostelCardData => {
  const roomTypes = hostel.room_types ?? [];
  const prices = roomTypes
    .map((room) => Number(room.price_per_semester) || 0)
    .filter((price) => Number.isFinite(price) && price > 0);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : minPrice;

  return {
    id: hostel.id,
    name: hostel.name,
    address: hostel.address ?? DEFAULT_ADDRESS,
    rating: hostel.rating ? Number(hostel.rating) : 0,
    reviewCount: hostel.review_count ? Number(hostel.review_count) : 0,
    priceRange: {
      min: minPrice,
      max: maxPrice,
    },
    imageUrl: hostel.images?.[0] ?? undefined,
    isPremium: Boolean(hostel.is_featured),
  };
};

export const mapHostelsToCardData = (hostels: SupabaseHostelRecord[] = []): HostelCardData[] => {
  return hostels.map(mapHostelToCardData);
};
