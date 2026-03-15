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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_2 = require("./config/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const streak_1 = __importDefault(require("./routes/streak"));
const users_1 = __importDefault(require("./routes/users"));
const auth_2 = require("./middleware/auth");
const response_1 = require("./utils/response");
const validation_1 = require("./utils/validation");
const postService = __importStar(require("./services/postService"));
const app = (0, express_1.default)();
// Global middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT' },
    },
});
app.use('/api/', limiter);
// Stricter rate limit for auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { message: 'Too many auth attempts, please try again later', code: 'RATE_LIMIT' },
    },
});
app.use('/api/v1/auth/', authLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/posts', posts_1.default);
app.use('/api/v1/streak', streak_1.default);
app.use('/api/v1/users', users_1.default);
// GET /api/v1/my-wall — Authenticated user's wall
app.get('/api/v1/my-wall', auth_2.authenticate, async (req, res) => {
    try {
        const parsed = validation_1.paginationSchema.safeParse(req.query);
        const { page, limit } = parsed.success ? parsed.data : { page: 1, limit: 20 };
        const visibility = req.query.visibility;
        const data = await postService.getMyWall(req.userId, page, limit, visibility);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'MY_WALL_ERROR', err.status || 500);
    }
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: { message: 'Endpoint not found', code: 'NOT_FOUND' },
    });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map