// src/lib/index.ts
// Re-export all types
export type {
  Game,
  Player,
  Coach,
  Tournament,
  PriceOption,
  GameWithPricing,
  Region,
  TournamentStatus,
  GameId,
  RankTier
} from './types';

// Re-export all constants
export {
  GAMES,
  REGIONS,
  TOURNAMENT_STATUSES,
  RANK_TIERS,
  GAME_PRICING,
  DEFAULT_PREFERENCES,
  API_ENDPOINTS,
  QUEUE_SETTINGS,
  BUNDLE_DISCOUNTS
} from './constants';

// Re-export all utilities
export {
  cn,
  formatCurrency,
  formatDate,
  debounce,
  getAvatarUrl,
  calculateBundleDiscount,
  isValidGameId,
  getRankColor,
  generateId,
  truncateText,
  parseQueryParams,
  formatWinRate
} from './utils';