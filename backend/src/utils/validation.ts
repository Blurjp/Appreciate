import { z } from 'zod';
import { VALID_CATEGORIES, VALID_VISIBILITIES } from '../types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const appleAuthSchema = z.object({
  identityToken: z.string().min(1, 'Identity token is required'),
  user: z
    .object({
      email: z.string().email().optional().nullable(),
      name: z
        .object({
          firstName: z.string().optional().nullable(),
          lastName: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  feeling: z.string().max(500).optional().nullable(),
  category: z.enum(VALID_CATEGORIES as [string, ...string[]]),
  visibility: z.enum(VALID_VISIBILITIES as [string, ...string[]]),
  photoUrl: z.string().url().optional().nullable(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  feeling: z.string().max(500).optional().nullable(),
  category: z.enum(VALID_CATEGORIES as [string, ...string[]]).optional(),
  visibility: z.enum(VALID_VISIBILITIES as [string, ...string[]]).optional(),
  photoUrl: z.string().url().optional().nullable(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
