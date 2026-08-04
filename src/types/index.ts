export type TravelerType = 'Solo' | 'Women Solo' | 'Couple' | 'Family' | 'Friends' | 'Digital Nomad';

export type TransportMode = 'Flight' | 'Train' | 'Car' | 'Bus' | 'Metro' | 'Walking';

export type PreferenceType = 
  | 'Nature' 
  | 'Adventure' 
  | 'Luxury' 
  | 'Budget' 
  | 'Photography' 
  | 'Food & Cafes' 
  | 'Nightlife' 
  | 'Hidden Gems'
  | 'Cultural & Heritage'
  | 'Shopping';

export interface ItineraryItem {
  id: string;
  timeOfDay: 'Morning' | 'Breakfast' | 'Afternoon' | 'Lunch' | 'Evening' | 'Dinner' | 'Night';
  title: string;
  description: string;
  category: 'Attraction' | 'Food' | 'Stay' | 'Transport' | 'Shopping' | 'Hidden Gem' | 'Activity';
  cost: number;
  duration: string;
  location: string;
  lat?: number;
  lng?: number;
  isCompleted?: boolean;
  safetyScore?: number;
  isWomenFriendly?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  date: string;
  items: ItineraryItem[];
  dayExpense: number;
  alternativePlan?: string;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  shopping: number;
  emergency: number;
  taxes: number;
  total: number;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  budgetTotal: number;
  spentTotal: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  travelersCount: number;
  travelType: TravelerType;
  transportMode: TransportMode;
  preferences: PreferenceType[];
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  days: ItineraryDay[];
  budgetBreakdown: BudgetBreakdown;
  safetyScore: number;
  createdAt: string;
}

export interface CommunityReview {
  id: string;
  userName: string;
  userAvatar: string;
  userBadge: string;
  destination: string;
  placeName: string;
  category: 'Hotel' | 'Restaurant' | 'Hidden Gem' | 'Scam Alert' | 'Safety Tip' | 'Budget Hack';
  rating: number;
  safetyScore: number;
  comment: string;
  photos: string[];
  actualExpense?: number;
  scamWarning?: string;
  upvotes: number;
  coinsEarned: number;
  createdAt: string;
}

export interface HiddenGem {
  id: string;
  title: string;
  destination: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  image: string;
  rating: number;
  crowdLevel: 'Low' | 'Moderate' | 'High';
  bestTime: string;
  isWomenSafe: boolean;
}

export interface SafetyZone {
  id: string;
  name: string;
  city: string;
  safetyScore: number;
  lightingScore: number; // 1 - 10
  crowdDensity: 'High' | 'Moderate' | 'Low';
  hasPolicePatrol: boolean;
  hasHospitalNearby: boolean;
  verifiedSafeHotels: string[];
  verifiedSafeCafes: string[];
  description: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coins: number;
  level: number;
  rankTitle: string; // 'Top Explorer' | 'Trusted Traveller' | 'Community Hero'
  tripsCompleted: number;
  countriesVisited: number;
  citiesVisited: number;
  distanceKm: number;
  badges: { name: string; icon: string; description: string; unlockedAt: string }[];
  wishlist: string[];
}
