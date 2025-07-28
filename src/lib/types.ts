// src/lib/types.ts
export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
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