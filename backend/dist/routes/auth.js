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
const authService = __importStar(require("../services/authService"));
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// POST /api/v1/auth/register
router.post('/register', (0, validate_1.validate)(validation_1.registerSchema), async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const data = await authService.register(email, password, name);
        (0, response_1.success)(res, data, 201);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'REGISTER_ERROR', err.status || 500);
    }
});
// POST /api/v1/auth/login
router.post('/login', (0, validate_1.validate)(validation_1.loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.login(email, password);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'LOGIN_ERROR', err.status || 500);
    }
});
// POST /api/v1/auth/apple
router.post('/apple', (0, validate_1.validate)(validation_1.appleAuthSchema), async (req, res) => {
    try {
        const { identityToken, user } = req.body;
        const data = await authService.signInWithApple(identityToken, user);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'APPLE_AUTH_ERROR', err.status || 500);
    }
});
// POST /api/v1/auth/refresh
router.post('/refresh', (0, validate_1.validate)(validation_1.refreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const data = await authService.refreshTokens(refreshToken);
        (0, response_1.success)(res, data);
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'REFRESH_ERROR', err.status || 500);
    }
});
// POST /api/v1/auth/logout
router.post('/logout', auth_1.authenticate, async (_req, res) => {
    // Stateless JWT — client just discards the token
    (0, response_1.success)(res, { message: 'Logged out successfully' });
});
// GET /api/v1/auth/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await authService.getMe(req.userId);
        (0, response_1.success)(res, { user });
    }
    catch (err) {
        (0, response_1.error)(res, err.message, 'USER_ERROR', err.status || 500);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map