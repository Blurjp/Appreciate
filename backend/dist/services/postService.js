"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicFeed = getPublicFeed;
exports.getMyWall = getMyWall;
exports.getPostById = getPostById;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.heartPost = heartPost;
exports.getUserPublicWall = getUserPublicWall;
const database_1 = __importDefault(require("../config/database"));
const streakService_1 = require("./streakService");
function formatPost(post) {
    // For anonymous posts, hide author info
    if (post.visibility === 'ANONYMOUS') {
        return {
            ...post,
            author: { id: post.author.id, name: 'Anonymous', avatarUrl: null },
        };
    }
    return post;
}
const authorSelect = {
    id: true,
    name: true,
    avatarUrl: true,
};
async function getPublicFeed(page, limit, category) {
    const where = {
        visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
    };
    if (category) {
        where.category = category;
    }
    const [items, total] = await Promise.all([
        database_1.default.gratitudePost.findMany({
            where,
            include: { author: { select: authorSelect } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        database_1.default.gratitudePost.count({ where }),
    ]);
    return {
        items: items.map(formatPost),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getMyWall(userId, page, limit, visibility) {
    const where = { authorId: userId };
    if (visibility) {
        where.visibility = visibility;
    }
    const [items, total] = await Promise.all([
        database_1.default.gratitudePost.findMany({
            where,
            include: { author: { select: authorSelect } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        database_1.default.gratitudePost.count({ where }),
    ]);
    return {
        items: items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
async function getPostById(postId, requesterId) {
    const post = await database_1.default.gratitudePost.findUnique({
        where: { id: postId },
        include: { author: { select: authorSelect } },
    });
    if (!post) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }
    // Private posts only visible to author
    if (post.visibility === 'PRIVATE' && post.authorId !== requesterId) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }
    return formatPost(post);
}
async function createPost(userId, data) {
    const post = await database_1.default.gratitudePost.create({
        data: {
            content: data.content,
            feeling: data.feeling ?? null,
            category: data.category,
            visibility: data.visibility,
            photoUrl: data.photoUrl ?? null,
            authorId: userId,
        },
        include: { author: { select: authorSelect } },
    });
    // Update streak in background
    (0, streakService_1.updateStreak)(userId).catch((err) => console.error('[Streak update failed]', err));
    return formatPost(post);
}
async function updatePost(postId, userId, data) {
    const existing = await database_1.default.gratitudePost.findUnique({
        where: { id: postId },
    });
    if (!existing) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }
    if (existing.authorId !== userId) {
        const err = new Error('Not authorized to update this post');
        err.status = 403;
        throw err;
    }
    const post = await database_1.default.gratitudePost.update({
        where: { id: postId },
        data,
        include: { author: { select: authorSelect } },
    });
    return formatPost(post);
}
async function deletePost(postId, userId) {
    const existing = await database_1.default.gratitudePost.findUnique({
        where: { id: postId },
    });
    if (!existing) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }
    if (existing.authorId !== userId) {
        const err = new Error('Not authorized to delete this post');
        err.status = 403;
        throw err;
    }
    await database_1.default.gratitudePost.delete({ where: { id: postId } });
}
async function heartPost(postId, _userId) {
    const existing = await database_1.default.gratitudePost.findUnique({
        where: { id: postId },
    });
    if (!existing) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }
    const post = await database_1.default.gratitudePost.update({
        where: { id: postId },
        data: { heartCount: { increment: 1 } },
    });
    return { heartCount: post.heartCount };
}
async function getUserPublicWall(userId, page, limit) {
    const where = {
        authorId: userId,
        visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
    };
    const [items, total] = await Promise.all([
        database_1.default.gratitudePost.findMany({
            where,
            include: { author: { select: authorSelect } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        database_1.default.gratitudePost.count({ where }),
    ]);
    return {
        items: items.map(formatPost),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=postService.js.map