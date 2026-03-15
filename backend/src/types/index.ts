import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  userId?: string;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthData {
  user: UserPublic;
  tokens: AuthTokens;
}

// User
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

// Post
export type GratitudeCategory =
  | 'FAMILY'
  | 'WORK'
  | 'SMALL_JOYS'
  | 'NATURE'
  | 'HEALTH'
  | 'OTHER';

export type PostVisibility = 'PRIVATE' | 'PUBLIC' | 'ANONYMOUS';

export const VALID_CATEGORIES: GratitudeCategory[] = [
  'FAMILY',
  'WORK',
  'SMALL_JOYS',
  'NATURE',
  'HEALTH',
  'OTHER',
];

export const VALID_VISIBILITIES: PostVisibility[] = [
  'PRIVATE',
  'PUBLIC',
  'ANONYMOUS',
];

// Streak
export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  lastPostDate: string | null;
  weekActivity: boolean[];
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
