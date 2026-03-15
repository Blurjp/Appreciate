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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validation_1 = require("../utils/validation");
const response_1 = require("../utils/response");
const database_1 = __importDefault(require("../config/database"));
const postService = __importStar(require("../services/postService"));
const router = (0, express_1.Router)();
// PATCH /api/v1/users/profile — Update own profile (must be before /:id)
router.patch('/profile', auth_1.authenticate, (0, validate_1.validate)(validation_1.updateProfileSchema), async (req, res) => {
    try {
        const user = await database_1.default.user.update({
            where: { id: req.userId },
            data: req.body,
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        (0, response_1.success)(res, { user });
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'PROFILE_UPDATE_ERROR', err.status || 500);
    }
});
// GET /api/v1/users/:id — Get user public info
router.get('/:id', async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                _count: { select: { posts: true } },
            },
        });
        if (!user) {
            (0, response_1.error)(res, 'User not found', 'USER_NOT_FOUND', 404);
            return;
        }
        (0, response_1.success)(res, {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            totalPosts: user._count.posts,
        });
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'USER_ERROR', err.status || 500);
    }
});
// GET /api/v1/users/:id/wall — Get user's public wall
router.get('/:id/wall', async (req, res) => {
    try {
        const parsed = validation_1.paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const data = await postService.getUserPublicWall(req.params.id, page, limit);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'WALL_ERROR', err.status || 500);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map