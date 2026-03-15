import { Request } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthData {
    user: UserPublic;
    tokens: AuthTokens;
}
export interface UserPublic {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
}
export type GratitudeCategory = 'FAMILY' | 'WORK' | 'SMALL_JOYS' | 'NATURE' | 'HEALTH' | 'OTHER';
export type PostVisibility = 'PRIVATE' | 'PUBLIC' | 'ANONYMOUS';
export declare const VALID_CATEGORIES: GratitudeCategory[];
export declare const VALID_VISIBILITIES: PostVisibility[];
export interface StreakResponse {
    currentStreak: number;
    longestStreak: number;
    totalPosts: number;
    lastPostDate: string | null;
    weekActivity: boolean[];
}
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
//# sourceMappingURL=index.d.ts.map