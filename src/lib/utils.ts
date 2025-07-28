// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with proper locale support
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date with relative time support
export function formatDate(dateString: string, options?: {
  relative?: boolean;
  locale?: string;
}): string {
  const date = new Date(dateString);
  const { relative = false, locale = 'en-US' } = options || {};
  
  if (relative) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
  
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Generate avatar URL or initials
export function getAvatarUrl(name: string, avatarUrl?: string): string {
  if (avatarUrl) return avatarUrl;
  
  // Generate a consistent color based on name
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[hash % colors.length];
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${colorClass.replace('bg-', '').replace('-500', '')}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            fill="white" font-family="system-ui" font-size="16" font-weight="bold">
        ${name.charAt(0).toUpperCase()}
      </text>
    </svg>
  `)}`;
}

// Calculate bundle discount using the discount tiers
export function calculateBundleDiscount(bundleSize: number, basePrice: number): {
  totalPrice: number;
  originalPrice: number;
  discountPercent: number;
  savings: number;
} {
  const originalPrice = bundleSize * basePrice;
  
  // Find the appropriate discount tier
  const discountTier = [
    { minSize: 1, maxSize: 1, discount: 0 },
    { minSize: 2, maxSize: 3, discount: 0.05 }, // 5%
    { minSize: 4, maxSize: 5, discount: 0.10 }, // 10%
    { minSize: 6, maxSize: 7, discount: 0.15 }, // 15%
    { minSize: 8, maxSize: 10, discount: 0.20 }, // 20%
  ].find(tier => bundleSize >= tier.minSize && bundleSize <= tier.maxSize);
  
  const discount = discountTier?.discount || 0;
  const discountPercent = Math.round(discount * 100);
  const savings = originalPrice * discount;
  const totalPrice = originalPrice - savings;
  
  return {
    totalPrice,
    originalPrice,
    discountPercent,
    savings
  };
}

// Validate game ID
export function isValidGameId(gameId: string): boolean {
  const validGameIds = ['valorant', 'league', 'csgo'];
  return validGameIds.includes(gameId);
}

// Get rank color based on rank tier
export function getRankColor(rank: string): string {
  const rankColors: Record<string, string> = {
    // Valorant
    'Iron': 'text-gray-400',
    'Bronze': 'text-amber-600',
    'Silver': 'text-gray-300',
    'Gold': 'text-yellow-400',
    'Platinum': 'text-cyan-400',
    'Diamond': 'text-purple-400',
    'Ascendant': 'text-green-400',
    'Immortal': 'text-red-400',
    'Radiant': 'text-yellow-300',
    
    // League of Legends
    'Challenger': 'text-yellow-300',
    'Grandmaster': 'text-red-400',
    'Master': 'text-purple-400',
    
    // CS:GO
    'Global Elite': 'text-yellow-300',
    'Supreme': 'text-red-400',
  };
  
  return rankColors[rank] || 'text-blue-400';
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Parse query parameters
export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// Format win rate percentage
export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((wins / total) * 100);
  return `${percentage}%`;
}