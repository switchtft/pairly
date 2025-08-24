import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, resolving conflicts.
 * Wrapper around `clsx` and `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- NEW HELPER FUNCTIONS ---

/**
 * Creates a URL-friendly "slug" from a string.
 * Example: "My Awesome Post!" -> "my-awesome-post"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
}

/**
 * Generates a cryptographically secure, unique ID.
 * Uses the browser/server's native Crypto API.
 */
export function generateUniqueId(): string {
  return crypto.randomUUID();
}

/**
 * Delays execution for a specified amount of time.
 * Useful with async/await for things like simulating network latency.
 * @param ms - The number of milliseconds to wait.
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// --- IMPROVED FUNCTIONS ---

/**
 * Formats a date into a relative, human-readable string using the Intl API.
 * This is more performant and supports internationalization automatically.
 * @param dateInput - The date to format (Date, string, or number).
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'pl-PL').
 */
export function formatRelativeTime(dateInput: Date | string | number, locale: string = 'en-US'): string {
  // IMPROVEMENT: More robust date parsing.
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid Date";

  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  const diffInDays = diffInSeconds / 86400;

  // IMPROVEMENT: Using Intl.RelativeTimeFormat for better localization and pluralization.
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffInDays) > 365) {
    return rtf.format(-Math.floor(diffInDays / 365), 'year');
  }
  if (Math.abs(diffInDays) > 30) {
    return rtf.format(-Math.floor(diffInDays / 30), 'month');
  }
  if (Math.abs(diffInDays) > 7) {
    return rtf.format(-Math.floor(diffInDays / 7), 'week');
  }
  if (Math.abs(diffInDays) > 1) {
    return rtf.format(-Math.floor(diffInDays), 'day');
  }
  if (Math.abs(diffInSeconds) > 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (Math.abs(diffInSeconds) > 60) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  }
  return rtf.format(-Math.floor(diffInSeconds), 'second');
}

/**
 * Generates an SVG avatar with initials if no image URL is provided.
 * @param name - The user's full name.
 * @param avatarUrl - An optional URL to an existing avatar image.
 */
export function getAvatar(name: string, avatarUrl?: string): { src: string; initials: string } {
  if (avatarUrl) {
    return { src: avatarUrl, initials: '' };
  }

  // IMPROVEMENT: Better initials generation (e.g., "John Doe" -> "JD").
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // IMPROVEMENT: Better color generation for more variety.
  const colors = ["#e53935", "#1e88e5", "#43a047", "#f9a825", "#8e24aa", "#d81b60", "#00897b"];
  const charCodeSum = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = colors[charCodeSum % colors.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text x="50%" y="50%" dy=".1em" text-anchor="middle" dominant-baseline="middle" 
            fill="white" font-family="sans-serif" font-size="40" font-weight="600">
        ${initials}
      </text>
    </svg>`;

  return {
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    initials,
  };
}


/**
 * Returns a Tailwind CSS color class based on a game rank.
 * @param rank - The rank string (case-insensitive).
 */
export function getRankColor(rank?: string | null): string {
  if (!rank) return 'text-muted-foreground';

  // IMPROVEMENT: Grouped by game and made case-insensitive for robustness.
  const rankLower = rank.toLowerCase();
  
  const rankColorMap: Record<string, string> = {
    // Valorant & LoL general tiers
    'iron': 'text-gray-500',
    'bronze': 'text-orange-700',
    'silver': 'text-gray-400',
    'gold': 'text-yellow-500',
    'platinum': 'text-teal-400',
    'diamond': 'text-[#e6915b]',
    // High Tiers
    'ascendant': 'text-green-400',
    'master': 'text-purple-500',
    'grandmaster': 'text-red-600',
    'immortal': 'text-red-500',
    // Top Tier
    'radiant': 'text-yellow-300',
    'challenger': 'text-yellow-300',
    'global elite': 'text-yellow-300',
    'supreme': 'text-red-500',
  };

  return rankColorMap[rankLower] || 'text-foreground';
}

/**
 * Truncates text to a specified length, adding an ellipsis.
 * @param text - The text to truncate.
 * @param maxLength - The maximum length before truncating.
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  // IMPROVEMENT: Handles null/undefined input gracefully.
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}