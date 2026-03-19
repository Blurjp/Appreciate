"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const streak_1 = __importDefault(require("./routes/streak"));
const users_1 = __importDefault(require("./routes/users"));
const ai_1 = __importDefault(require("./routes/ai"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
// Middleware
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/posts', posts_1.default);
app.use('/api/v1/streak', streak_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/ai', ai_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Appreciate API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map