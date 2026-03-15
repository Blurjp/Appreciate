"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.updateProfileSchema = exports.updatePostSchema = exports.createPostSchema = exports.refreshTokenSchema = exports.appleAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.appleAuthSchema = zod_1.z.object({
    identityToken: zod_1.z.string().min(1, 'Identity token is required'),
    user: zod_1.z
        .object({
        email: zod_1.z.string().email().optional().nullable(),
        name: zod_1.z
            .object({
            firstName: zod_1.z.string().optional().nullable(),
            lastName: zod_1.z.string().optional().nullable(),
        })
            .optional()
            .nullable(),
    })
        .optional()
        .nullable(),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.createPostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required').max(5000, 'Content too long'),
    feeling: zod_1.z.string().max(500).optional().nullable(),
    category: zod_1.z.enum(types_1.VALID_CATEGORIES),
    visibility: zod_1.z.enum(types_1.VALID_VISIBILITIES),
    photoUrl: zod_1.z.string().url().optional().nullable(),
});
exports.updatePostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(5000).optional(),
    feeling: zod_1.z.string().max(500).optional().nullable(),
    category: zod_1.z.enum(types_1.VALID_CATEGORIES).optional(),
    visibility: zod_1.z.enum(types_1.VALID_VISIBILITIES).optional(),
    photoUrl: zod_1.z.string().url().optional().nullable(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=validation.js.map