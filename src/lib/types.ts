// src/lib/types.ts
export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

// User role types
export type UserRole = 'customer' | 'teammate' | 'administrator';

// Profile interfaces for different user types
export interface CustomerProfile {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  balance: number;
  loyaltyLevel: string;
  loyaltyPoints: number;
  gameNicknames: Record<string, string>; // game -> nickname mapping
  socials: {
    discord?: string;
    steam?: string;
    twitter?: string;
  };
  matchHistory: MatchHistoryItem[];
  favouriteTeammates: number[]; // teammate user IDs
  blockedTeammates: number[]; // blocked teammate user IDs
  createdAt: string;
  lastSeen: string;
}

export interface TeammateProfile {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  rating: number;
  totalSessions: number;
  totalReviews: number;
  winRate: number;
  weeklyStats: {
    totalPayment: number;
    orders: number;
    winRate: number;
    leaderboardPosition: number;
  };
  socials: {
    discord?: string;
    steam?: string;
    twitter?: string;
  };
  favouriteCustomers: number[]; // customer user IDs
  blockedCustomers: number[]; // blocked customer user IDs
  isOnline: boolean;
  createdAt: string;
  lastSeen: string;
}

export interface AdministratorProfile {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  permissions: string[];
  createdAt: string;
  lastSeen: string;
}

export interface MatchHistoryItem {
  id: number;
  date: string;
  game: string;
  result: 'win' | 'loss' | 'draw';
  teammateId: number;
  teammateName: string;
  teammateAvatar?: string;
  price: number;
  duration: number;
}

export interface Player {
  id: string;
  name: string;
  rank: string;
  winRate: string;
  mainRole: string;
  secondaryRole: string;
  online: boolean;
  lastOnline: string;
  personalPrice: string;
  inQueue: boolean;
  queuePrice: string;
  game: string;
  avatar?: string;
  verified?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  rank: string;
  rating: number;
  sessions: number;
  specialties: string[];
  hourlyRate: string;
  lastOnline: string;
  avatar?: string;
  verified?: boolean;
  languages?: string[];
  timezone?: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  date: string;
  prize: number;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  region: string;
  entryFee: number;
  description?: string;
  rules?: string[];
  organizer?: string;
}

export interface PriceOption {
  id: string;
  label: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  popular?: boolean;
}

export interface GameWithPricing extends Game {
  priceOptions: PriceOption[];
}

// Type for regions (derived from the constant array)
export type Region = 'All' | 'North America' | 'Europe' | 'Asia' | 'Global';

// Type for tournament statuses
export type TournamentStatus = 'All' | 'Upcoming' | 'Ongoing' | 'Completed';

// Type for supported games
export type GameId = 'valorant' | 'league' | 'csgo';

// Type for rank tiers
export type RankTier = {
  valorant: readonly string[];
  league: readonly string[];
  csgo: readonly string[];
};