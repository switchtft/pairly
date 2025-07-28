// src/lib/constants.ts
import { Game, Region, TournamentStatus, RankTier } from './types';

export const GAMES: Game[] = [
  {
    id: 'valorant',
    name: 'Valorant',
    imageUrl: '/images/games/valorant.jpg',
    description: 'Tactical 5v5 character-based shooter'
  },
  {
    id: 'league',
    name: 'League of Legends',
    imageUrl: '/images/games/league.jpg',
    description: 'Strategic team-based MOBA'
  },
  {
    id: 'csgo',
    name: 'CS:GO 2',
    imageUrl: '/images/games/csgo.jpg',
    description: 'Competitive tactical FPS'
  }
];

export const REGIONS: readonly Region[] = [
  'All', 
  'North America', 
  'Europe', 
  'Asia', 
  'Global'
] as const;

export const TOURNAMENT_STATUSES: readonly TournamentStatus[] = [
  'All', 
  'Upcoming', 
  'Ongoing', 
  'Completed'
] as const;

export const RANK_TIERS: RankTier = {
  valorant: [
    'Iron', 
    'Bronze', 
    'Silver', 
    'Gold', 
    'Platinum', 
    'Diamond', 
    'Ascendant', 
    'Immortal', 
    'Radiant'
  ],
  league: [
    'Iron', 
    'Bronze', 
    'Silver', 
    'Gold', 
    'Platinum', 
    'Diamond', 
    'Master', 
    'Grandmaster', 
    'Challenger'
  ],
  csgo: [
    'Silver', 
    'Gold Nova', 
    'Master Guardian', 
    'Legendary Eagle', 
    'Supreme', 
    'Global Elite'
  ]
} as const;

// Game-specific pricing configurations
export const GAME_PRICING = {
  valorant: {
    basePrice: 10,
    queuePrice: 10,
    coachingPrice: 25,
  },
  league: {
    basePrice: 12,
    queuePrice: 12,
    coachingPrice: 30,
  },
  csgo: {
    basePrice: 8,
    queuePrice: 8,
    coachingPrice: 22,
  }
} as const;

// Default user preferences
export const DEFAULT_PREFERENCES = {
  selectedGame: 'valorant' as const,
  bundleSize: 1,
  region: 'All' as const,
  sortBy: 'date' as const,
  sortOrder: 'asc' as const,
} as const;

// API endpoints (for future use)
export const API_ENDPOINTS = {
  players: '/api/players',
  coaches: '/api/coaches',
  tournaments: '/api/tournaments',
  queue: '/api/queue',
  auth: '/api/auth',
} as const;

// Queue settings
export const QUEUE_SETTINGS = {
  minMatchTime: 8000, // 8 seconds
  maxMatchTime: 15000, // 15 seconds
  searchUpdateInterval: 1000, // 1 second
  maxBundleSize: 10,
  minBundleSize: 1,
} as const;

// Discount tiers for bundle purchases
export const BUNDLE_DISCOUNTS = [
  { minSize: 1, maxSize: 1, discount: 0 },
  { minSize: 2, maxSize: 3, discount: 0.05 }, // 5%
  { minSize: 4, maxSize: 5, discount: 0.10 }, // 10%
  { minSize: 6, maxSize: 7, discount: 0.15 }, // 15%
  { minSize: 8, maxSize: 10, discount: 0.20 }, // 20%
] as const;