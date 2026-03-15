import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const appleAuthSchema: z.ZodObject<{
    identityToken: z.ZodString;
    user: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        name: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            firstName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        }, {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        email?: string | null | undefined;
        name?: {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        } | null | undefined;
    }, {
        email?: string | null | undefined;
        name?: {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        } | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    identityToken: string;
    user?: {
        email?: string | null | undefined;
        name?: {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
}, {
    identityToken: string;
    user?: {
        email?: string | null | undefined;
        name?: {
            firstName?: string | null | undefined;
            lastName?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const createPostSchema: z.ZodObject<{
    content: z.ZodString;
    feeling: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodEnum<[string, ...string[]]>;
    visibility: z.ZodEnum<[string, ...string[]]>;
    photoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    category: string;
    visibility: string;
    feeling?: string | null | undefined;
    photoUrl?: string | null | undefined;
}, {
    content: string;
    category: string;
    visibility: string;
    feeling?: string | null | undefined;
    photoUrl?: string | null | undefined;
}>;
export declare const updatePostSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    feeling: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    visibility: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    photoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content?: string | undefined;
    feeling?: string | null | undefined;
    category?: string | undefined;
    visibility?: string | undefined;
    photoUrl?: string | null | undefined;
}, {
    content?: string | undefined;
    feeling?: string | null | undefined;
    category?: string | undefined;
    visibility?: string | undefined;
    photoUrl?: string | null | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatarUrl?: string | null | undefined;
}, {
    name?: string | undefined;
    avatarUrl?: string | null | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map