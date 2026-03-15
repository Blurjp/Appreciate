"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validation_1 = require("../utils/validation");
const postService = __importStar(require("../services/postService"));
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// GET /api/v1/posts — Public feed
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const parsed = validation_1.paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const category = req.query.category;
        const data = await postService.getPublicFeed(page, limit, category);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'FEED_ERROR', err.status || 500);
    }
});
// POST /api/v1/posts — Create post
router.post('/', auth_1.authenticate, (0, validate_1.validate)(validation_1.createPostSchema), async (req, res) => {
    try {
        const post = await postService.createPost(req.userId, req.body);
        (0, response_1.success)(res, post, 201);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'CREATE_POST_ERROR', err.status || 500);
    }
});
// GET /api/v1/posts/:id — Get single post
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await postService.getPostById(postId, req.userId);
        (0, response_1.success)(res, post);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'GET_POST_ERROR', err.status || 500);
    }
});
// PATCH /api/v1/posts/:id — Update post
router.patch('/:id', auth_1.authenticate, (0, validate_1.validate)(validation_1.updatePostSchema), async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.userId, req.body);
        (0, response_1.success)(res, post);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'UPDATE_POST_ERROR', err.status || 500);
    }
});
// DELETE /api/v1/posts/:id — Delete post
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        await postService.deletePost(req.params.id, req.userId);
        (0, response_1.success)(res, { message: 'Post deleted' });
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'DELETE_POST_ERROR', err.status || 500);
    }
});
// POST /api/v1/posts/:id/heart — Heart/like a post
router.post('/:id/heart', auth_1.authenticate, async (req, res) => {
    try {
        const result = await postService.heartPost(req.params.id, req.userId);
        (0, response_1.success)(res, result);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'HEART_ERROR', err.status || 500);
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map