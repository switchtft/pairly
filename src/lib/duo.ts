// src/lib/duo.ts
import { z } from 'zod';

// Types
export interface Game {
  id: number;
  name: string;
  slug: string;
  roles: string[];
  ranks: string[];
  champions: Champion[];
  _count: {
    posts: number;
  };
}

export interface Champion {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface DuoPost {
  id: number;
  authorId: number;
  gameId: number;
  inGameName: string;
  rank: string;
  roles: string[];
  lookingFor: string[];
  champions: string[];
  message?: string;
  discord?: string;
  showDiscord: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  views: number;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  game: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface PaginatedPosts {
  posts: DuoPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserPostData {
  activePost: DuoPost | null;
  savedDraft: DuoPost | null;
}

// Validation schemas
export const createPostSchema = z.object({
  gameId: z.number().int().positive(),
  inGameName: z.string().min(1, 'In-game name is required').max(50),
  rank: z.string().min(1, 'Rank is required').max(50),
  roles: z.array(z.string()).min(1, 'At least one role is required').max(5),
  lookingFor: z.array(z.string()).min(1, 'At least one role to look for is required').max(5),
  champions: z.array(z.string()).min(1, 'At least one champion is required').max(3),
  message: z.string().max(500, 'Message too long').optional(),
  discord: z.string().max(50, 'Discord tag too long').optional(),
  showDiscord: z.boolean().default(true),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

// API functions
export async function fetchGames(): Promise<Game[]> {
  const response = await fetch('/api/duo/games');
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  const data = await response.json();
  return data.games;
}

export async function fetchPosts(params?: {
  gameId?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedPosts> {
  const searchParams = new URLSearchParams();
  if (params?.gameId) searchParams.append('gameId', params.gameId.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`/api/duo/posts?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export async function fetchPost(id: number): Promise<DuoPost> {
  const response = await fetch(`/api/duo/posts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  const data = await response.json();
  return data.post;
}

export async function createPost(data: CreatePostData): Promise<DuoPost> {
  const response = await fetch('/api/duo/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create post');
  }

  const result = await response.json();
  return result.post;
}

export async function updatePost(id: number, data: CreatePostData): Promise<DuoPost> {
  const response = await fetch(`/api/duo/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update post');
  }

  const result = await response.json();
  return result.post;
}

export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`/api/duo/posts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete post');
  }
}

export async function fetchUserPost(): Promise<UserPostData> {
  const response = await fetch('/api/duo/my-post');
  if (!response.ok) {
    throw new Error('Failed to fetch user post');
  }
  return response.json();
}

export async function saveDraft(data: CreatePostData): Promise<DuoPost> {
  const response = await fetch('/api/duo/my-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save draft');
  }

  const result = await response.json();
  return result.draft;
}

export async function updateDraft(data: CreatePostData): Promise<DuoPost> {
  const response = await fetch('/api/duo/my-post', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update draft');
  }

  const result = await response.json();
  return result.draft;
}

// Utility functions
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function validateDiscordTag(tag: string): boolean {
  // Basic Discord tag validation (username#0000 or username)
  const discordRegex = /^[a-zA-Z0-9_]{2,32}(#\d{4})?$/;
  return discordRegex.test(tag);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}
